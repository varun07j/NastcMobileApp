import "./async-await"; // async/await global
import "./bundle-config";
// import "nativescript-dom"; // Only need to require nativescript-dom - it attaches to global
import "nativescript-localstorage"; // for local/session storage plugin
// core
import * as application from "tns-core-modules/application";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as fontModule from "tns-core-modules/ui/styling/font";
import { isAndroid, isIOS } from "tns-core-modules/platform";
// plugins
import { initialize as frescoInitialize } from "nativescript-fresco";
// import { initalize as googleAnalyticsInitialize, dispatch as googleAnalyticsDispatch } from 'nativescript-google-analytics'
// interfaces
import { UserInfo } from "./models/userinfo";
// services
import {
  LoggingService,
  CLog,
  DatabaseService,
  NavigationService
} from "./services";

// require dom here or iOS will crash on startup
import "nativescript-dom"; // Only need to require nativescript-dom - it attaches to global

// bypass TS compiler
declare var UIApplication, UIApplicationDelegate: any;

// import "nativescript-dom"; // Only need to require nativescript-dom - it attaches to global

// Android specifics
if (isAndroid) {
  // Android onLaunch
  application.on(application.launchEvent, intent => {
    // initialize Fresco library
    frescoInitialize();
    // /// initialize Google Analytics
    // googleAnalyticsInitialize({
    //     trackingId: 'UA-82366503-1',
    //     dispatchInterval: 45, /// (Value in seconds)...Default Android is 30 minutes, default iOS is 2 minutes (120 seconds).  Disable by setting to 0.
    // })
  });
}

// iOS specifics
if (isIOS) {
  // Register fonts
  fontModule.ios.registerFont("ionicons.ttf");
  fontModule.ios.registerFont("fontawesome-webfont.ttf");
  fontModule.ios.registerFont("MaterialIcons-Regular.ttf");

  // // Google Analytics
  // class MyDelegate extends UIResponder implements UIApplicationDelegate {
  //     public static ObjCProtocols = [UIApplicationDelegate]

  //     applicationDidFinishLaunchingWithOptions(applicationlication: UIApplication, launchOptions: NSDictionary): boolean {
  //         googleAnalyticsInitialize({
  //             trackingId: 'UA-82366503-1',
  //             dispatchInterval: 45
  //         })
  //         return true
  //     }

  // }

  // application.ios.delegate = MyDelegate
}

// Cross Platform
application.on(application.uncaughtErrorEvent, error => {
  LoggingService.Log_Exception({
    module: "app.ts",
    method: application.uncaughtErrorEvent,
    message: JSON.stringify(error)
  });
});

application.on(
  application.exitEvent,
  (args: application.ApplicationEventData) => {
    CLog("exitEvent", args);
    // need to clear the caches that are only per session
    DatabaseService.clearSessionCacheData();
  }
);

application.on(application.lowMemoryEvent, () => {
  // LoggingService.Log_Event('app.ts', 'application.onLowMemory()', 'Low Memory on Device')
});

/**
 * TODO: simplify this a lot
 * Set entry point of the applicationlication
 * check for UserInfo in application-settings
 */
try {
  // check the db service for values in LS to migrate from app-settings
  const userData = DatabaseService.getItem(
    DatabaseService.KEYS.UserInfo
  ) as UserInfo;
  if (userData) {
    // Make sure we have at least the api_key and USR_Key to know who this user is
    if (userData && userData.API_Key && userData.USR_Key) {
      application.start({ moduleName: NavigationService.MODULES.MainPage });
    } else {
      application.start({ moduleName: NavigationService.MODULES.Login });
    }
  } else if (applicationSettings.hasKey(DatabaseService.KEYS.UserInfo)) {
    const userinfo = JSON.parse(
      applicationSettings.getString(DatabaseService.KEYS.UserInfo)
    ) as UserInfo;

    // update the LS new db service
    // will remove in future release once most have updated
    DatabaseService.setItem(DatabaseService.KEYS.UserInfo, userinfo);

    // Make sure we have at least the api_key and USR_Key to know who this user is
    if (userinfo && userinfo.API_Key && userinfo.USR_Key) {
      application.start({ moduleName: NavigationService.MODULES.MainPage });
    } else {
      application.start({ moduleName: NavigationService.MODULES.Login });
    }
  } else {
    application.start({ moduleName: NavigationService.MODULES.Login });
  }
} catch (err) {
  LoggingService.Log_Exception({
    module: "app.ts",
    method: "application.start()",
    message: JSON.stringify(err)
  });
  application.start({ moduleName: NavigationService.MODULES.Login });
}
