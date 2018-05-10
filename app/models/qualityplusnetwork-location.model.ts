export class QualityPlusNetworkLocation {
  id: number;
  merchant_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  location: string;
  latitude: number;
  longitude: number;
  phone?: string;
  showers?: any;
  parking_space?: any;
  def?: boolean;
  scales?: any;
  wifi?: boolean;
  atm?: any;
  tire_care?: any;
  laundry?: any;
  gym?: boolean;
  overnight_parking?: boolean;
  pet_friendly?: any;
  rv_dump_station?: boolean;
  maintenance?: boolean;
  restaurants?: boolean;
  pricingInfo?: {
    yesterday: any;
    today: any;
    tomorrow: any;
  };
}
