import * as http from "tns-core-modules/http";
import { MapStyle } from "nativescript-mapbox";
import { LoggingService, CLog } from "../services/logging.service";
import { LocationService } from "./location.service";
import { BaseUrl, HttpTimeout } from "../utils";
import { CoordinateSet } from "../models";

/**
 * Mapping Service
 */
export class MappingService {
  public static MapBox_BaseApiUrl: string = "https://api.mapbox.com/";

  /**
   * Nastek's MapBox token
   */
  public static MapBox_AccessToken: string = "pk.eyJ1IjoibmFzdGVrZGV2ZWxvcGVyIiwiYSI6ImNpdTl1c2N0bzAwMDIyb2wzNTVmbnlvaDUifQ.aY8cgKVCUsGoWNXRGM1N_Q";

  /**
   * Geocode a location
   * @param {string} location - The location string to geocode.
   */
  public static GeoCode(location: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!location) {
          reject("Latitude and Longitude are required.");
        }

        const requestUrl = `${BaseUrl}api/MapBox/GeocodeAsync?location=
          ${location}`;

        const opt: http.HttpRequestOptions = {
          method: "GET",
          url: requestUrl,
          timeout: HttpTimeout
        };

        const result = await http.request(opt);
        if (result.statusCode === 200) {
          resolve(result.content.toJSON());
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "mapping.service.ts",
          method: "GeoCode",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Reverse GeoCode a set of coordinates.
   * @param {number} latitude
   * @param {number} longitude
   */
  public static ReverseGeoCode(
    latitude: number,
    longitude: number
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!latitude || !longitude) {
          reject("Latitude and Longitude are required.");
        }

        const requestUrl = `${BaseUrl}api/MapBox/ReverseGeocodeAsync?latitude=${latitude}&longitude=
          ${longitude}`;

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
          reject();
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "mapping.service.ts",
          method: "ReverseGeoCode",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * GetDirections from MapBox using the NastekApi
   * https://api.nastek.com/api/mapbox/directions
   * @param {CoordinateSet[]} coordinates - The set of coordinate pairs to get Directions for.
   * @param {string} [profile=driving] - The mapbox profile to use (cycling, driving, walking) - we default to driving so it's optional to send this argument.
   */
  public static GetDirections(
    coordinates: CoordinateSet[],
    profile: string = "driving"
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (coordinates.length <= 1) {
          reject("More than one coordinate set is required.");
        }

        const data = {
          coordinateList: coordinates,
          profile: profile
        };

        const requestUrl = `${BaseUrl}api/MapBox/Directions`;

        const opts: http.HttpRequestOptions = {
          method: "POST",
          url: requestUrl,
          headers: { "Content-Type": "application/json" },
          content: JSON.stringify(data),
          timeout: HttpTimeout
        };

        const result = await http.request(opts);
        if (result.statusCode === 200) {
          const dataR = result.content.toJSON();
          resolve(dataR);
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "mapping.service.ts",
          method: "GetDirections",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Get MapPoints and the QPN location(s) coordinate for the route from MapBox using the NastekApi
   * @param {string} origin - The origin of the route.
   * @param {string} destination - The destination of the route.
   */
  public static GetMapPointsAndMarkers(
    origin: string,
    destination: string
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!origin || !destination) {
          reject("Origin and Destination are required.");
        }

        // Current routing cannot handle "United States" in the locations
        // we reverse geocode with mapbox and the result contains ", United States"
        // so replacing it should be sufficient in most cases to pass routing
        console.log(`origin`, origin);
        origin = origin.replace(", United States", "");
        console.log(`origin`, origin);

        // Make sure the parameters are encoded for spaces/commas, etc or you get 400
        const requestUrl = encodeURI(
          `${BaseUrl}api/MapBox/GetMapPointsAndMarkers?origin=${origin}&destination=${destination}`
        );
        console.log(`requestUrl`, requestUrl);

        const opts: http.HttpRequestOptions = {
          method: "GET",
          url: requestUrl,
          timeout: 60000
        };

        const result = await http.request(opts);
        if (result.statusCode === 200) {
          let data = result.content.toJSON();
          resolve(data);
        } else {
          reject(result.content.toJSON());
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "mapping.service.ts",
          method: "GetMapPointsAndMarkers",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Get MapPoints and the QPN location(s) coordinate for the route from MapBox using the NastekApi
   * @param {string} origin - The origin of the route.
   * @param {string} destination - The destination of the route.
   */
  public static GetMapboxPointsAndMarkers(
    origin: string,
    destination: string
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!origin || !destination) {
          reject("Origin and Destination are required.");
        }

        // Current routing cannot handle "United States" in the locations
        // we reverse geocode with mapbox and the result contains ", United States"
        // so replacing it should be sufficient in most cases to pass routing
        console.log(`origin`, origin);
        origin = origin.replace(", United States", "");
        console.log(`origin`, origin);

        // Make sure the parameters are encoded for spaces/commas, etc or you get 400
        const requestUrl = encodeURI(
          `${BaseUrl}api/MapBox/GetMapboxPointsAndMarkers?origin=${origin}&destination=${destination}`
        );
        console.log(`requestUrl`, requestUrl);

        const opts: http.HttpRequestOptions = {
          method: "GET",
          url: requestUrl,
          timeout: HttpTimeout
        };

        const result = await http.request(opts);
        if (result.statusCode === 200) {
          let data = result.content.toJSON();
          resolve(data);
        } else {
          reject(result.content.toJSON());
        }
      } catch (err) {
        reject(err);
        LoggingService.Log_Exception({
          module: "mapping.service.ts",
          method: "GetMapboxPointsAndMarkers",
          message: JSON.stringify(err)
        });
      }
    });
  }

