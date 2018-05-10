import { isAndroid } from "tns-core-modules/platform";
import * as app from "tns-core-modules/application";

/**
 * Contains the Keyboard Util
 */
export class KeyboardUtil {
  /**
   * Hide the soft keyboard
   */
  public static hideKeyboard(): void {
    if (isAndroid) {
      try {
        const activity = app.android.foregroundActivity;
        const context = app.android.context;
        const inputManager = context.getSystemService("input_method");
        inputManager.hideSoftInputFromWindow(
          activity.getCurrentFocus().getWindowToken(),
          2
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * Will prevent the keyboard from showing initially when a page loads that has text fields.
   */
  public static preventKeyboardFromInitiallyShowing(): void {
    if (isAndroid) {
      try {
        // prevent the soft keyboard from showing initially when textfields are present
        app.android.startActivity.getWindow().setSoftInputMode(2);
      } catch (err) {
        console.log(err);
      }
    }
  }
}
