import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page";
import { isAndroid, isIOS, device } from "tns-core-modules/platform";
import { topmost } from "tns-core-modules/ui/frame";
import { EventData } from "tns-core-modules/data/observable";
import { Color } from "tns-core-modules/color";
import { MainPageViewModel } from "./main-view-model";

declare var NSDictionary, NSForegroundColorAttributeName, UIColor: any;

// Event handler for Page "loaded" event attached in main-page.xml
export function onLoaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new MainPageViewModel(page);

  if (isAndroid && device.sdkVersion >= "21") {
    const window = app.android.startActivity.getWindow();
    window.setStatusBarColor(new Color("#19273a").android);
  }

  if (isIOS) {
    const navigationBar = topmost().ios.controller.navigationBar;
    navigationBar.barStyle = 1;
  }
}
