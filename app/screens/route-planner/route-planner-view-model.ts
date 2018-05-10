// core
import { Page } from "tns-core-modules/ui/page";
import {
  Observable,
  PropertyChangeData,
  EventData
} from "tns-core-modules/data/observable";
import { View } from "tns-core-modules/ui/core/view";
import { Button } from "tns-core-modules/ui/button";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { topmost } from "tns-core-modules/ui/frame";
import { screen } from "tns-core-modules/platform";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import {
  confirm,
  ConfirmOptions,
  action,
  ActionOptions
} from "tns-core-modules/ui/dialogs";
// plugins
import * as SocialShare from "nativescript-social-share";
import {
  MapboxView,
  MapboxMarker,
  SetCenterOptions,
  SetZoomLevelOptions
} from "nativescript-mapbox";
import { Location } from "nativescript-geolocation";
import { Toasty } from "nativescript-toasty";
import { TwitterBang, ITwitterBangOptions } from "nativescript-twitterbang";
// models
import {
  Route,
  FuelStop,
  QpnMapPointsAndMarkers,
  QualityPlusNetworkLocation
} from "../../models";
// services
import * as SERVICES from "../../services";
// utils
import * as UTILS from "../../utils";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

declare var UITableViewCellSelectionStyleNone: any;

export class RoutePlannerViewModel extends Observable {
  @UTILS.ObservableProperty() public currentPageTitle: string;
  @UTILS.ObservableProperty() public viewMode: boolean;
  @UTILS.ObservableProperty() public noQpnMarkerText: string;
  @UTILS.ObservableProperty() public origin: string;
  @UTILS.ObservableProperty() public originErrorMsg: string;
  @UTILS.ObservableProperty() public destination: string;
  @UTILS.ObservableProperty() public destinationErrorMsg: string;
  @UTILS.ObservableProperty() public routingEngine: boolean;
  @UTILS.ObservableProperty() public selected_stop: QualityPlusNetworkLocation;
  @UTILS.ObservableProperty()
  public currentQpnMarkers: ObservableArray<FuelStop>;
  @UTILS.ObservableProperty() public mapStyle;
  @UTILS.ObservableProperty() public viewingRoute: boolean;
  @UTILS.ObservableProperty() public routePlannerOpen: boolean;
  private _userService = new SERVICES.UserService();
  private _locationService = new SERVICES.LocationService();
  private _qpnLocationService = new SERVICES.QpnLocationsService();
  private _feedbackService = new SERVICES.FeedbackService();
  private _mapboxView: MapboxView;
  private _events: UTILS.EventInfo[];
  private _currentLocation;
  private _currentPolylineId: number;

  constructor(page: Page) {
    super();
    SERVICES.LoggingService.Add_ScreenView(
      SERVICES.NavigationService.MODULES.RoutePlanner
    );
    this.currentPageTitle = "Route Planner";
    this.viewMode = true;
    this.noQpnMarkerText = ""; // use this to tell user no markers are on the map currently
    this.origin = "";
    this.destination = "";
    this.originErrorMsg = "";
    this.destinationErrorMsg = "";
    this.routingEngine = false; // default to promiles
    const mapstyleEnum = SERVICES.MappingService.getMapBoxStyleEnum(
      this._userService.mapboxStyle
    );
    this.mapStyle = mapstyleEnum;
    this.viewingRoute = false;
    this.routePlannerOpen = false;

    // Bind events, and store for later unbinding:
    this._events = UTILS.EventListeners.bindEvents([
      {
        eventName: "textChange",
        view: page.getViewById("originTextField") as View,
        eventHandler: this._onOriginChange,
        viewModel: this
      },
      {
        eventName: "textChange",
        view: page.getViewById("destinationTextField") as View,
        eventHandler: this._onDestinationChange,
        viewModel: this
      },
      {
        eventName: "checkedChange",
        view: page.getViewById("routingEngineCheck") as View,
        eventHandler: this._onRoutingEngineSwitchChanged,
        viewModel: this
      }
    ]);
  }

