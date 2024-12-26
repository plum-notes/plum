//import * as app from "./app";
import * as app from "./windows/app";
import * as devEntry from "./windows/devEntry";
// import {ipcRenderer} from 'electron';

/**
 * Init
 */
function init(){
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    switch (page) {
        case "index.html":
            devEntry.init();
            break;
        case "app.html":
            app.init();
            break;
        default:
            break;
    }
    
}
init();
