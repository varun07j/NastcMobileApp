import { NavigationService } from "../../services";
import { Helpers } from "../../utils";

export function goBack() {
  NavigationService.GoBack();
}

export function callNastc() {
  Helpers.callNumber("800-264-8580");
}

/**
 * Message Nastc
 */
export async function emailNastc() {
  Helpers.openEmail(
    "NASTC Sign Up",
    `To whom it may concern, \n I'd like information on signing up.`,
    "more.info@nastc.com",
    "development@nastc.com"
  );
}
