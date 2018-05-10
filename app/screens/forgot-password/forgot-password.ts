import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { ForgotPasswordViewModel } from "./forgot-password-view-model";
import { KeyboardUtil } from "../../utils";

// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new ForgotPasswordViewModel(page);
  // prevent keyboard from showing initially
  KeyboardUtil.hideKeyboard();
}
