import * as appSettings from "tns-core-modules/application-settings";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { EventData } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button";
import { DatabaseService } from "./database.service";
import { LoggingService } from "./logging.service";
import { NavigationService } from "./navigation.service";
import { FeedbackService } from "./feedback.service";
import { FuelStop } from "../models";
import { TwitterBang, ITwitterBangOptions } from "nativescript-twitterbang";

const _feedbackService: FeedbackService = new FeedbackService();

export class FavoriteStopsService {
  /**
   * Returns an array of favorite stops if any exists.
   */
  public static getFavoriteFuelStops(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // check db service first for LS
        const favStops = DatabaseService.getItem(
          DatabaseService.KEYS.FavoriteFuelStops
        );
        if (favStops) {
          const result = JSON.parse(favStops);
          resolve(result);
          return;
        } else if (appSettings.hasKey(DatabaseService.KEYS.FavoriteFuelStops)) {
          const stops = appSettings.getString(
            DatabaseService.KEYS.FavoriteFuelStops
          );
          // save in DB so its available later and we can dump app-settings
          DatabaseService.setItem(
            DatabaseService.KEYS.FavoriteFuelStops,
            stops
          );
          const result = JSON.parse(stops);
          resolve(result);
        } else {
          resolve([]);
          return;
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if the merchant is already in the favorite list.
   * @param {string} [merchant] - the merchant number to check for.
   */
  public static CheckIfFavoriteStopExists(merchant: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        let savedStops = DatabaseService.getItem(
          DatabaseService.KEYS.FavoriteFuelStops
        );

        // check if it's in app-settings as fallback for now
        if (!savedStops) {
          savedStops = appSettings.getString(
            DatabaseService.KEYS.FavoriteFuelStops
          );
          // set it in db
          DatabaseService.setItem(
            DatabaseService.KEYS.FavoriteFuelStops,
            savedStops
          );
          // then get it from db
          savedStops = DatabaseService.getItem(
            DatabaseService.KEYS.FavoriteFuelStops
          );
        }

        if (savedStops) {
          const parsedList = JSON.parse(savedStops);
          let result = false;

          for (let i = 0; i < parsedList.length; i++) {
            const stop = parsedList[i];
            if (stop.merchant === merchant) {
              // found the stop
              result = true;
              break;
            }
          }

          resolve(result);
        } else {
          // no favorite stops in app-settings
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add a fuel stop merchant number to favorite list.
   * @param {number} [merchant] - the merchant to save.
   */
  public static AddFavoriteStop(merchant: string) {
    let savedStops = DatabaseService.getItem(
      DatabaseService.KEYS.FavoriteFuelStops
    );

    // check if it's in app-setting as fallback
    if (!savedStops) {
      savedStops = appSettings.getString(
        DatabaseService.KEYS.FavoriteFuelStops
      );
      DatabaseService.setItem(
        DatabaseService.KEYS.FavoriteFuelStops,
        savedStops
      );
    }

    if (savedStops) {
      const parsedList: any[] = JSON.parse(savedStops);
      // push the merchant into the array
      parsedList.push({ merchant });
      // // Save the modified array to appsettings (stringify the value)
      // appSettings.setString(
      //   DatabaseService.KEYS.FavoriteFuelStops,
      //   JSON.stringify(parsedList)
      // );
      // // set in db service which uses LS
      DatabaseService.setItem(
        DatabaseService.KEYS.FavoriteFuelStops,
        JSON.stringify(parsedList)
      );
    } else {
      const favoriteStopArray = [{ merchant }];
      // set in db service which uses LS
      DatabaseService.setItem(
        DatabaseService.KEYS.FavoriteFuelStops,
        JSON.stringify(favoriteStopArray)
      );
      // for fallback right now - will remove in future
      appSettings.setString(
        DatabaseService.KEYS.FavoriteFuelStops,
        JSON.stringify(favoriteStopArray)
      );
    }
  }

  /**
   * Remove a Stop from favorite list.
   * @param {number} [merchant] - the merchant to delete.
   */
  public static RemoveFavoriteStop(merchant: string) {
    // parse the JSON list from app-settings
    let savedStops = DatabaseService.getItem(
      DatabaseService.KEYS.FavoriteFuelStops
    );

    // check if it's in db service layer
    if (!savedStops) {
      savedStops = appSettings.getString(
        DatabaseService.KEYS.FavoriteFuelStops
      );
      DatabaseService.setItem(
        DatabaseService.KEYS.FavoriteFuelStops,
        savedStops
      );
    }

    if (savedStops) {
      const parsedStopList: any[] = JSON.parse(savedStops);

      for (let index = 0; index < parsedStopList.length; index++) {
        const stop = parsedStopList[index];
        if (stop.merchant === merchant) {
          if (index > -1) {
            parsedStopList.splice(index, 1);
            // save in LS using db layer
            DatabaseService.setItem(
              DatabaseService.KEYS.FavoriteFuelStops,
              JSON.stringify(parsedStopList)
            );

            // Save the modified array
            appSettings.setString(
              DatabaseService.KEYS.FavoriteFuelStops,
              JSON.stringify(parsedStopList)
            );
          }
          // break out after a match is found and removed
          break;
        }
      }
    }
  }

  /**
   * Modify the fuel stops array checking for favorite stops in storage
   */
  public static async modifyStopsWithFavorites(
    stopArray: ObservableArray<FuelStop>
  ) {
    // Get the Favorite Stop Array from storage (in this class ^^^)
    const favs = await FavoriteStopsService.getFavoriteFuelStops();

    // Loop over the favorite stops and find matching merchant IDs and modify the ObservableArray of fuel stops
    for (let i = favs.length; i--; ) {
      const obj = favs[i];
      const merchant = obj.merchant;

      for (let j = stopArray.length; j--; ) {
        const stop = stopArray[j] as FuelStop;
        // check type on merchant and force to string
        if (typeof stop.merchant !== "string") {
          stop.merchant = (stop.merchant as any).toString();
        }
        if (stop.merchant === merchant) {
          stop.isFavorite = true;
          break;
        }
      }
    }
  }

  /**
   * Add or remove fuel stop from favorite list.
   * On Android animate the args.object (button) with the TwitterBang animation.
   * On iOS animate the button using the view's animation API.
   */
  public static async favoriteStopToggle(stop: FuelStop, btn: Button) {
    try {
      // Check if the fuel stop merchant is already in the favorite list
      const result = await FavoriteStopsService.CheckIfFavoriteStopExists(
        stop.merchant
      );

      if (result === false) {
        // Add the Stop to favorites
        FavoriteStopsService.AddFavoriteStop(stop.merchant);

        if (isAndroid) {
          const bangOptions: ITwitterBangOptions = {
            view: btn,
            colors: ["#fff000", "#ff4081", "#3489db"],
            dotNumber: 30
          };
          TwitterBang(bangOptions);
        }

        /// toggle the classes for color :)
        btn.classList.add("favorite-stop");
        btn.classList.remove("not-favorite-stop");

        // set the isFavorite prop to true
        stop.isFavorite = true;

        if (isIOS) {
          /// Favorite Animation
          await btn.animate({
            duration: 250,
            scale: {
              x: 1.6,
              y: 1.6
            }
          });
          return btn.animate({
            duration: 200,
            scale: {
              x: 1,
              y: 1
            }
          });
        }
      } else {
        // Remove the stop from favorites
        FavoriteStopsService.RemoveFavoriteStop(stop.merchant);
        // set the isFavorite prop to false to update UI
        stop.isFavorite = false;
        btn.classList.add("not-favorite-stop");
        btn.classList.remove("favorite-stop");
      }
    } catch (error) {
      _feedbackService.error(
        "An error occurred trying to favorite this fuel stop. Please try again."
      );
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.QpnMain,
        method: "favoriteStopToggle",
        message: JSON.stringify(error)
      });
    }
  }
}
