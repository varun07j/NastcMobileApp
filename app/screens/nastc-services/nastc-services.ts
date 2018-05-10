import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { NastcServicesViewModel } from "./nastc-services-view-model";

// Event handler for Page "loaded" event attached in main-page.xml
export function onLoaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new NastcServicesViewModel();
}
