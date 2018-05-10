/// core
import * as HTTP from "tns-core-modules/http";
import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { isIOS } from "tns-core-modules/platform";
/// plugins
import * as TNSAdvancedWebView from "nativescript-advanced-webview";
/// services
import {
  LoggingService,
  NavigationService,
  FeedbackService
} from "../../services";
import { BaseUrl, ObservableProperty, Helpers } from "../../utils";

declare var android, UIView, CGRectMake, UITableViewCellSelectionStyleNone: any;

/**
 * MainPage View Model
 */
export class NastcServicesViewModel extends Observable {
  @ObservableProperty() public nastcServicesItems = new ObservableArray<any>();
  private _feedbackService: FeedbackService = new FeedbackService();

  constructor() {
    super();
    LoggingService.Add_ScreenView(NavigationService.MODULES.NastcServices);
    this._getNastcServices();
  }

  /**
     * Navigate Back
     */
  public goBack() {
    NavigationService.GoBack();
  }

  /**
     * Opens the item website
     */
  public onWebsiteTap(args: ItemEventData) {
    const item = (args.object as any).bindingContext;
    if (item.website) {
      TNSAdvancedWebView.openAdvancedUrl({
        url: item.website,
        showTitle: true,
        toolbarColor: "#B2005E"
      });
    }
  }

  public onCallTap(args: ItemEventData) {
    const item = (args.object as any).bindingContext;
    if (item.phone) {
      Helpers.callNumber(item.phone);
    }
  }

  /**
     * onMessageTap
     */
  public async onEmailTap(args: ItemEventData) {
    const item = (args.object as any).bindingContext;
    if (item.email) {
      Helpers.openEmail(
        "NASTC App Services Message",
        `To whom it may concern, \n`,
        item.email
      );
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

  private _getNastcServices() {
    // get the nastc services
    HTTP.getJSON(`${BaseUrl}/resources/nastc-mobile/nastc-services.json`).then(
      (data: any) => {
        this.nastcServicesItems = data;
      },
      err => {
        LoggingService.Log_Exception({
          module: NavigationService.MODULES.NastcServices,
          method: "constructor",
          message: err
        });
        this._feedbackService.error(
          "An error occurred getting the list of NASTC services."
        );
      }
    );
  }
}
