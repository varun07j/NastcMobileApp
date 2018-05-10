import { QpnLocation } from "./qpn-location";
export interface QpnMapPointsAndMarkers {
  distance: number;
  travelTime: string;
  origin: string;
  destination: string;
  mapPoints: Array<any>;
  qpnMarkers: Array<QpnLocation>;
}