  /**
   * Returns a string of 'city, state zip' from the mapbox geocode response data.
   * @param data
   */
  public static parseMapBoxGeocodeResponse(data) {
    let zip;
    let city;
    let state;
    (data.features as any[]).forEach(feature => {
      // get the city
      if (feature && feature.place_type[0] === "place" && feature.text) {
        city = feature.text;
      }
      // get the state name
      if (feature && feature.place_type[0] === "region" && feature.text) {
        state = feature.text;
        // convert the state name to abbreviation
        LocationService.UsStatesList.forEach(item => {
          if (item.display === state) {
            state = item.value;
          }
        });
      }

      if (feature && feature.place_type[0] === "postcode" && feature.text) {
        zip = feature.text;
      }
    });
    return `${city}, ${state} ${zip}`;
  }

  /**
   * Find the mapbox map style enums
   */
  public static getMapBoxStyleEnum(mapstyleString: string): MapStyle {
    let mapstyleEnum: MapStyle;
    if (!mapstyleString) {
      mapstyleString = "traffic-day";
    }
    const styleLowerCase = mapstyleString.toLowerCase().trim();
    switch (styleLowerCase) {
      case "traffic-day":
        mapstyleEnum = MapStyle.TRAFFIC_DAY;
        break;
      case "traffic-night":
        mapstyleEnum = MapStyle.TRAFFIC_NIGHT;
        break;
      case "streets":
        mapstyleEnum = MapStyle.STREETS;
        break;
      case "satellite":
        mapstyleEnum = MapStyle.SATELLITE;
        break;
      case "dark":
        mapstyleEnum = MapStyle.DARK;
        break;
      case "light":
        mapstyleEnum = MapStyle.LIGHT;
        break;
      case "hybrid":
        mapstyleEnum = MapStyle.HYBRID;
        break;
      case "emerald":
        mapstyleEnum = MapStyle.EMERALD;
        break;
      case "outdoors":
        mapstyleEnum = MapStyle.OUTDOORS;
        break;
      case "satellite-streets":
        mapstyleEnum = MapStyle.SATELLITE_STREETS;
        break;
      default:
        mapstyleEnum = MapStyle.TRAFFIC_DAY;
        break;
    }
    return mapstyleEnum;
  }
}
