import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { RoutePlannerViewModel } from "./route-planner-view-model";
import { KeyboardUtil } from "../../utils";

// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new RoutePlannerViewModel(page);
  KeyboardUtil.preventKeyboardFromInitiallyShowing();
}
