/// core
import * as HTTP from "tns-core-modules/http";
import { Observable, EventData } from "tns-core-modules/data/observable";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { isAndroid, isIOS } from "tns-core-modules/platform";
/// models
import { CompanyEmployee } from "../../models/company-employee";
/// services
import {
  LoggingService,
  NavigationService,
  FeedbackService
} from "../../services";
import { BaseUrl, HttpTimeout, Helpers } from "../../utils";

declare var UITableViewCellSelectionStyleNone: any;

export class CompanyDirectoryViewModel extends Observable {
  public nastcEmployees: CompanyEmployee[] = [];
  private _feedbackService: FeedbackService = new FeedbackService();

  constructor() {
    super();
    LoggingService.Add_ScreenView(NavigationService.MODULES.CompanyDirectory);
    this._getEmployees();
  }

  public goBack() {
    NavigationService.GoTo(NavigationService.MODULES.MainPage);
  }

  /**
     * emailTap
     */
  public async emailTap(args: EventData) {
    const employee = (args.object as any).bindingContext as CompanyEmployee;
    if (employee) {
      Helpers.openEmail(
        "NASTC Mobile App Contact",
        `Hi, ${employee.Name} \n`,
        employee.Email
      );
    }
  }

  /**
     * onItemLoading event for the listview items
     */
  public onItemLoading(args: ItemEventData) {
    /// just disabling the iOS item selection highlighting
    if (isIOS) {
      const cell = args.ios;
      if (cell) {
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
      }
    }
  }

  /**
     * Get Nastc Employee Directory
     */
  private async _getEmployees() {
    try {
      // send the http request
      const result = await HTTP.getJSON({
        url: `${BaseUrl}api/NastcEmployees`,
        method: "GET",
        timeout: HttpTimeout
      });
      if (result) {
        this.set("nastcEmployees", result);
      }
    } catch (error) {
      this._feedbackService.error(
        "Ooops! An error occurred getting the NASTC employee directory."
      );
      LoggingService.Log_Exception({
        module: NavigationService.MODULES.CompanyDirectory,
        method: "getEmployees",
        message: JSON.stringify(error)
      });
    }
  }
}
