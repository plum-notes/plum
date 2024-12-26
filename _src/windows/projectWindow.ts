import * as electron from 'electron';

const ipcRenderer = electron.ipcRenderer;
const lastBtn = document.querySelector(".open-last-button") as HTMLButtonElement;
const openPrjBtn = document.querySelector(".open-project-button") as HTMLButtonElement;
// const openLibBtn = document.querySelector(".open-library-button") as HTMLButtonElement;
const helpBtn = document.querySelector(".open-help-button") as HTMLButtonElement;
const cancelBtn = document.querySelector(".cancel-button") as HTMLButtonElement;

let librarySet = true;

lastBtn.addEventListener("click", openLastProj)
function openLastProj(){
    ipcRenderer.send('refresh');
    ipcRenderer.send('closeMiscWindows');
}

///////////////////

openPrjBtn.addEventListener("click", () => {
    ipcRenderer.send('getFolder', 'receiveProjectPath');
});
ipcRenderer.on('receiveProjectPath', (ev, dirPath)=>{
    //FIX:
    ipcRenderer.send('loadTree', dirPath);
    ipcRenderer.send('closeMiscWindows');
})

///////////////////

helpBtn.addEventListener("click", () => {
    // ipcRenderer.send('closeMiscWindows');
    ipcRenderer.send('generateHelpProject', librarySet);
    // if(!librarySet){
    //     ipcRenderer.send('generateDefaultLibrary', );
    // }
});

///////////////////

cancelBtn.addEventListener("click", () => {
    ipcRenderer.send('closeMiscWindows');
});

///////////////////

// openLibBtn.addEventListener("click", () => {
//     openLibraryTree();
// });
// function openLibraryTree(){
//     ipcRenderer.send('getFolder', 'receiveLibraryPath');
// }
// ipcRenderer.on('receiveLibraryPath', (ev, dirPath)=>{
//     ipcRenderer.send('loadTreeLibrary', dirPath);
//     ipcRenderer.send('closeMiscWindows');
// })

///////////////////

ipcRenderer.on('appStoredData', (ev, projSet:boolean, libSet:boolean)=>{
    // ipcRenderer.send('msg', projSet?'1':'0');
    librarySet = libSet;
    if(!projSet){
        lastBtn.removeEventListener("click", openLastProj);
        lastBtn.classList.add('btn-disabled');
    }
})