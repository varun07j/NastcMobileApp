// import * as appSettings from 'application-settings'
// import { IFuelStop } from '../../shared/interfaces/fuel-stop'

/**
 * Fuel Pricing Cache Service
 */
export class FuelPricingCacheService {

    /**
     * Check if TodayQpnPrices is in appSettings
     * @param {any} [fueldate] - the fueldate to check.
     */
    // public static CheckIfTodayPricingIsCached(fueldate: any): boolean {
    //     if (fueldate) {

    //         // check in app settings for value
    //         let todayPricing: Array<FuelStop> = JSON.parse(appSettings.getString('TodayQpnPrices'))

    //         // If today pricing exists return true
    //         if (todayPricing[0].fueldate === fueldate) {
    //             return true // yay - its already cached.
    //         } else {
    //             return false // no todayPricing cached
    //         }

    //     } else {
    //         return false
    //     }
    // }

    // public static CacheTodayPricing(data: Array<FuelStop>) {
    //     try {
    //         let dataString: string = JSON.stringify(data)
    //         appSettings.setString('TodayQpnPrices', dataString)
    //     } catch (error) {
    //         console.log('ERROR in CacheTodayPricing: ' + error)
    //     }
    // }

    // /** Add a fuel stop merchant number to favorite list.
    //  * @param {number} [merchant] - the merchant number to save.
    //  */
    // public static AddStop(merchant: string) {
    //     let savedStops = appSettings.getString('favorite-fuel-stops')
    //     if (savedStops) {
    //         let parsedList = JSON.parse(savedStops)
    //         parsedList.push
    //     } else {
    //         let stop = { merchant }
    //         let newStopList = appSettings.setString('favorite-fuel-stops', JSON.stringify(stop))
    //     }
    // }

    // /**
    //  * Remove a Stop from favorite list.
    //  * @param {number} [merchant] - the merchant number to delete.
    //  */
    // public static RemoveStop(merchant: string) {
    //     // parse the JSON list from app-settings
    //     let savedStops = appSettings.getString('favorite-fuel-stops')
    //     if (savedStops) {

    //         let parsedStopList = JSON.parse(savedStops)

    //         for (let key in parsedStopList) {
    //             if (parsedStopList.hasOwnProperty(key)) {
    //                 let value = parsedStopList[key]
    //                 console.log('VALUE: ' + value)
    //             }
    //         }

    //     }
    // }

}
