import * as TNSLocation from "nativescript-geolocation";

declare var android: any;

/**
 * Contains the Device Util
 */
export class DeviceUtil {
  /**
   * Get the device location
   * @returns {object} - The user last known location.
   */
  public static getDeviceLocation(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // see if location services are enabled
        if (!TNSLocation.isEnabled()) {
          TNSLocation.enableLocationRequest();
        } else {
          console.log("No location turned on");
          return;
        }

        let opts: TNSLocation.Options = {
          desiredAccuracy: 5,
          maximumAge: 20000,
          timeout: 8000
        };

        // Get the current location of the device
        TNSLocation.getCurrentLocation(opts).then(
          loc => {
            resolve(loc);
          },
          err => {
            reject(err);
          }
        );
      } catch (error) {
        console.log("getDeviceLocation Error: " + error);
        reject(error);
      }
    });
  }

  /**
   * Get the last known location of the device.
   */
  public static getLastKnownDeviceLocation(): void {
    let opts: TNSLocation.Options = {
      desiredAccuracy: 5,
      maximumAge: 240000,
      timeout: 20000
    };

    // Get the current location of the device
    TNSLocation.getCurrentLocation(opts).then(
      loc => {
        return loc;
      },
      err => {
        return null;
      }
    );
  }
}
