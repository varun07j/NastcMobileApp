import * as http from "tns-core-modules/http";
import { EventData } from "tns-core-modules/data/observable";
import { confirm } from "tns-core-modules/ui/dialogs";
import { Button } from "tns-core-modules/ui/button";
import { LoggingService, CLog } from "./logging.service";
import { DatabaseService } from "./database.service";
import { NavigationService } from "./navigation.service";
import { FeedbackService } from "./feedback.service";
import { BaseUrl, HttpTimeout, Helpers } from "../utils";
import { FuelStop } from "../models";
import * as SocialShare from "nativescript-social-share";

const _feedbackService = new FeedbackService();

export class QpnLocationsService {
  public static QpnLocations() {
    return new Promise(async (resolve, reject) => {
      try {
        CLog("*** fetching QpnLocations ***");
        const data = await http.getJSON(
          `${BaseUrl}/api/qualityplusnetworklocations`
        );
        // CLog("*** QpnLocations ***", data);
        DatabaseService.setItem(DatabaseService.KEYS.CachedQpnLocations, data);
        resolve(data);
      } catch (error) {
        LoggingService.Log_Exception({
          module: "qpn-locations.service",
          method: "QpnLocations",
          message: error
        });
      }
    });
  }

  public QpnLocationsByLocationRadius(
    latitude: number,
    longitude: number,
    radius: number = 25
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!latitude || !longitude) {
          reject("Latitude and Longitude are required.");
        }

        const requestUrl = `${BaseUrl}api/QualityPlusNetworkLocations/ByRadius?lat=${latitude}&lng=${longitude}&radius=${radius}`;

        const opt: http.HttpRequestOptions = {
          method: "GET",
          url: requestUrl,
          timeout: HttpTimeout
        };

        const result = await http.request(opt);
        if (result.statusCode === 200) {
          let data = result.content.toJSON();
          resolve(data);
        } else {
          reject(result.content.toJSON());
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "qpn-locations.service.ts",
          method: "QpnLocationsByLocationRadius",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Get all location information for a QPN location, plus pricing data.
   * @param id [number] - Id of the QPN location.
   */
  public QpnLocationDetail(id: number) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!id) {
          reject("Location Id is required.");
        }

        const requestUrl = `${BaseUrl}api/QualityPlusNetworkLocations/Information?id=${id}`;
        console.log(
          `QualityPlusNetworkLocation Information Url = `,
          requestUrl
        );

        const opt: http.HttpRequestOptions = {
          method: "GET",
          url: requestUrl,
          timeout: HttpTimeout
        };

        const result = await http.request(opt);
        if (result.statusCode === 200) {
          const data = result.content.toJSON();
          resolve(data);
        } else {
          reject(result.content.toJSON());
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "qpn-locations.service.ts",
          method: "QpnLocationDetail",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Confirm with user if they want to navigate to the fuel stop location.
   */
  public static async navigateToQpnLocation(stop: FuelStop) {
    try {
      const result = await confirm({
        message: `Navigate to ${stop.name}?`,
        okButtonText: "Yes",
        cancelButtonText: "No"
      });

      if (!result) {
        return;
      }

      Helpers.openMapsNavigate(stop.latitude, stop.longitude);

      LoggingService.Log_Event(
        NavigationService.MODULES.QpnMain,
        "navigateToQpnStop",
        "Merchant: " + stop.merchant
      );
    } catch (error) {
      _feedbackService.error(
        "An error occurred trying to open the navigation to this fuel stop. Please try again."
      );
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.QpnMain,
        method: "navigateToQpnStop",
        message: JSON.stringify(error)
      });
    }
  }

  /**
   * Share fuel stop pricing information.
   */
  public static shareQpnLocation(stop: FuelStop) {
    SocialShare.shareText(
      `Truck stop ${stop.name} in ${stop.city}, ${
        stop.state
      } has a max price of ${stop.maxprice} and the discount is ${
        stop.centsoff
      } and net of state tax is ${stop.netofstatetax}`
    );
  }

  /**
   * Call a QPN location if they have a phone number listed.
   * @param args
   */
  public static callQpnLocation(stop: FuelStop) {
    if (stop && stop.phone) {
      Helpers.callNumber(stop.phone);
    }
  }
}