  public onPageUnloaded(args: EventData): void {
    UTILS.EventListeners.unbindEvents(this._events);
    // const page = args.object as Page;
    // page.bindingContext = null;
  }

  public toggleViewMode() {
    this.viewMode = !this.viewMode;
    this.currentPageTitle = this.viewMode ? "Route Planner" : "Map Markers";

    if (this.viewMode === false) {
      topmost().currentPage.actionBar.navigationButton.visibility = "collapse";
    } else {
      topmost().currentPage.actionBar.navigationButton.visibility = "visible";
    }
  }

  public async onMapReady(args) {
    this._mapboxView = args.object;
    await this.loadCachedQpnLocations();
    await this.getCurrentLocation();
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
    SERVICES.QpnLocationsService.callQpnLocation(stop);
  }

  public async favoriteStopToggle(args: EventData) {
    const btn = args.object as Button;
    const stop = (args.object as any).bindingContext as FuelStop;
    SERVICES.FavoriteStopsService.favoriteStopToggle(stop, btn);
  }

  public async navigateToQpnStop(args: EventData) {
    const stop = (args.object as any).bindingContext as FuelStop;
    SERVICES.QpnLocationsService.navigateToQpnLocation(stop);
  }

  public shareFuelStop(args: EventData) {
    const stop = (args.object as any).bindingContext as FuelStop;
    SERVICES.QpnLocationsService.shareQpnLocation(stop);
  }

  public prevStop() {
    let index = (this.currentQpnMarkers as any).findIndex(
      x => x.id === this.selected_stop.id
    );
    if (index > 0) {
      index--;
    } else {
      index = this.currentQpnMarkers.length - 1;
    }

    this._setCurrentSelectedQpnStop(index);
  }

  public nextStop() {
    let index = (this.currentQpnMarkers as any).findIndex(
      x => x.id === this.selected_stop.id
    );
    if (index < this.currentQpnMarkers.length - 1) {
      index++;
    } else {
      index = 0;
    }

    this._setCurrentSelectedQpnStop(index);
  }

  public async getCurrentLocation() {
    try {
      if (this.viewingRoute === true) {
        this.viewingRoute = false;
        // remove the old markers if any
        await this._mapboxView.removeMarkers();
        await this.loadCachedQpnLocations();
      }

      // if the location service is not enabled, let's prompt the user
      if (!this._locationService.isLocationEnabled()) {
        const confirmResult = await confirm({
          message: "Would you like to enable your location services?",
          okButtonText: "Yes",
          cancelButtonText: "No"
        });
        SERVICES.CLog(`confirmResult = `, confirmResult);
        if (confirmResult !== true) {
          return;
        }
        // user confirmed so enable location
        await this._locationService.enableLocation();
      }

      this._currentLocation = await this._locationService
        .getDeviceLocation()
        .catch(async err => {
          // on error/reject set the center of the map
          this._feedbackService.info(
            "Unable to get your current location. Make sure your GPS/location service is enabled on your device."
          );
        });

      await this._mapboxView.setCenter({
        lat: this._currentLocation.latitude,
        lng: this._currentLocation.longitude,
        animated: false
      });
      await this._mapboxView.setZoomLevel({
        level: 8,
        animated: false
      });

      // now we will populate the user's current location by reverse geocoding the result
      const reversedLocation: any = await this._locationService.reverseGeocode(
        this._currentLocation.latitude,
        this._currentLocation.longitude
      );

      SERVICES.CLog(`reversedLocation`, JSON.stringify(reversedLocation));

      const postCodeLocation = SERVICES.MappingService.parseMapBoxGeocodeResponse(
        reversedLocation
      );

      // replace the United States from string
      this.origin = postCodeLocation.replace(", United States", "");

      return;
    } catch (error) {
      SERVICES.LoggingService.Log_Exception({
        module: SERVICES.NavigationService.MODULES.RoutePlanner,
        method: "getCurrentLocation",
        message: error
      });
    } finally {
      SERVICES.ProgressService.hideSpinner();
    }
  }

