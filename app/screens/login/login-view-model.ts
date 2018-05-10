/// core
import * as HTTP from "tns-core-modules/http";
import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";
import { Observable, EventData } from "tns-core-modules/data/observable";
import { screen } from "tns-core-modules/platform";
import * as dialogs from "ui/dialogs";
/// plugins
import * as emailValidator from "email-validator";
/// models
import { UserInfo } from "../../models";
/// utils
import {
  BaseUrl,
  HttpTimeout,
  ObservableProperty,
  KeyboardUtil,
  EventInfo,
  EventListeners,
  Helpers
} from "../../utils";
/// services
import {
  NavigationService,
  LoggingService,
  FeedbackService,
  ProgressService,
  DialogService,
  UserService
} from "../../services";

export class LoginViewModel extends Observable {
  @ObservableProperty() public screenHeight: number;
  @ObservableProperty() public headerImageHeight: number;
  @ObservableProperty() public remainingHeight: number;
  @ObservableProperty() public email: string;
  @ObservableProperty() public password: string;
  @ObservableProperty() public emailError: string;
  @ObservableProperty() public passwordError: string;
  private _events: EventInfo[];
  private _userService: UserService = new UserService();
  private _feedbackService: FeedbackService = new FeedbackService();

  constructor(page: Page) {
    super();
    // Setup initial values on the form
    this.screenHeight = screen.mainScreen.heightDIPs;
    this.headerImageHeight = this.screenHeight * 0.25;
    this.remainingHeight = this.screenHeight * 0.75;
    this.email = "";
    this.password = "";
    this.emailError = "";
    this.passwordError = "";

    // Bind events, and store for later unbinding:
    this._events = EventListeners.bindEvents([
      {
        eventName: "textChange",
        view: page.getViewById("emailField") as View,
        eventHandler: this._onEmailChange,
        viewModel: this
      },
      {
        eventName: "textChange",
        view: page.getViewById("passwordField") as View,
        eventHandler: this._onPasswordChange,
        viewModel: this
      }
    ]);
  }

  public onPageUnloaded(args: EventData): void {
    EventListeners.unbindEvents(this._events);
  }

  /**
   * signInTap
   */
  public async login() {
    try {
      const email = this.email.trim();
      this.emailError = !email ? "Email is required." : "";
      const isValidEmail = emailValidator.validate(email);
      this.emailError = isValidEmail === false ? "Email is invalid." : "";
      this.passwordError = !this.password ? "Password is required." : "";

      if (this.emailError || this.passwordError) {
        return;
      }

      // setup loading indicator
      ProgressService.showSimpleSpinner("Signing in...");
      /// Hide the keyboard
      KeyboardUtil.hideKeyboard();

      // encode the password to make sure special characters are okay
      const password = encodeURIComponent(this.password.trim());

      dialogs.alert(BaseUrl).then(()=> {
    console.log(BaseUrl);
});

      // Send the http request
      const result = await HTTP.request({
        //url: `${BaseUrl}api/MobileApp/MobileLogin?username=${email}&password=${password}`,
        url: `${BaseUrl}api/MobileApp/MobileLogin?username=${email}&password=${password}`,        
        method: "GET",
        timeout: HttpTimeout
      });

      if (result.statusCode !== 200) {
        const obj = result.content.toJSON();
        if (obj.Message) {
          this._feedbackService.info(obj.Message);
        }
        return;
      }

      if (result.statusCode === 200) {
        const userinfo = result.content.toJSON() as UserInfo;

        // Save user info
        this._userService.user = userinfo;
        NavigationService.GoTo(
          NavigationService.MODULES.Dashboard,
          null,
          true,
          true
        );
      }
    } catch (error) {
      this._feedbackService.error("Error during sign in.");
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.Login,
        method: "login",
        message: `Email: ${this.email} Password ${
          this.password
        } \n ${JSON.stringify(error)}`
      });
    } finally {
      ProgressService.hideSpinner();
    }
  }

  private _onEmailChange(args): void {
    this.email = args.object.text;
    const email = this.email.trim();
    this.emailError = !email ? "Email is required." : "";
    if (this.emailError) {
      return;
    }
    const isValidEmail = emailValidator.validate(email);
    this.emailError = isValidEmail === false ? "Email is invalid." : "";
  }

  public _onPasswordChange(args) {
    this.password = args.object.text;
    this.passwordError = !this.password ? "Password is required." : "";
  }
}
