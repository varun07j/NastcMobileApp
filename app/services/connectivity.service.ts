import { getConnectionType } from "tns-core-modules/connectivity";

export class ConnectionService {
  /**
     * Get the current connection.
     * 0 = NONE, 1 = WIFI, 2 = MOBILE
     */
  public static connectionType(): number {
    const conn = getConnectionType();
    return conn;
  }

  /**
     * Get the current connection string value.
     * 0 = NONE, 1 = WIFI, 2 = MOBILE
     */
  public static connectionTypeName(): string {
    const conn = getConnectionType();
    let result: string;
    switch (conn) {
      case 0:
        result = "NONE";
        break;
      case 1:
        result = "WIFI";
        break;
      case 2:
        result = "MOBILE";
        break;
    }

    return result;
  }
}
