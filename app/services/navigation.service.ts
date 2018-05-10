import { topmost, NavigationEntry } from "tns-core-modules/ui/frame";
import * as appSettings from "tns-core-modules/application-settings";

/**
 * Navigation Service
 */
export class NavigationService {
  public static MODULES: ModuleKeys = {
    CompanyDirectory: "screens/company-directory/company-directory",
    ForgotPassword: "screens/forgot-password/forgot-password",
    HelpCenter: "screens/help-center/help-center",
    Login: "screens/login/login",
    MainPage: "screens/main-page/main-page",
    NastcServices: "screens/nastc-services/nastc-services",
    QpnMain: "screens/qpn-main/qpn-main",
    RoutePlanner: "screens/route-planner/route-planner",
    SignUp: "screens/sign-up/sign-up",
    Dashboard: "screens/dashboard/dashboard"
  };

  /**
     * Navigate to a module.
     * @param {string} [moduleName] - the module to navigate to.
     * @param {any} [context = null] - Context to pass to the next page.
     * @param {boolean} [animated =  true] - To animate the transition.
     * @param {string} [transitionName = 'fade'] - The transition animation.
     * @param {number} [transitionDuration = 300] - The transition duration.
     * @param {boolean} [clearHistory=false] - Set to clear the history from the nav stack.
     * @param {boolean} [backstackVisible=true] - Set to false to remove the page from the nav stack when navigating away from.
     */
  public static GoTo(
    moduleName: string,
    context: any = null,
    clearHistory: boolean = false,
    backstackVisible: boolean = true,
    animated: boolean = true,
    transitionName: string = "fade",
    transitionDuration: number = 300
  ) {
    const navEntry: NavigationEntry = {
      moduleName: moduleName,
      context: context,
      animated: animated,
      transition: {
        name: transitionName,
        duration: transitionDuration,
        curve: "easeIn"
      },
      clearHistory: clearHistory,
      backstackVisible: backstackVisible
    };

    topmost().navigate(navEntry);
  }

  /**
     * Sign Out of App - clear history and go to login
     */
  public static SignOutOfApp() {
    // guess we can remove the userinfo key from app-settings
    appSettings.remove("UserInfo");

    const navEntry: NavigationEntry = {
      moduleName: NavigationService.MODULES.Login,
      animated: true,
      transition: {
        name: "slideRight",
        duration: 300,
        curve: "easeIn"
      },
      clearHistory: true,
      backstackVisible: false
    };

    topmost().navigate(navEntry);
  }

  public static GoBack() {
    if (topmost().canGoBack()) {
      topmost().goBack();
    }
  }
}

interface ModuleKeys {
  CompanyDirectory: string;
  ForgotPassword: string;
  HelpCenter: string;
  Login: string;
  MainPage: string;
  NastcServices: string;
  QpnMain: string;
  RoutePlanner: string;
  SignUp: string;
  Dashboard: string;
}
