import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { CompanyDirectoryViewModel } from "./company-directory-view-model";

// Event handler for Page "onLoaded" event attached in main-page.xml
export function pageLoaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new CompanyDirectoryViewModel();
}
