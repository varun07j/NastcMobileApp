/// core
import { Page } from "tns-core-modules/ui/page";
import { Observable } from "tns-core-modules/data/observable";
/// services
import {
  LoggingService,
  NavigationService,
  UserService,
  FeedbackService,
  DatabaseService,
  QpnLocationsService
} from "../../services";
import { UserInfo } from "../../models";
/// utils
import { ObservableProperty, Helpers } from "../../utils";

/**
 * MainPage View Model
 */
export class DashboardViewModel extends Observable {
  @ObservableProperty() public user: UserInfo;
  private _userService: UserService;
  private _feedbackService: FeedbackService;

  constructor(mainPage: Page) {
    super();
    this._userService = new UserService();
    this._feedbackService = new FeedbackService();
    // Initialize default values
    this.user = this._userService.user;
    // Check the app version installed against latest to alert user if an update is available.
    UserService.CHECK_APPSTORE_APP_VERSION();
    // Fetch the Qpn Locations from the database - avoids doing this on map page specifically
    QpnLocationsService.QpnLocations();
  }

  /**
   * Opens the NASTC site
   */
  public openNastcWebSite() {
    Helpers.openNastcWebsite();
  }

  public callNastc() {
    Helpers.callNumber("800.264.8580");
  }

  /**
   * onMessageTap
   */
  public async onMessageTap() {
    Helpers.openEmail(
      "NASTC App Message",
      "To whom it may concern, ",
      "support@nastek.com",
      "development@nastek.com"
    );
  }

  /**
   * Navigate to Fuel Stops
   */
  public goToQpnMain() {
    NavigationService.GoTo(NavigationService.MODULES.QpnMain);
  }

  /**
   * Navigate to Route Planner
   */
  public goToRoutePlanner() {
    NavigationService.GoTo(NavigationService.MODULES.RoutePlanner);
  }

  /**
   * Navigate to CompanyDirectory
   */
  public goToCompanyDirectory() {
    NavigationService.GoTo(NavigationService.MODULES.CompanyDirectory);
  }

  public goToNastcServices() {
    NavigationService.GoTo(NavigationService.MODULES.NastcServices);
  }

  /**
   * Navigate to Help Center
   */
  public goToHelpCenter() {
    NavigationService.GoTo(NavigationService.MODULES.HelpCenter);
  }
}
