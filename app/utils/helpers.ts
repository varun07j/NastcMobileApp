import * as TNSEmail from "nativescript-email";
import * as TNSPhone from "nativescript-phone";
import * as TNSAdvancedWebView from "nativescript-advanced-webview";
import { Feedback } from "nativescript-feedback";
import { Directions, DirectionsCommon } from "nativescript-directions";
import { CompanyEmployee } from "../models";

const _feedbackService = new Feedback();
const _directions = new Directions();

export class Helpers {
  /**
   * Attempts to open the device phone app to dial a number. Default is confirm true so dialing does not start automatically.
   * @param number [string] - The number to dial.
   */
  public static callNumber(number, confirm: boolean = true) {
    try {
      TNSPhone.dial(number, confirm);
    } catch (error) {
      _feedbackService.info({
        message: `Could not open the phone application on your device. The phone number is ${number}`,
        title: "Info",
        duration: 5000
      });
    }
  }

  /**
 *  Attempts to open the device email app with a pre-filled email with the provided values.
 */
  public static async openEmail(
    subject: string,
    body: string,
    to: string,
    bcc: string = "",
    appPickerTitle: string = "Compose email with..."
  ) {
    const isAvail = await TNSEmail.available();
    console.log(`is email available`, isAvail);
    if (!isAvail) {
      _feedbackService.info({
        message: `Couldn't open an email application on your device.`,
        title: "Info",
        duration: 4000
      });
      return;
    }

    TNSEmail.compose({
      subject,
      body,
      to: [to],
      bcc: [bcc],
      appPickerTitle
    });
  }

  public static openNastcWebsite() {
    TNSAdvancedWebView.openAdvancedUrl({
      url: "http://www.nastc.com",
      showTitle: true,
      toolbarColor: "#B2005E"
    });
  }

  public static openNastekWebsite() {
    TNSAdvancedWebView.openAdvancedUrl({
      url: "http://nastek.com",
      showTitle: true,
      toolbarColor: "#336699"
    });
  }

  public static async openMapsNavigate(latitude, longitude) {
    const isAvail = await _directions.available();
    if (!isAvail) {
      _feedbackService.info({
        message: `Could not open the maps app on your device`
      });
      return;
    }

    const nav = await _directions.navigate({
      to: {
        lat: latitude,
        lng: longitude
      }
    });
  }
}
