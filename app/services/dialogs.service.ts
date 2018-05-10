import { isAndroid, isIOS, device } from "tns-core-modules/platform";
import { SnackBar } from "nativescript-snackbar";
import { Toasty } from "nativescript-toasty";

export class DialogService {
  /**
     * Shows a material snackbar on android devices 21+ or a toast on lower android and all iOS.
     * @param message
     */
  public static AndroidSnackBar_iosToast(message: string): void {
    if (!message) {
      return;
    }

    if (isAndroid && device.sdkVersion >= "21") {
      const snackBar = new SnackBar();
      snackBar.simple(message);
    } else if (isAndroid) {
      const toast = new Toasty(message, "short", "center");
      toast.show();
    } else if (isIOS) {
      const toast = new Toasty(message, "short", "center");
      toast.show();
    }
  }
}
