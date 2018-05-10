import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { isIOS, isAndroid, device } from "tns-core-modules/platform";
import { topmost } from "tns-core-modules/ui/frame";
import { Color } from "tns-core-modules/color";
import { LoginViewModel } from "./login-view-model";
import { NavigationService } from "../../services/navigation.service";

declare var android, NSDictionary, NSForegroundColorAttributeName, UIColor: any;

// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new LoginViewModel(page);

  if (isAndroid) {
    const window = app.android.startActivity.getWindow();

    // prevent keyboard from showing initially
    window.setSoftInputMode(
      android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN
    );

    if (device.sdkVersion >= "21") {
      window.setStatusBarColor(new Color("#19273a").android);
    }
  }

  if (isIOS) {
    const navigationBar = topmost().ios.controller.navigationBar;
    navigationBar.barStyle = 1;
  }
}

export function navToForgotPassword() {
  NavigationService.GoTo(NavigationService.MODULES.ForgotPassword);
}

export function navToSignUp() {
  NavigationService.GoTo(NavigationService.MODULES.SignUp);
}
