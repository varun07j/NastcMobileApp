import * as HTTP from "tns-core-modules/http";
import * as application from "tns-core-modules/application";
// import * as GoogleAnalytics from 'nativescript-google-analytics'
import { isAndroid, isIOS, device, Device } from "tns-core-modules/platform";
import { UserService } from "./user.service";
import { DatabaseService } from "./database.service";
import { UserInfo } from "../models";
import { BaseUrl, HttpTimeout } from "../utils";
import * as utils from "tns-core-modules/utils/utils";

declare var android, NSBundle: any;

export class LoggingUtil {
  public static debug: boolean = true;
}

export const CLog = (...args) => {
  if (LoggingUtil.debug) {
    console.log(args);
  }
};

/**
 * Logging Service to simplify Google Analytics and NastekLog database logging.
 */
export class LoggingService {
  private static isEnabled = true;

  /**
   * Logs an Event to Google Analytics
   * @param {string} category
   * @param {string} action
   * @param {string} infoMessage
   * @param {number} [value=null]
   */
  public static Log_Event(
    appPage: string,
    event: string,
    infoMessage: string,
    value?: number
  ) {
    if (appPage && event) {
      this.NastekLogRequest(appPage, event, infoMessage, false);
    }
  }

  /**
   * Logs an Exception to Google Analytics and NastekLog database.
   * @param {string} appPage - The Page in the app to log the event.
   * @param {string} event - The code method to log where the exception occurred.
   * @param {string} infoMessage - Any information data/message to log.
   */
  public static Log_Exception(opts: ExceptionOptions) {
    CLog(opts);
    if (typeof opts.message === "object") {
      CLog("typeof message", typeof opts.message);
      try {
        opts.message = JSON.stringify(opts.message);
      } catch (error) {
        CLog("error stringifying opts.message", error);
      }
    }
    LoggingService.NastekLogRequest(
      opts.module,
      opts.method,
      opts.message,
      true
    );
  }

  /**
   * Logs a ScreenView to Google Analytics
   * @param {string} screen
   */
  public static Add_ScreenView(screen: string) {
    if (screen) {
      // if (isAndroid) {
      //     GoogleAnalytics.logView(screen)
      // }
    }
  }

  /**
   * Sends HTTP request to log data to NastekLog database.
   */
  private static NastekLogRequest(
    appPage: string,
    event: string,
    infoMessage: string,
    isException: boolean = false
  ) {
    if (this.isEnabled === false) {
      return;
    }

    // Get the user info
    const user = DatabaseService.getItem(
      DatabaseService.KEYS.UserInfo
    ) as UserInfo;
    // const user = UserService.prototype.user as UserInfo;

    let apikey = 0;
    let userkey = 0;
    if (user) {
      apikey = user.API_Key ? user.API_Key : 0;
      userkey = user.USR_Key ? user.USR_Key : 0;
    }

    let appVersion = null; // app version on the device
    if (isAndroid) {
      const PackageManager = android.content.pm.PackageManager;
      const pkg = application.android.context
        .getPackageManager()
        .getPackageInfo(
          application.android.context.getPackageName(),
          PackageManager.GET_META_DATA
        );
      appVersion = pkg.versionName;
    } else if (isIOS) {
      const mainBundle = utils.ios.getter(NSBundle, NSBundle.mainBundle);
      appVersion = mainBundle.objectForInfoDictionaryKey(
        "CFBundleShortVersionString"
      );
    }

    // handle the uuid being null before app start on ios
    let deviceUUID = device.uuid as any;
    if (!deviceUUID) {
      deviceUUID = 0;
    }

    const formdata = new FormData();
    formdata.append("ApiKey", apikey.toString());
    formdata.append("UserKey", userkey.toString());
    formdata.append("Event", event);
    formdata.append("AppPage", appPage);
    formdata.append("DeviceOS", device.os);
    formdata.append("DeviceManufacturer", device.manufacturer);
    formdata.append("DeviceModel", device.model);
    formdata.append("DeviceType", device.deviceType);
    formdata.append("DeviceLanguage", device.language);
    formdata.append("DeviceOsVersion", device.osVersion);
    formdata.append("DeviceRegion", device.region);
    formdata.append("DeviceSdkVersion", device.sdkVersion);
    formdata.append("DeviceUUID", deviceUUID.toString());
    formdata.append("IsException", isException.toString());
    formdata.append("InfoMessage", infoMessage);
    formdata.append("AppVersion", appVersion);

    const opts: HTTP.HttpRequestOptions = {
      url: `${BaseUrl}api/mobileapplogs`,
      method: "POST",
      content: formdata,
      timeout: HttpTimeout
    };

    /// Send the request
    HTTP.request(opts)
      .then(response => {
        console.log(`NastekLogRequest successful.`);
        // request is good
      })
      .catch(error => {
        // request is bad
        console.log("Error", error);
      });
  }
}

interface ExceptionOptions {
  module: string;
  method: string;
  message: string;
}