  /**
   * Submit the route planner form to get directions and qpn markers for the route.
   */
  public async submitRouteForm() {
    try {
      const origin = this.origin.trim();
      this.originErrorMsg = !origin ? "Origin is required." : "";
      this.destinationErrorMsg = !this.destination
        ? "Destination is required."
        : "";

      if (this.originErrorMsg || this.destinationErrorMsg) {
        return;
      }

      // Close the route form once submitted
      this.closeRouteForm();
      SERVICES.ProgressService.showSimpleSpinner(
        `Calculating route from ${this.origin} to ${this.destination}...`
      );

      /// Making sure we have the map UI component
      if (!this._mapboxView) {
        this._mapboxView = topmost().currentPage.getViewById(
          "mapboxView"
        ) as MapboxView;
      }

      // here we need to check if user has promiles or mapbox toggle set

      let result;
      if (this.routingEngine === true) {
        // now go to server and figure out the mapping
        result = await SERVICES.MappingService.GetMapboxPointsAndMarkers(
          this.origin,
          this.destination
        );
      } else {
        result = await SERVICES.MappingService.GetMapPointsAndMarkers(
          this.origin,
          this.destination
        );
      }

      // clear the current markers for list view
      this.currentQpnMarkers = new ObservableArray<FuelStop>();
      // we'll save a reference to the qpnLocations that get binded to
      // the map at any time so we can show a list of the stops also

      this.currentQpnMarkers = result.qpnMarkers;

      SERVICES.ProgressService.hideSpinner();

      await this._mapboxView.removeMarkers();
      // PASSING THE CURRENT POLYLINE ID avoids a crash on iOS mapbox
      await this._mapboxView.removePolylines([this._currentPolylineId]);

      this.noQpnMarkerText = "There are no markers on the map currently.";
      // set the zoom level out
      await this._mapboxView.setZoomLevel({
        level: 2.85,
        animated: true
      });

      const markers = [] as MapboxMarker[];
      // loop the markers and add tap events
      result.qpnMarkers.forEach((loc: QualityPlusNetworkLocation) => {
        if (loc) {
          markers.push({
            id: loc.id,
            lat: loc.latitude, // data response needs updating
            lng: loc.longitude, // data response needs updating
            title: `${loc.name} ${loc.location ? "@ " + loc.location : ""}`,
            subtitle: loc.address,
            onTap: () => {
              this._onMarkerTap(loc);
            },
            onCalloutTap: () => {
              this._onCalloutTap(loc);
            }
          });
        }
      });

      // Add the markers from the result
      await this._mapboxView.addMarkers(markers);

      const polyData = {
        id: 1,
        color: "#3489db",
        width: 3,
        points: result.mapPoints
      };

      await this._mapboxView.addPolyline(polyData);
      this._currentPolylineId = polyData.id;

      await this._mapboxView.setCenter({
        lat: result.mapPoints[0].lat,
        lng: result.mapPoints[0].lng,
        animated: false
      });
      await this._mapboxView.setZoomLevel({
        level: 6.5,
        animated: false
      });

      // set true to maintain the state that route is displayed
      // we use this to toggle all the stops back on the map when
      // gps/location button tap
      this.viewingRoute = true;

      // Modify the array with users favorite stops saved
      SERVICES.FavoriteStopsService.modifyStopsWithFavorites(
        this.currentQpnMarkers
      );

      SERVICES.LoggingService.Log_Event(
        SERVICES.NavigationService.MODULES.RoutePlanner,
        "submitRouteForm() Success",
        JSON.stringify({
          origin: result.origin,
          destination: result.destination
        })
      );
    } catch (error) {
      SERVICES.ProgressService.hideSpinner();
      if (
        error.Message &&
        error.Message.includes(
          "Please check the spelling and/or use just the city and state abbreviation"
        )
      ) {
        this._feedbackService.error(error.Message, "Error");
      } else {
        this._feedbackService.error(
          "Sorry, an unexpected error occurred with calculating the route. If this continues please email us at support@nastek.com"
        );
      }

      SERVICES.LoggingService.Log_Exception({
        module: SERVICES.NavigationService.MODULES.RoutePlanner,
        method: "submitRouteForm",
        message: JSON.stringify(error)
      });
    }
  }

