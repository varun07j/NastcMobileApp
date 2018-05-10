import { LoadingIndicator } from "nativescript-loading-indicator";

export class ProgressService {
  private static _loader = new LoadingIndicator();
  private static _loaderOptions = {
    message: "Loading...",
    android: { cancelable: true },
    ios: { dimBackground: true }
  };

  public static showSimpleSpinner(message: string = "Loading...") {
    this._loaderOptions.message = message;
    this._loader.show(this._loaderOptions);
  }

  public static hideSpinner() {
    this._loader.hide();
  }
}
