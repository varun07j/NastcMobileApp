///core
import * as HTTP from "tns-core-modules/http";
import { Page } from "tns-core-modules/ui/page";
import { Observable, EventData } from "tns-core-modules/data/observable";
import { View } from "tns-core-modules/ui/core/view";
/// plugins
import * as emailValidator from "email-validator";
/// services
import {
  LoggingService,
  NavigationService,
  FeedbackService,
  ProgressService
} from "../../services";
/// utils
import {
  BaseUrl,
  ObservableProperty,
  EventInfo,
  EventListeners
} from "../../utils";

export class ForgotPasswordViewModel extends Observable {
  @ObservableProperty() public email: string;
  @ObservableProperty() public emailError: string;
  private _events: EventInfo[];
  private _feedbackService: FeedbackService = new FeedbackService();
  private _alertMessage = "If your email was found in the system, you will receive an email with instructions to reset your password.";

  constructor(page: Page) {
    super();
    LoggingService.Add_ScreenView(NavigationService.MODULES.ForgotPassword);
    this.email = "";
    // Bind events, and store for later unbinding:
    this._events = EventListeners.bindEvents([
      {
        eventName: "textChange",
        view: page.getViewById("emailField") as View,
        eventHandler: this._onEmailChange,
        viewModel: this
      }
    ]);
  }

  /**
     * Send Password Help
     */
  public async submitForgotPassword() {
    const _email = this.get("email");
    const email = _email.trim();
    /// Validate the email
    if (email.length <= 0) {
      this.emailError = "Email is required.";
      return;
    }

    const isValidEmail = emailValidator.validate(email);
    if (isValidEmail === false) {
      this.emailError = "Email is invalid.";
      return;
    }

    try {
      this.email = "";
      ProgressService.showSimpleSpinner("Sending...");

      const result = await HTTP.getJSON(
        `${BaseUrl}api/Account/LoginHelp?email=${this
          .email}&helpOption=forgotpassword`
      );

      this._feedbackService.info(this._alertMessage);
    } catch (error) {
      this._feedbackService.info(this._alertMessage);
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.ForgotPassword,
        method: "submitForgotPassword",
        message: `Email: ${email} \n ${JSON.stringify(error)}`
      });
    } finally {
      ProgressService.hideSpinner();
    }
  }

  public onPageUnloaded(args: EventData): void {
    EventListeners.unbindEvents(this._events);
  }

  /**
     * Navigate Back
     */
  public goBack() {
    NavigationService.GoBack();
  }

  private _onEmailChange(args): void {
    this.email = args.object.text;
    console.log(this.email);
    const email = this.email.trim();
    this.emailError = !email ? "Email is required." : "";
    if (this.emailError) {
      return;
    }
    const isValidEmail = emailValidator.validate(email);
    this.emailError = isValidEmail === false ? "Email is invalid." : "";
  }
}