  /**
   * directionsFabTap
   */
  public directionsFabTap(args) {
    UTILS.ShowRoutePlannerAnimation();
    this.routePlannerOpen = true;
    topmost().currentPage.actionBar.navigationButton.visibility = "hidden";
    this.currentPageTitle = "";
    this._mapboxView.isEnabled = false;
    this._mapboxView.isUserInteractionEnabled = false;
  }

  /**
   * Close the Route Form
   */
  public closeRouteForm() {
    // Hide the keyboard
    UTILS.KeyboardUtil.hideKeyboard();
    UTILS.CloseRouteFormAnimation();
    this.routePlannerOpen = false;
    topmost().currentPage.actionBar.navigationButton.visibility = "visible";
    this.currentPageTitle = "Route Planner";
    this._mapboxView.isEnabled = true;
    this._mapboxView.isUserInteractionEnabled = true;
  }

  public closeStopDetailForm() {
    UTILS.CloseStopDetailLayoutAnimation();
  }

  /**
   * Loads the cached qpn locations onto the map as markers.
   */
  public async loadCachedQpnLocations() {
    // if already showing all the QPN locs, just clear and toggle the boolean to reset the button style
    if (this.viewingRoute === true) {
      this.viewingRoute = false;
      await this._mapboxView.removeMarkers();
      // PASSING THE CURRENT POLYLINE ID avoids a crash on iOS mapbox
      await this._mapboxView.removePolylines([this._currentPolylineId]);
    }

    // timeout to not lock up button tap UI
    setTimeout(async () => {
      try {
        const qpnLocs = SERVICES.DatabaseService.getItem(
          SERVICES.DatabaseService.KEYS.CachedQpnLocations
        );
        this.currentQpnMarkers = qpnLocs;
        // remove any markers on map
        await this._mapboxView.removeMarkers();
        // PASSING THE CURRENT POLYLINE ID avoids a crash on iOS mapbox
        await this._mapboxView.removePolylines([this._currentPolylineId]);
        qpnLocs.forEach(async (loc: QualityPlusNetworkLocation) => {
          await this._mapboxView.addMarkers([
            {
              id: loc.id,
              lat: loc.latitude,
              lng: loc.longitude,
              title: `${loc.name} ${loc.location ? "@ " + loc.location : ""}`,
              subtitle: loc.address,
              onTap: () => {
                this._onMarkerTap(loc);
              },
              onCalloutTap: () => {
                this._onCalloutTap(loc);
              }
            }
          ]);
        });

        this.viewingRoute = false;

        // Modify the array with users favorite stops saved
        SERVICES.FavoriteStopsService.modifyStopsWithFavorites(
          this.currentQpnMarkers
        );
      } catch (error) {
        this._feedbackService.error(
          `An error occurred loading the QPN fuel locations, please try again later.`
        );
        SERVICES.LoggingService.Log_Exception({
          module: "route-planner-view-model",
          method: "_loadCachedQpnLocations",
          message: error
        });
      }
    }, 100);
  }

  /**
   * openMapStyleDialog - opens the dialog with the mapbox style options
   */
  public async openMapStyleDialog() {
    const opts: ActionOptions = {
      message: "Map Style",
      cancelButtonText: "Close",
      actions: [
        "Traffic-Day",
        "Traffic-Night",
        "Streets",
        "Satellite",
        "Satellite-Streets",
        "Dark",
        "Light",
        "Hybrid",
        "Emerald",
        "Outdoors"
      ]
    };
    const result = await action(opts);
    if (result === "Close") {
      return;
    }

    // Making sure we have the map UI component
    this._ensureMapView();

    const mapstyleEnum = SERVICES.MappingService.getMapBoxStyleEnum(result);

    // set the new map style
    this._mapboxView.setMapStyle(mapstyleEnum);

    // save the map style to the user app-settings
    this._userService.mapboxStyle = result;

    SERVICES.LoggingService.Log_Event(
      SERVICES.NavigationService.MODULES.RoutePlanner,
      "openMapStyleDialog.UserService.SAVE_MAP_STYLE()",
      result
    );
  }

