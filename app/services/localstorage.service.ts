import "nativescript-localstorage";
import { LoggingService } from "./logging.service";

// tslint:disable-next-line:class-name
export class LOCAL_STORAGE {
  public setItem(key: string, value) {
    try {
      if (typeof value === "object") {
        JSON.stringify(value);
      }
      localStorage.setItem(key, value);
      return;
    } catch (error) {
      LoggingService.Log_Exception({
        module: "localstorage.service",
        method: "setItem",
        message: error
      });
    }
  }

  /**
   * Get an item from localStorage.
   * @param key
   */
  public getItem(key: string) {
    try {
      const result = localStorage.getItem(key);

      // only parse if object, otherwise error thrown
      // if (typeof result === "string") {
      //   result = JSON.parse(result);
      // }
      return result;
    } catch (error) {
      LoggingService.Log_Exception({
        module: "localstorage.service",
        method: "getItem",
        message: error
      });
    }
  }

  /**
   * Delete an item from localStorage.
   * @param key
   */
  public removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      LoggingService.Log_Exception({
        module: "localstorage.service",
        method: "removeItem",
        message: error
      });
    }
  }

  /**
   * Deletes all data stored. *** WARNING *** - only use if you are sure you need to do this.
   */
  public clearAllItems() {
    try {
      localStorage.clear();
    } catch (error) {
      LoggingService.Log_Exception({
        module: "localstorage.service",
        method: "clearAllItems",
        message: error
      });
    }
  }
}
