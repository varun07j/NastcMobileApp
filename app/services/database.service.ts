import "nativescript-localstorage";
import * as appSettings from "tns-core-modules/application-settings";
import { LoggingService } from "./logging.service";
import { LOCAL_STORAGE } from "./localstorage.service";

export class DatabaseService {
  public static LOCAL_STORAGE: LOCAL_STORAGE = new LOCAL_STORAGE();

  public static KEYS: IKeys = {
    UserInfo: "UserInfo",
    UserMapboxStyle: "USER_MAPBOX_MAP_STYLE",
    FavoriteFuelStops: "favorite-fuel-stops",
    CachedQpnLocations: "cached-qpn-locations"
  };

  public static setItem(key: string, value) {
    try {
      if (typeof value === "object") {
        JSON.stringify(value);
      }
      localStorage.setItem(key, value);
      return;
    } catch (error) {
      LoggingService.Log_Exception({
        module: "database.service",
        method: "setItem",
        message: error
      });
    }
  }

  /**
   * Get an item from localStorage.
   * @param key
   */
  public static getItem(key: string): string | any {
    try {
      const result = localStorage.getItem(key);
      return result;
    } catch (error) {
      LoggingService.Log_Exception({
        module: "database.service",
        method: "getItem",
        message: error
      });
    }
  }

  /**
   * Delete an item from localStorage.
   * @param key
   */
  public static removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      LoggingService.Log_Exception({
        module: "database.service",
        method: "removeItem",
        message: error
      });
    }
  }

  /**
   * Deletes all data stored. *** WARNING *** - only use if you are sure you need to do this.
   */
  public static clearAllItems() {
    try {
      localStorage.clear();
    } catch (error) {
      LoggingService.Log_Exception({
        module: "database.service",
        method: "clearAllItems",
        message: error
      });
    }
  }

  /**
   * Will remove the cached data for items that are only cached for the session.
   * If we add more things that get cached during the session, add them here so we remove on exit event.
   */
  public static clearSessionCacheData() {
    try {
      // localStorage.removeItem(DatabaseService.KEYS.CachedQpnLocations);
    } catch (error) {
      LoggingService.Log_Exception({
        module: "database.service",
        method: "clearSessionCacheData",
        message: error
      });
    }
  }
}

interface IKeys {
  UserInfo: string;
  UserMapboxStyle: string;
  FavoriteFuelStops: string;
  CachedQpnLocations: string;
}
