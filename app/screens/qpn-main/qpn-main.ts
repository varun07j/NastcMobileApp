import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { QpnMainViewModel } from "./qpn-main-view-model";

// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: EventData) {
  const page = args.object as Page;
  page.bindingContext = new QpnMainViewModel(page);
}
