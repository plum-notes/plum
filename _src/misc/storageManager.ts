import * as lockr from 'lockr'

let projectPrefix = '';

export function initData(prefix='data'){
    // //@ts-expect-error outdated /@type
    // lockr.setPrefix(prefix);
    projectPrefix = prefix;
}

export function setAppVar(id:string, data:any){
    lockr.set(Prefixes.AppData+id, data);
}

export function getAppVar(id:string|null){
    if(id==null)
        return null;
    return lockr.get(Prefixes.AppData+id);
}

export function setUserVar(id:string, data:any){
    lockr.set(getProjectPrefix()+Prefixes.UserData+Prefixes.Vars+id, data);
}

export function getUserVar(id:string|null){
    if(id==null)
        return null;
    return lockr.get(getProjectPrefix()+Prefixes.UserData+Prefixes.Vars+id);
}

function getProjectPrefix(){
    return Prefixes.Proj1+projectPrefix+Prefixes.Proj2;
}

// export function setUserAuto_OLD(category:AutoCategories_OLD, id:string, data:any){
//     lockr.set(Prefixes.UserData+Prefixes.Auto+category+id, data);
// }

// export function getUserAuto_OLD(category:AutoCategories_OLD, id:string):any{
//     return lockr.get(Prefixes.UserData+Prefixes.Auto+category+id);
// }

enum Prefixes{
    AppData     = "app_",
    UserData    = "user_",
        Vars    = "vars_",
        Proj1    = "proj[",
        Proj2    = "]_",
        // Auto    = "auto_",
}

// export enum AutoCategories_OLD{
//     Checkbox     = "cb_",
// }

