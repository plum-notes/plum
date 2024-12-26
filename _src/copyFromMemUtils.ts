// import fs from 'fs';
import fse from 'fs-extra';
// import path from 'path'
// import * as main from './main-electron';
const resourcesPath:string = process.resourcesPath+'/extraResources';
const useDebugPaths = !fse.existsSync(resourcesPath);
const libPath:string  = useDebugPaths?'./extraResources/Library':resourcesPath+'/Library';
const projPath:string = useDebugPaths?'./extraResources/Help'   :resourcesPath+'/Help';
// const libPathDeb:string = './extraResources/Library';
// const projPathDeb:string = './extraResources/Help';
const libraryDefaultName = 'PlumLibrary';
const helpProjectDefaultName = 'PlumHelpProject';

export function generateHelpProject(path:string, cb:{(path: string): void}){
    const newPath = path+'/'+helpProjectDefaultName;
    fse.mkdir(newPath, (err) => {
        if (err) {
            // return 
            console.error(err);
        }
        fillFolderWithHelpProject(newPath, ()=>cb(newPath));
        
        // console.log('Directory created successfully!');
    })
    return newPath
}

export function generateLibrary(path:string, cb:{(path: string): void}){
    const newPath = path+'/'+libraryDefaultName;
    fse.mkdir(newPath, (err) => {
        if (err) {
            // return 
            console.error(err);
        }
        fillFolderWithDefaultLibrary(newPath, ()=>cb(newPath));
        // console.log('Directory created successfully!');
    })
    return newPath
}
function fillFolderWithHelpProject(path:string, cb:{(): void}){
    const existPath = fse.existsSync(projPath);
    if(!existPath)
        return;
    // console.log(existPath);
    // main.sendMessage(existPath?'true':'false');
    fse.copy(projPath, path).then(()=>{
        // main.sendMessage('success!!!!!!!');
        cb();
    }).catch(err => {console.error(err);});//main.sendMessage('error!!!!!!!');
}
function fillFolderWithDefaultLibrary(path:string, cb:{(): void}){
    const existPath = fse.existsSync(libPath);
    // main.sendMessage(process.resourcesPath);
    // main.sendMessage(existPath?'true':'false');
    if(!existPath){
        console.warn('Library default path not found!');
        return;
    }
    // console.log(existPath);
    // main.sendMessage(existPath?'true':'false');
        // main.sendMessage('flag');
    fse.copy(libPath, path).then(()=>{
        // main.sendMessage('success!!!!!!!');
        cb();
    }).catch(err => {console.error(err);});//main.sendMessage('error!!!!!!!');
}



/*
export function testFunction(){
    // const path = './extraResources';
    const existPath = fs.existsSync(path);
    // fs.readFileSync
    // console.log(existPath);
    let stringFile = '';
    const stringFileAr = [];
    fs.readdir(path, (err, files) => {
        // const data: { id: string; data: string; }[] = [];
        if (err == null){
            files.forEach(fileName => {
                stringFile += fileName + ' ';
                stringFileAr.push(fileName);
            // if(path.extname(fileName)=='.plum'){// || path.extname(fileName)=='.plm'
            //     const content = fs.readFileSync(selectedPath+'/'+fileName, 'utf-8');
            //     data.push({id:path.parse(fileName).name, data:content});
            // }
            })
        }
        // main.sendMessage(process.resourcesPath);
        main.sendMessage(stringFile);
        // main.sendMessage(stringFileAr.length.toString());
        // main.sendMessage(existPath?'true':'false');
    })
    
    // main.sendMessage(process.resourcesPath);
    // main.sendMessage(stringFileAr.length.toString());
    // main.sendMessage(existPath?'true':'false');
}*/