import { Color } from "tns-core-modules/color";
// plugins
import {
  Feedback,
  FeedbackType,
  FeedbackPosition
} from "nativescript-feedback";

/**
 * Service for nativescript-feedback.
 */
export class FeedbackService {
  // reusable instance
  private _feedback: Feedback;

  constructor() {
    this._feedback = new Feedback();
  }

  public showFeedback(title, message) {
    this._feedback.show({
      title,
      titleColor: new Color("#222"),
      position: FeedbackPosition.Top, // iOS only
      type: FeedbackType.Custom, // this is the default type, by the way
      message,
      messageColor: new Color("#fff"),
      duration: 4500,
      backgroundColor: new Color("#2196f3"),
      onTap: () => {
        console.log("showCustomIcon tapped");
      }
    });
  }

  /**
   * Shows the info feedback.
   * @param message [string] - The message of the feedback notification.
   * @param title [string] - The title of the feedback notification.
   * @param duration [string] - The duration to show the warning feedback.
   */
  public info(message: string, title?: string, duration: number = 4500) {
    this._feedback.info({
      message,
      title: title ? title : "",
      duration: duration,
      messageColor: new Color("#fff"),
      backgroundColor: new Color("#039BE5")
    });
  }

  /**
   * Shows the success feedback.
   * @param message [string] - The message of the feedback notification.
   * @param title [string] - The title of the feedback notification.
   * @param duration [string] - The duration to show the warning feedback.
   */
  public success(message: string, title?: string, duration: number = 4500) {
    this._feedback.success({
      message,
      title: title ? title : "",
      duration: duration,
      messageColor: new Color("#fff"),
      backgroundColor: new Color("#64C764")
    });
  }

  /**
   * Shows the warning feedback.
   * @param message [string] - The message of the feedback notification.
   * @param title [string] - The title of the feedback notification.
   * @param duration [string] - The duration to show the warning feedback.
   */
  public warning(message: string, title?: string, duration: number = 4500) {
    this._feedback.warning({
      message,
      title: title ? title : "",
      duration: duration,
      messageColor: new Color("#fff"),
      backgroundColor: new Color("#222")
    });
  }

  /**
   * Shows the error feedback.
   * @param message [string]
   * @param title [string]
   */
  public error(
    message: string,
    title: string = "Error",
    duration: number = 10000
  ) {
    this._feedback.error({
      message,
      title: title ? title : "",
      duration: duration,
      titleColor: new Color("#fff"),
      messageColor: new Color("#fff"),
      backgroundColor: new Color("#d32f2f")
    });
  }

  /**
   * Hide current showing feedback.
   */
  public hide() {
    this._feedback.hide();
  }
}
