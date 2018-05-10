import { Accuracy } from "tns-core-modules/ui/enums";
import * as http from "tns-core-modules/http";
import * as geolocation from "nativescript-geolocation";
import { BaseUrl } from "../utils";

export class LocationService {
  public isLocationEnabled(): boolean {
    return geolocation.isEnabled();
  }
  public enableLocation(): Promise<any> {
    if (!geolocation.isEnabled()) {
      console.log("Location not enabled, requesting...");
      return geolocation.enableLocationRequest();
    } else {
      return Promise.resolve(true);
    }
  }

  public getDeviceLocation(): Promise<any> {
    if (geolocation.isEnabled() === true) {
      return geolocation.getCurrentLocation({
        desiredAccuracy: Accuracy.high,
        // maximumAge: 10000,
        timeout: 5000
      });
    } else {
      this.enableLocation().then(
        result => {
          this.getDeviceLocation();
        },
        () => {
          return Promise.reject("Location service not enabled.");
        }
      );
    }
  }

  //   public positionFromAddress(address: string, city?: string, state?: string) {
  //     const stringParts = address.split(" ");
  //     let urlAddress: string = "";
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let i = 0; i < stringParts.length; i++) {
  //       urlAddress += stringParts[i] + "+";
  //     }
  //     console.log(`urlAddress = ${urlAddress.trim()}`);

  //     return http.getJSON(
  //       `${this.googleMapsGeocodeBaseUrl}?address=${urlAddress.trim()}&key=${this
  //         .googleMapApiKey}`
  //     );
  //   }

  /**
         * Reverse geocode a position from lat/long coordinates.
         * @param lat
         * @param lng
         */
  public reverseGeocode(lat, lng) {
    console.log("start reverseGeoCode");
    return http.getJSON(
      `${BaseUrl}api/mapbox/reverseGeocodeAsync?latitude=${lat}&longitude=${lng}`
    );
  }

  public parseGeocode(data) {
    console.log("start parseGeoCode");

    let result;
    if (data.results[0] && data.results[0].formatted_address) {
      result = data.results[0].formatted_address;
    }
    return result;
  }

  public static UsStatesList = [
    {
      display: "Alabama",
      value: "AL"
    },
    // {
    //   display: "Alaska",
    //   value: "AK"
    // },
    {
      display: "Arizona",
      value: "AZ"
    },
    {
      display: "Arkansas",
      value: "AR"
    },
    {
      display: "California",
      value: "CA"
    },
    {
      display: "Colorado",
      value: "CO"
    },
    {
      display: "Connecticut",
      value: "CT"
    },
    {
      display: "Delaware",
      value: "DE"
    },
    {
      display: "District Of Columbia",
      value: "DC"
    },
    {
      display: "Florida",
      value: "FL"
    },
    {
      display: "Georgia",
      value: "GA"
    },
    // {
    //   display: "Guam",
    //   value: "GU"
    // },
    // {
    //   display: "Hawaii",
    //   value: "HI"
    // },
    {
      display: "Idaho",
      value: "ID"
    },
    {
      display: "Illinois",
      value: "IL"
    },
    {
      display: "Indiana",
      value: "IN"
    },
    {
      display: "Iowa",
      value: "IA"
    },
    {
      display: "Kansas",
      value: "KS"
    },
    {
      display: "Kentucky",
      value: "KY"
    },
    {
      display: "Louisiana",
      value: "LA"
    },
    {
      display: "Maine",
      value: "ME"
    },
    // {
    //   display: "Marshall Islands",
    //   value: "MH"
    // },
    {
      display: "Maryland",
      value: "MD"
    },
    {
      display: "Massachusetts",
      value: "MA"
    },
    {
      display: "Michigan",
      value: "MI"
    },
    {
      display: "Minnesota",
      value: "MN"
    },
    {
      display: "Mississippi",
      value: "MS"
    },
    {
      display: "Missouri",
      value: "MO"
    },
    {
      display: "Montana",
      value: "MT"
    },
    {
      display: "Nebraska",
      value: "NE"
    },
    {
      display: "Nevada",
      value: "NV"
    },
    {
      display: "New Hampshire",
      value: "NH"
    },
    {
      display: "New Jersey",
      value: "NJ"
    },
    {
      display: "New Mexico",
      value: "NM"
    },
    {
      display: "New York",
      value: "NY"
    },
    {
      display: "North Carolina",
      value: "NC"
    },
    {
      display: "North Dakota",
      value: "ND"
    },
    // {
    //   display: "Northern Mariana Islands",
    //   value: "MP"
    // },
    {
      display: "Ohio",
      value: "OH"
    },
    {
      display: "Oklahoma",
      value: "OK"
    },
    {
      display: "Oregon",
      value: "OR"
    },
    // {
    //   display: "Palau",
    //   value: "PW"
    // },
    {
      display: "Pennsylvania",
      value: "PA"
    },
    // {
    //   display: "Puerto Rico",
    //   value: "PR"
    // },
    {
      display: "Rhode Island",
      value: "RI"
    },
    {
      display: "South Carolina",
      value: "SC"
    },
    {
      display: "South Dakota",
      value: "SD"
    },
    {
      display: "Tennessee",
      value: "TN"
    },
    {
      display: "Texas",
      value: "TX"
    },
    {
      display: "Utah",
      value: "UT"
    },
    {
      display: "Vermont",
      value: "VT"
    },
    // {
    //   display: "Virgin Islands",
    //   value: "VI"
    // },
    {
      display: "Virginia",
      value: "VA"
    },
    {
      display: "Washington",
      value: "WA"
    },
    {
      display: "West Virginia",
      value: "WV"
    },
    {
      display: "Wisconsin",
      value: "WI"
    },
    {
      display: "Wyoming",
      value: "WY"
    }
  ];
}
