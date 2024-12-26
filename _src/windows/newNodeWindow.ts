import * as electron from 'electron';
const ipcRenderer = electron.ipcRenderer;

const btn = document.querySelector(".send-button") as HTMLButtonElement;
const closeBtn = document.querySelector(".cancel-button") as HTMLButtonElement;
const txt = document.querySelector("#name") as HTMLInputElement;
const isChildCB = document.querySelector(".is-child") as HTMLInputElement;

btn.addEventListener("click", () => {
    ipcRenderer.send('nodeCreated', txt.value, isChildCB.checked);
});
closeBtn.addEventListener("click", () => {
    ipcRenderer.send('closeMiscWindows');
});