export interface FuelStop {
  id: number;
  merchant?: string;
  merchant_id?: number;
  fueldate: any;
  name: string;
  city: string;
  state: string;
  location: string;
  latitude?: number;
  longitude?: number;
  maxprice?: any;
  centsoff?: any;
  netofstatetax?: any;
  phone?: string;
  isFavorite?: boolean;
}