  public onStopPhoneTap(args) {
    if (args.object.text !== "N/A") {
      UTILS.Helpers.callNumber(args.object.text);
    }
  }

  public onLocationTap(args) {
    if (args.object.text !== "N/A") {
      // need to get the selectedStop
      this._onCalloutTap(this.selected_stop);
    }
  }

  /**
   * Clears the origin text field.
   */
  public clearOriginTextField() {
    this.origin = "";
  }

  /**
   * Clears the destination text field.
   */
  public clearDestinationTextField() {
    this.destination = "";
  }

  /**
   * Navigate back
   */
  public goBack() {
    SERVICES.NavigationService.GoBack();
  }

  private async _setCurrentSelectedQpnStop(index: number) {
    const stop = this.currentQpnMarkers[index];
    const locationDetail = (await this._qpnLocationService.QpnLocationDetail(
      stop.id
    )) as QualityPlusNetworkLocation;
    SERVICES.CLog(`locationDetail`, locationDetail);
    this.selected_stop = locationDetail;

    this._mapboxView.setCenter({
      lat: this.selected_stop.latitude,
      lng: this.selected_stop.longitude,
      animated: false
    });
    this._mapboxView.setZoomLevel({
      level: 9.5,
      animated: false
    });
  }

  private async _onMarkerTap(stop) {
    try {
      const locationDetail = (await this._qpnLocationService.QpnLocationDetail(
        stop.id
      )) as QualityPlusNetworkLocation;
      SERVICES.CLog(`locationDetail`, locationDetail);
      this.selected_stop = locationDetail;
      UTILS.ShowStopDetailLayoutAnimation();
      // this._ensureMapView();
      // this._mapboxView.setCenter({
      //   lat: this.selected_stop.latitude,
      //   lng: this.selected_stop.longitude,
      //   animated: true
      // });
    } catch (error) {
      SERVICES.CLog(error);
      this._feedbackService.error(
        `An error occurred getting data for ${
          stop.name
        }, please try again later.`
      );
    }
  }

  private async _onCalloutTap(
    stop: QualityPlusNetworkLocation
    // marker: MapboxMarker
  ) {
    const confirmResult = await confirm({
      message: `Navigate to ${stop.name}?`,
      okButtonText: "Yes",
      cancelButtonText: "No"
    });

    if (confirmResult === true) {
      UTILS.Helpers.openMapsNavigate(stop.latitude, stop.longitude);
      SERVICES.LoggingService.Log_Event(
        SERVICES.NavigationService.MODULES.RoutePlanner,
        "onCalloutTap().navigate() Success",
        "Merchant: " + stop.id
      );
    }
  }

  /**
   * Helper method to ensure we have the MapboxView UI instance.
   */
  private _ensureMapView() {
    /// Making sure we have the map UI component
    if (!this._mapboxView) {
      this._mapboxView = topmost().currentPage.getViewById(
        "mapboxView"
      ) as MapboxView;
    }
  }

  private _onRoutingEngineSwitchChanged(args: PropertyChangeData) {
    if (args.value === true) {
      // is mapbox selection
      const toast = new Toasty(
        "Mapbox routing is not reflective of truck specific routing.",
        "bottom",
        "center"
      );
      toast.show();
    }
  }

  private _onOriginChange(args): void {
    this.origin = args.object.text;
    this.originErrorMsg = !this.origin ? "Origin is required." : "";
  }

  private _onDestinationChange(args) {
    this.destination = args.object.text;
    this.destinationErrorMsg = !this.destination
      ? "Destination is required."
      : "";
  }
}
