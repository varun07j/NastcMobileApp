///core
import * as app from "tns-core-modules/application";
import * as HTTP from "tns-core-modules/http";
import { Page } from "tns-core-modules/ui/page";
import { Observable } from "tns-core-modules/data/observable";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import { confirm } from "tns-core-modules/ui/dialogs";
import { openUrl } from "tns-core-modules/utils/utils";
import { Color } from "tns-core-modules/color";
/// plugins
import * as SocialShare from "nativescript-social-share";
import { HelpCenterItems } from "../../models";
/// services
import {
  NavigationService,
  LoggingService,
  FeedbackService
} from "../../services";
import { BaseUrl, Helpers } from "../../utils";

declare var android, UIView, CGRectMake: any;

export class HelpCenterViewModel extends Observable {
  public helpCenterItems: HelpCenterItems[];
  private _feedbackService: FeedbackService = new FeedbackService();

  constructor(page: Page) {
    super();
    // Log the ScreenView to Google Analytics
    LoggingService.Add_ScreenView(NavigationService.MODULES.HelpCenter);
    this._getHelpCenterItems();
  }

  /**
     * ListView item tap event - get the index of the item then call() the function.
     */
  public getItemEvent(args: ItemEventData) {
    try {
      const item = this.helpCenterItems[args.index];
      switch (item.event) {
        case "callSupport":
          this.callSupport();
          break;
        case "emailSupport":
          this.emailSupport();
          break;
        case "rateApp":
          this.rateApp();
          break;
        case "share":
          this.share();
          break;
        case "openNastcWebSite":
          this.openNastcWebSite();
          break;
        case "openNastekWebSite":
          this.openNastekWebSite();
          break;
        case "signOutOfApp":
          this.signOutOfApp();
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
     * Navigate Back
     */
  public goBack() {
    NavigationService.GoBack();
  }

  /**
     * onItemLoading
     */
  public onItemLoading(args: ItemEventData) {
    if (isIOS) {
      const cell = args.ios;
      if (cell) {
        cell.selectedBackgroundView = UIView.alloc().initWithFrame(
          CGRectMake(0, 0, 0, 0)
        );
        const highlightColor = new Color("#434D57");
        cell.selectedBackgroundView.backgroundColor = highlightColor.ios;
      }
    }
  }

  /**
     * Email support
     */
  public async emailSupport() {
    Helpers.openEmail(
      "NASTC App Help",
      `To whom it may concern, \n`,
      "support@nastek.com",
      "development@nastek.com"
    );
  }

  /**
     * Call support
     */
  public callSupport() {
    Helpers.callNumber("800-331-2802");
  }

  /**
     * Send users to app store to rate
     */
  public rateApp() {
    if (isAndroid) {
      const uri = android.net.Uri.parse("market://details?id=com.nastc.app");
      const myAppLinkToMarket = new android.content.Intent(
        android.content.Intent.ACTION_VIEW,
        uri
      );
      try {
        app.android.foregroundActivity.startActivity(myAppLinkToMarket);
      } catch (error) {
        this._feedbackService.error("Unable to open the Play Store.");
      }
    } else if (isIOS) {
      console.log("send user to iTunes to rate app");
      // let storeLink = "itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=%d"
      const storeLink =
        "itms-apps://itunes.apple.com/app/id3533724601012462894";
      openUrl(storeLink);
    } else {
      console.log("wtf is this platform");
      return;
    }
  }

  /**
     * Opens the native sharing options
     */
  public share() {
    if (isAndroid) {
      SocialShare.shareText(
        "Download the NASTC app https://play.google.com/store/apps/details?id=" +
          app.android.packageName +
          ""
      );
    } else if (isIOS) {
      SocialShare.shareText(
        "Download the NASTC app https://itunes.apple.com/us/app/nastc/id1012462894?ls=1&mt=8"
      );
    } else {
      console.log("What platform are we on?!?!");
      return;
    }
  }

  /**
     * Opens the NASTC site
     */
  public openNastcWebSite() {
    Helpers.openNastcWebsite();
  }

  /**
     * Opens the NAStek site
     */
  public openNastekWebSite() {
    Helpers.openNastekWebsite();
  }

  /**
     * Sign user out of app and remove UserInfo from app-settings
     */
  public async signOutOfApp() {
    const result = await confirm({
      message: "Are you sure you want to sign out?",
      okButtonText: "Yes",
      cancelButtonText: "No"
    });
    if (result === true) {
      LoggingService.Log_Event(
        NavigationService.MODULES.HelpCenter,
        "signOutOfApp() Success",
        null
      );
      NavigationService.SignOutOfApp();
    }
  }

  private _getHelpCenterItems() {
    // Initialize default item list
    HTTP.getJSON(
      `${BaseUrl}resources/nastc-mobile/help-center-items.json`
    ).then(
      data => {
        this.set(`helpCenterItems`, data);
      },
      err => {
        this._feedbackService.error(
          "Ooops! An error occurred getting the help center data. Please try again later."
        );
      }
    );
  }
}
