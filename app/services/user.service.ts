/// Core
import * as application from "tns-core-modules/application";
import * as appSettings from "tns-core-modules/application-settings";
import * as HTTP from "tns-core-modules/http";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import { confirm, ConfirmOptions } from "tns-core-modules/ui/dialogs";
import { ios as iosUtils, openUrl } from "tns-core-modules/utils/utils";
/// Interfaces
import { UserInfo } from "../models";
/// Services
import { DatabaseService, CLog, LoggingService } from "../services";
import { BaseUrl } from "../utils";
/// Plugins
import { MapStyle } from "nativescript-mapbox";

declare var android, NSBundle: any;

export class UserService {
  private _user: any = DatabaseService.getItem(DatabaseService.KEYS.UserInfo);
  private _mapboxStyle: any = DatabaseService.getItem(
    DatabaseService.KEYS.UserMapboxStyle
  );

  public get user() {
    return this._user;
  }
  public set user(user) {
    if (user) {
      DatabaseService.setItem(DatabaseService.KEYS.UserInfo, user);
      this._user = user;
    }
  }

  public get mapboxStyle() {
    return this._mapboxStyle;
  }
  public set mapboxStyle(value) {
    if (value) {
      DatabaseService.setItem(DatabaseService.KEYS.UserMapboxStyle, value);
      this._mapboxStyle = value;
    }
  }

  /**
   * Check if the current app version is the latest that we have published to the app stores.
   * There is a .json file on the web api that has the values for each platform.
   */
  public static CHECK_APPSTORE_APP_VERSION(): void {
    HTTP.getJSON(`${BaseUrl}resources/nastc-mobile/nastc-app.json`).then(
      (resp: any) => {
        let installedAppVersion;
        let appStoreVersion;

        // TODO refactor this and to be cleaner (DRY) later on
        if (isAndroid) {
          // get Android installed app version
          let PackageManager = android.content.pm.PackageManager;
          let pkg = application.android.context
            .getPackageManager()
            .getPackageInfo(
              application.android.context.getPackageName(),
              PackageManager.GET_META_DATA
            );
          installedAppVersion = pkg.versionName;
          console.log(`installedAppVersion = ${installedAppVersion}`);

          // the app store version from our app-versions.json file on the api
          appStoreVersion = resp.versions.android;
          console.log(`appStoreVersion = ${appStoreVersion}`);

          if (installedAppVersion < appStoreVersion) {
            let opts: ConfirmOptions = {
              title: "Update Available",
              message:
                "There is a new version of the NASTC app available. Do you want to check the Play Store now?",
              okButtonText: "Yes",
              neutralButtonText: "No"
            };

            confirm(opts).then(confirmResult => {
              if (confirmResult === true) {
                let androidPackageName = application.android.packageName;
                let uri = android.net.Uri.parse(
                  "market://details?id=" + androidPackageName
                );
                let myAppLinkToMarket = new android.content.Intent(
                  android.content.Intent.ACTION_VIEW,
                  uri
                );
                // Launch the PlayStore
                application.android.foregroundActivity.startActivity(
                  myAppLinkToMarket
                );
              }
            });
          }
        }

        if (isIOS) {
          /// get iOS installed app version
          let mainBundle = iosUtils.getter(NSBundle, NSBundle.mainBundle);
          installedAppVersion = mainBundle.objectForInfoDictionaryKey(
            "CFBundleShortVersionString"
          );

          /// the app store version from our app-versions.json file on the api
          appStoreVersion = resp.versions.ios;

          if (installedAppVersion < appStoreVersion) {
            let opts: ConfirmOptions = {
              title: "Update Available",
              message:
                "There is a new version of the NASTC app available. Do you want to check the App Store now?",
              okButtonText: "Yes",
              neutralButtonText: "No"
            };

            confirm(opts).then(confirmResult => {
              if (confirmResult === true) {
                let appStoreUrl =
                  "itms-apps://itunes.apple.com/en/app/id" + 1012462894;
                openUrl(appStoreUrl);
              }
            });
          }
        }
      },
      error => {
        console.log("Check app Version error: " + error);
        LoggingService.Log_Exception({
          module: "user.service",
          method: "CHECK_APPSTORE_APP_VERSION()",
          message: JSON.stringify(error)
        });
      }
    );
  }

  /**
   * Returns the current UserInfo object from app settings
   */
  public GET_USER_INFO() {
    return this._getUserInfo();
  }

  private _getUserInfo() {
    if (this.user) {
      return this.user;
    } else {
      return null;
    }
  }

  /**
   * Save the UserInfo to app settings.
   */
  public SAVE_USER_INFO(data: UserInfo): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (data) {
          this.user = data;
          resolve(true);
        } else {
          reject(false);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Save the user preferred map style to app-settings.
   */
  public SAVE_MAP_STYLE(style: string): void {
    if (style) {
      this.mapboxStyle = style.toString().toLowerCase();
    }
  }

  /**
   * Get the User Saved MapBox style.
   */
  public GET_USER_MAPBOX_MAP_STYLE(): any {
    if (this.mapboxStyle) {
      return this.mapboxStyle;
    } else {
      return MapStyle.STREETS;
    }
  }
}
