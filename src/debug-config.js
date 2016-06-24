import {inject} from "fluxtuate"

//Views
import DebugView from "./debug-view"
import {DebugMediator} from "fluxtuate-tools-plugin"

export default class Config {
    @inject
    mediatorMap;

    configure() {
        //map mediators
        this.mediatorMap.mapView(DebugView, DebugMediator);
    }
}