import * as appSettings from "tns-core-modules/application-settings";
import { Route } from "../models";

const RECENT_ROUTES_CACHE_KEY: string = "RECENT_ROUTES_CACHE";

/**
 * Recent Routes Cache Service
 */
export class RecentRoutesCacheService {
  /**
     * Save the route to the cache.
     * @param {Route} route - The route to save.
     */
  public static saveRouteToCache(route: Route): void {
    if (route && route.origin && route.destination) {
      try {
        // check to make sure we have RECENT_ROUTES_CACHE in app-settings
        if (!appSettings.hasKey(RECENT_ROUTES_CACHE_KEY)) {
          appSettings.setString(RECENT_ROUTES_CACHE_KEY, "");
        }

        // parse the RECENT_ROUTES_CACHE and push the new route to the array.
        let recentRoutes = appSettings.getString(RECENT_ROUTES_CACHE_KEY);

        let parsedRecentRoutes: Route[];
        if (recentRoutes === "") {
          parsedRecentRoutes = [];
        } else {
          parsedRecentRoutes = JSON.parse(recentRoutes);
        }

        if (parsedRecentRoutes.length >= 1) {
          // make sure this route isn't already in the Cache
          // for (let i = 0 i < parsedRecentRoutes.length i++) {
          //     let element = parsedRecentRoutes[i]
          //     console.log(element)
          // }
          for (let i in parsedRecentRoutes) {
            // console.log('saved route i = ' + i)
            if (
              parsedRecentRoutes[i].origin !== route.origin &&
              parsedRecentRoutes[i].destination !== route.destination
            ) {
              parsedRecentRoutes.push(route);
              console.log("saved route to cache");
              break;
            }
          }
        } else {
          parsedRecentRoutes.push(route);
        }

        // now stringify the parsedRecentRoutes object with the new route added and save.
        appSettings.setString(
          RECENT_ROUTES_CACHE_KEY,
          JSON.stringify(parsedRecentRoutes)
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
     * Get the RECENT_ROUTES_CACHE from app-settings
     */
  public static getRecentRoutesCache(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (appSettings.hasKey(RECENT_ROUTES_CACHE_KEY) === true) {
          let recentRoutes = appSettings.getString(RECENT_ROUTES_CACHE_KEY);

          let parsedRoutes: Route[];

          if (recentRoutes === "") {
            parsedRoutes = [];
          } else {
            try {
              parsedRoutes = JSON.parse(recentRoutes);
            } catch (error) {
              console.log(error);
            }
          }

          resolve(parsedRoutes);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
