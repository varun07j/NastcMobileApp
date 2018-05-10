/// core
import * as HTTP from "tns-core-modules/http";
import { Page } from "tns-core-modules/ui/page";
import { topmost } from "tns-core-modules/ui/frame";
import { View } from "tns-core-modules/ui/core/view";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import { Observable, EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view";
import { TextField } from "tns-core-modules/ui/text-field";
import { confirm } from "tns-core-modules/ui/dialogs";
import { Button } from "tns-core-modules/ui/button";
import {
  SelectedIndexChangedEventData,
  SegmentedBar
} from "tns-core-modules/ui/segmented-bar";
/// plugins
import * as moment from "moment";
import { DropDown } from "nativescript-drop-down/drop-down";
import { classList } from "nativescript-dom";
/// interfaces
import { FuelStop } from "../../models";
/// services
import {
  DialogService,
  LoggingService,
  CLog,
  FeedbackService,
  LocationService,
  NavigationService,
  ProgressService,
  FavoriteStopsService,
  QpnLocationsService
} from "../../services";
/// utils
import {
  EventInfo,
  EventListeners,
  debounce,
  BaseUrl,
  HttpTimeout,
  ObservableProperty
} from "../../utils";

declare var UITableViewCellSelectionStyleNone: any;

export class QpnMainViewModel extends Observable {
  @ObservableProperty() public searchText: string;
  @ObservableProperty() public isSearchBarVisible: boolean;
  @ObservableProperty() public infoMessage: string;
  @ObservableProperty() public selectedDate: string;
  @ObservableProperty() public selectedStateIndex: number;
  @ObservableProperty() public dateSelectedIndex: number;
  @ObservableProperty() public stateList: string[];
  @ObservableProperty() public fuelstops: ObservableArray<FuelStop>;
  @ObservableProperty()
  public _lastFetchedFullPriceList: ObservableArray<FuelStop>;
  private _fuelStopListView: ListView;
  private _feedbackService: FeedbackService;
  private _events: EventInfo[];

  constructor(page: Page) {
    super();
    this._feedbackService = new FeedbackService();
    LoggingService.Add_ScreenView(NavigationService.MODULES.QpnMain);
    this.searchText = "";
    this.isSearchBarVisible = false;
    // Setup the Date Segmented bar
    this.dateSelectedIndex = 1;
    // Might move this to an HTTP GET to get our server date instead of relying on device
    const date = moment() as moment.Moment;
    this.selectedDate = date.format("MM-DD-YYYY");
    /// Setup the state dropdown
    const states = [] as string[];
    const items = LocationService.UsStatesList;

    // Add the favorite stops option *** make sure it's not already there when navigating BACK to this page ***
    if (items[0].display === "Alabama") {
      items.unshift(
        { display: "All Locations", value: "ALL" },
        { display: "Favorite Stops", value: "FAVORITES" }
      );
    }

    for (let i = 0; i < items.length; i++) {
      states.push(items[i].display);
    }
    this.stateList = states;
    // Default the list to Alabama
    this.selectedStateIndex = 0;

    /// Make request to get pricing
    this._getFuelPricing();

    // Bind events, and store for later unbinding:
    this._events = EventListeners.bindEvents([
      {
        eventName: "textChange",
        view: page.getViewById("qpnSearchTextField") as View,
        eventHandler: debounce(this._onQpnSearchTextChange, 450),
        viewModel: this
      },
      {
        eventName: DropDown.selectedIndexChangedEvent,
        view: page.getViewById("stateDropDown"),
        eventHandler: this._onDropDownIndexChanged,
        viewModel: this
      },
      {
        eventName: SegmentedBar.selectedIndexChangedEvent,
        view: page.getViewById("dateSegBar"),
        eventHandler: this._onDateSegBarIndexChange,
        viewModel: this
      }
    ]);

    this._fuelStopListView = page.getViewById("fuelstopListView") as ListView;
  }

  public onPageUnloaded(args) {
    const page = args.object as Page;
    page.bindingContext = null;
    EventListeners.unbindEvents(this._events);
    this._fuelStopListView.items = null;
    page.bindingContext = null;
  }

  /**
   * Shows the searchbar in the actionbar.
   */
  public onSearchActionItemTap() {
    this.isSearchBarVisible = true;
    topmost().currentPage.actionBar.navigationButton.visibility = "collapse";
    topmost().currentPage.actionBar.title = "";
    const searchTextField = topmost().currentPage.getViewById(
      "qpnSearchTextField"
    ) as TextField;
    searchTextField.focus();
    // hide the fab also
    const fab = topmost().currentPage.getViewById("mapFab") as View;
    fab.visibility = "collapse";
  }

  /**
   * Clears the search text field input and hides the search.
   */
  public onClearSearchText() {
    this.searchText = "";
    this.isSearchBarVisible = false;
    topmost().currentPage.actionBar.navigationButton.visibility = "visible";
    topmost().currentPage.actionBar.title = "QPN";
    const searchTextField = topmost().currentPage.getViewById(
      "qpnSearchTextField"
    ) as TextField;
    searchTextField.dismissSoftInput();
    // show the fab
    const fab = topmost().currentPage.getViewById("mapFab") as View;
    fab.visibility = "visible";
  }

  public openLocationDropDown() {
    const dd = topmost().currentPage.getViewById("stateDropDown") as DropDown;
    dd.open();
  }

  /**
   * Null the fuel stop listview items collection.
   */
  private _emptyFuelPriceListView() {
    return new Promise((resolve, reject) => {
      this._fuelStopListView.items = null;
      resolve();
    });
  }

  /**
   * Get QPN Fuel pricing.
   */
  private async _getFuelPricing() {
    try {
      ProgressService.showSimpleSpinner("Getting fuel pricing...");

      this.infoMessage = ""; // reset to collapse on UI
      let requestUrl: string = "";
      /// TODO - Check if pricing is cached so we don't constantly use network data.
      const selectedState =
        LocationService.UsStatesList[this.selectedStateIndex].value;
      const selectedDate = this.selectedDate;

      // If favorite stops - create the queryString params
      if (selectedState.toLowerCase() === "favorites") {
        const favoriteStopsArray = await FavoriteStopsService.getFavoriteFuelStops();

        /// here we know if the user has favorite stops or not
        if (favoriteStopsArray.length < 1) {
          this.infoMessage = `Looks like you don't have any favorite stops yet. Please mark some favorite stops or change the dropdown to a specific state to view pricing.`;
          return;
        }

        let merchantStringParams = "";
        for (let j = favoriteStopsArray.length; j--; ) {
          merchantStringParams += `merchants=${
            favoriteStopsArray[j].merchant
          }&`;
        }

        requestUrl = `${BaseUrl}api/QPN/GetFavStopsPricing?${merchantStringParams}requestDate=${selectedDate}`;
      } else {
        requestUrl = `${BaseUrl}api/QPN/GetQPNpricing?state=${selectedState}&requestDate=${selectedDate}`;
      }

      // send the HTTP request
      const result = await HTTP.request({
        url: requestUrl,
        method: "GET",
        timeout: HttpTimeout
      });

      if (result.statusCode === 200) {
        const data = result.content.toJSON() as ObservableArray<FuelStop>;

        // Set the fuel stops list
        this.fuelstops = data;
        // keep a referencing to the fetched data to allow
        // local filtering and keeping the data fresh
        this._lastFetchedFullPriceList = this.fuelstops;

        // Modify the array with users favorite stops saved
        FavoriteStopsService.modifyStopsWithFavorites(this.fuelstops);
      } else {
        const data = result.content.toJSON();
        const errorMsg = data.Message
          ? data.Message
          : "Ooops! An error occurred getting fuel pricing. Please try again.";
        this._feedbackService.error(errorMsg);

        LoggingService.Log_Exception({
          module: NavigationService.MODULES.QpnMain,
          method: "getFuelPricing",
          message: `StatusCode: ${result.statusCode} \n ${JSON.stringify(
            result
          )}`
        });
      }
    } catch (error) {
      this._feedbackService.error(
        "An unexpected error occurred getting fuel pricing. Please try again."
      );
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.QpnMain,
        method: "getFuelPricing",
        message: JSON.stringify(error)
      });
    } finally {
      ProgressService.hideSpinner();
    }
  }

  /**
   * onItemLoading event for the listview items
   */
  public onItemLoading(args: ItemEventData) {
    /// just disabling the iOS item selection highlighting
    if (isIOS) {
      const cell = args.ios;
      if (cell) {
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
      }
    }
  }

  public callQpnLocation(args: EventData) {
    const stop = (args.object as any).bindingContext as FuelStop;
    QpnLocationsService.callQpnLocation(stop);
  }

  public favoriteStopToggle(args: EventData) {
    const btn = args.object as Button;
    const stop = (args.object as any).bindingContext as FuelStop;
    FavoriteStopsService.favoriteStopToggle(stop, btn);
  }

  public navigateToQpnStop(args: EventData) {
    const stop = (args.object as any).bindingContext as FuelStop;
    QpnLocationsService.navigateToQpnLocation(stop);
  }

  public shareFuelStop(args: EventData) {
    const stop = (args.object as any).bindingContext as FuelStop;
    QpnLocationsService.shareQpnLocation(stop);
  }

  public fabTap() {
    NavigationService.GoTo(NavigationService.MODULES.RoutePlanner);
  }

  public goBack() {
    NavigationService.GoBack();
  }

  /**
   * Date segmented bar change handler to update pricing for new date.
   * @param args
   */
  private async _onDateSegBarIndexChange(args: SelectedIndexChangedEventData) {
    /// if the index doesn't change we don't fire
    if (args.oldIndex === args.newIndex) {
      return;
    }

    /// Check the index of the segmented bar and get pricing for that date
    if (args.newIndex === 0) {
      /// YESTERDAY PRICING
      await this._emptyFuelPriceListView();
      this.selectedDate = moment()
        .subtract(1, "days")
        .format("MM/DD/YYYY");
      this._getFuelPricing();
    } else if (args.newIndex === 1) {
      /// TODAY PRICING
      await this._emptyFuelPriceListView();
      this.selectedDate = moment().format("MM/DD/YYYY");
      this._getFuelPricing();
    } else if (args.newIndex === 2) {
      /// TOMORROW PRICING

      await this._emptyFuelPriceListView();
      this.selectedDate = moment()
        .add(1, "days")
        .format("MM/DD/YYYY");
      this._getFuelPricing();

      /// show user the QpnPricingTomorrowInfoMessage
      // const resp: any = await HTTP.getJSON(
      //   `${BaseUrl}resources/nastc-mobile/nastc-app.json`
      // );
      // .then((resp: any) => {
      // new Toasty(`${resp.QpnTomorrowPricingInfoMessage}`, 3500).show();
      // });
    }
  }

  /**
   * State dropdown, if change query to update the list data pricing.
   * @param args
   */
  private async _onDropDownIndexChanged(args: EventData) {
    // empty the listview
    await this._emptyFuelPriceListView();
    this.selectedStateIndex = (args.object as DropDown).selectedIndex;
    this._getFuelPricing();
  }

  private _onQpnSearchTextChange(args) {
    try {
      const searchText = (args.object as any).text as string;
      CLog(`Search Text = ${searchText}`);
      // if no text we don't need to query server and just go back to the default list
      if (searchText === "" || searchText === null) {
        this.fuelstops = this._lastFetchedFullPriceList;
        return;
      } else {
        // simplify the string to improve query
        const text = searchText
          .toLowerCase()
          .trim()
          .replace(/\s/g, "")
          .replace(/-/g, "");
        const results = new ObservableArray<FuelStop>();

        // filter the list
        // will check if we have the value and then string match using indexOf
        this._lastFetchedFullPriceList.forEach(x => {
          if (x) {
            if (
              (x.name && this._matchTextOnString(x.name, text)) ||
              ((x.location && this._matchTextOnString(x.location, text)) ||
                (x.city && this._matchTextOnString(x.city, text)))
            ) {
              results.push(x);
            }
          }
        });

        // update the listview binded items
        this.fuelstops = results;
      }
    } catch (error) {
      CLog(error);
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.QpnMain,
        method: "_onQpnSearchTextChange",
        message: error
      });
    }
  }

  /**
   * Converts a string to lowercase, trims, removes spaces and hypens.
   * Then checks if the string contains the query argument string value.
   * @param value
   * @param query
   */
  private _matchTextOnString(value: string, query: string) {
    if (value && query) {
      const newString = value
        .toLowerCase()
        .trim()
        .replace(/\s/g, "")
        .replace(/-/g, "");
      const result = newString.indexOf(query) >= 0;
      return result;
    }
  }
}
