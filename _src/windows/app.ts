import * as uIToParser from "../parsing/parserApi";
import * as store from '../misc/storageManager'
import * as electron from 'electron';
// import { getFilesData } from "./fileManager";
import { Registry } from "../parsing/registry";
import { AppUI } from "./appUI";
import { AppTreeDataMng } from "./appTreeDataManager";
import { Utils } from "../misc/utils";
const ipcRenderer = electron.ipcRenderer;


let currentNode:TreeNodePanel|null;
let parserAPI:uIToParser.ToParser;
let catchErrors = true;
const appUI:AppUI = new AppUI();
const appData:AppTreeDataMng=new AppTreeDataMng();


export type TreeNode = { 
    id          :     string;
    data        :     string;
    path        :     string;
    children    : TreeNode[];
};
export interface TreeNodePanel extends TreeNode {
    buttonTree  : HTMLElement | null;
    parents     :   string[];
    index       :     number;
    saved       : boolean;
}

export function init(){
    createInputEvents();
    createClickEvents();
    createRendererEvents();
    loadFromMemAndDisplayFiles();
    // if(projectPath == '')
    //     ipcRenderer.send('openProjectScreenWindow');  

}

function loadFromMemAndDisplayFiles(replacePath: string | null=null){
    let errorMsg = ''
    try {
        appData.loadLibraryFromMem();
    } catch (error) {
        appData.purgeLibrary;
        console.warn(error);
        errorMsg = 'Error Loading Library.';
    }
    try {
        appData.loadFilesFromMem(replacePath);
    } catch (error) {
        appData.purgeProject;
        console.warn(error);
        errorMsg = 'Error Loading Project.';
    }    
    refreshProject();
    if(errorMsg!=''){
        ipcRenderer.send('error', errorMsg)
    }
    checkIfDisplayWelcome();
}

function checkIfDisplayWelcome(){
    if(!appData.isProjectSet()){
        ipcRenderer.send('openWelcomeScreen', false, appData.isLibrarySet());
    }
}
function displayWelcome(){
    ipcRenderer.send('openWelcomeScreen', appData.isProjectSet(), appData.isLibrarySet());
}

function refreshProject(){
    currentNode = null;
    appUI.populateSidePanelWithTreeData(appData.fileTree);
    if(appData.fileTree.length > 0){
        loadFileFromTree(appData.fileTree[0]);
    }else{
        appUI.clearPanels();
        changePageTitle();
    }
}

/**
 * Sets and loads the current node file for the user to edit.
 * @param node 
 */
function loadFileFromTree(node:TreeNodePanel|number){ 
    if((node as TreeNodePanel).id == null)
        node = appData.fileTree[node as number];
    (currentNode?.buttonTree as HTMLElement)?.classList.remove('tree-node-selected');
    currentNode = node as TreeNodePanel;
    (currentNode?.buttonTree as HTMLElement)?.classList.add('tree-node-selected');
    // window.localStorage.txt = 
    appUI.sourceText.value = currentNode.data;
    
    if(currentNode.data != null)
        generateCompilation();
    changePageTitle();
}

function changePageTitle(){
    if(currentNode == null){
        document.title = 'Plum';
        return;
    }
    const newPageTitle = ((currentNode.saved===true||currentNode.saved==null)?'':'*')+'Plum - '+ currentNode.id;
    document.title = newPageTitle;
}

function createNodeCall(){
    ipcRenderer.send('newNode');
}
function removeCurrentNode_FIX(){
    if(currentNode?.id == null)
        return;
    console.warn('Remove node functionality currently not working!')
    // fileTree.forEach((node, i)=> {
    //     if(node.id == currentNode?.id)
    //         fileTree.splice(i, 1);
    // });
    // appUI.populateSidePanelWithTreeData(fileTree);
}

function saveCurrentNode(){
    if(currentNode?.id == null)
        return;
    currentNode.saved = true;
    changePageTitle();
    ipcRenderer.send('saveNode', {data:currentNode.data,id:currentNode.id,path:currentNode.path});
    //appUI.populateSidePanelWithTreeData(appData.fileTree);
}

/**
 * Returns the data of a specific node.
 * @param source 
 * @param fromLibrary 
 * @returns 
 */
export function getNodeData(source:string|string[], fromLibrary=false, rootFolder=false):Registry|null{ 
    let nodeData:string|null|undefined;
    const parents:string[]=(currentNode?.parents==null||rootFolder||fromLibrary)?
                           []:
                           currentNode?.parents as string[];
    if(Utils.isString(source))
        source=[...parents,source as string];
    else
        source=[...parents,...source];
    // if(source == '')
    //     nodeData = getCurrentNodeData();
    // else{
    if(fromLibrary)
        nodeData = appData.searchIDInTree(source, appData.fileTreeLibRaw)?.data;
    else
        nodeData = appData.searchIDInTree(source)?.data;
    // }
    if(nodeData == null)
        return null;
    const toParser = new uIToParser.ToParser(nodeData);
    const succeded = toParser.generateASTAndRegistry();
    return succeded?toParser.reg:null;
}

function setCurrentNodeData(){
    return (currentNode?.data == null)?
            '':
            currentNode.data = String(appUI.sourceText?.value);//window.localStorage.txt = 
}

export function getCurrentNodeParents(){
    return (currentNode?.parents == null)?
            []:
            currentNode.parents;
}

function generateCompilation(){
    if(currentNode?.data == null)
        return;
    const txt:string = setCurrentNodeData();
    parserAPI = new uIToParser.ToParser(txt);
    const succeded = parserAPI.compile(catchErrors);
    if(succeded){
        appUI.parsedText.innerHTML = parserAPI.run==null?'':(parserAPI.run).result;
        appUI.parsedText.classList.remove("panel-error");
    }else{    
        // appUI.parsedText.innerHTML = '&#x1F635';//Show dead face emoji as output for errors.
        appUI.parsedText.classList.add("panel-error");
    }
}

/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/

function createInputEvents(){
    appUI.addInputListener(()=>{
        onFileChange();
    })
}

function onFileChange(){
    if(currentNode == null)
        return;
    currentNode.saved = false;
    changePageTitle();
    generateCompilation();
}

export function existNode(nodePath:string[]|null|undefined, inLibrary=false){
    return (inLibrary)?appData.searchIDInLibTree(nodePath):appData.searchIdInTreePanels(nodePath);
}

function createClickEvents() {
    //TOGGLERS
    appUI.addClickListener("toggler",null,(clickedObject:HTMLElement)=>{
        // const togglerContents = (clickedObject as HTMLElement).children[0];
        const togglerContents = Utils.findFirstInHTMLElement(clickedObject,'toggler-content')
        if(togglerContents==null)
            return;
        if(clickedObject.classList.contains("collapsed")){
            clickedObject.classList.remove("collapsed");
            togglerContents.removeAttribute("hidden");
        }else{
            clickedObject.classList.add("collapsed");
            togglerContents.setAttribute("hidden", "");
        }
    })
    // USER CHECKBOXES
    appUI.addClickListener("user-checkbox",null,(clickedObject:HTMLElement)=>{
        // store.setUserAuto_OLD(store.AutoCategories_OLD.Checkbox, clickedObject.getAttribute('data-user-id') as string, (clickedObject as HTMLInputElement).checked);
        store.setUserVar(clickedObject.getAttribute('data-user-id') as string, (clickedObject as HTMLInputElement).checked);
        generateCompilation();
    })
    // USER BUTTONS
    appUI.addClickListener("user-button",null,(clickedObject:HTMLElement)=>{
        store.setUserVar(clickedObject.getAttribute('data-user-id') as string, true);
        console.log(clickedObject.getAttribute('data-user-id') as string);
        generateCompilation();
    })
    // TREE NODES
    appUI.addClickListener("tree-node",null,(clickedObject:HTMLElement)=>{
        loadFileFromTree(parseInt(clickedObject.getAttribute('data-tree-index') as string));
    })
    // ADD NODE
    appUI.addClickListener("add-node",null,(/*clickedObject:HTMLElement*/)=>{
        createNodeCall();
    })
    // RMV NODE
    appUI.addClickListener("rmv-node",null,(/*clickedObject:HTMLElement*/)=>{
        removeCurrentNode_FIX();
    })
    // RFS NODE
    appUI.addClickListener("rfs-node",null,(/*clickedObject:HTMLElement*/)=>{
        refreshProject();
    })
    // SAVE NODE
    appUI.addClickListener("sav-node",null,(/*clickedObject:HTMLElement*/)=>{
        saveCurrentNode();
    })
    // LINK
    appUI.addClickListener("link-to",null,(clickedObject:HTMLElement)=>{
        const globalTarget = clickedObject.getAttribute('data-link-target-global')==null?'':
                             clickedObject.getAttribute('data-link-target-global');
        const targetNode = appData.searchIdInTreePanels(globalTarget?.split(".") as string[]|null);
        if(targetNode != null){        
            loadFileFromTree(targetNode as TreeNodePanel)
        }
    })
    // HYPERLINK
    appUI.addClickListener("hyperlink",null,(clickedObject:HTMLElement)=>{
        const globalTarget = clickedObject.getAttribute('data-hyperlink-source');
        if(globalTarget != null)
            ipcRenderer.send('openLink', globalTarget);
    })
}

function createRendererEvents(){
    if(ipcRenderer == null){
        return;
    }
    ipcRenderer.on('nodeCreated', (ev, newName = 'New node', asChild:boolean) => {
        if(newName == null)
            return;
        appData.addTreeBranch(newName, currentNode as TreeNodePanel, asChild);
        refreshProject();
    })
    ipcRenderer.on('loadTreeLibrary', (ev, path:string|null = null) => {
        console.log("lib");
        
        if(path!=null)
            appData.loadLibraryFromMem(path);
    })
    ipcRenderer.on('loadTree', (ev, path:string|null = null) => {
        console.log("tree");
        if(path!=null)
            loadFromMemAndDisplayFiles(path);
    })
    ipcRenderer.on('logAst', () => {
        console.log(parserAPI.ast);
    })
    ipcRenderer.on('switchCatchErrors', (e:unknown, setTo:boolean) => {
        catchErrors = setTo;
    })
    ipcRenderer.on('switchView', () => {
        appUI.changeLayout();
    })
    
    ipcRenderer.on('requestSave', () => {
        saveCurrentNode();
    })
    ipcRenderer.on('closeRequest', () => {
        ipcRenderer.send('quit', appData.areAllFilesSaved());
    })
    ipcRenderer.on('refresh', () => {
        refreshProject();
    })
    ipcRenderer.on('requestWelcomeScreen', () => {
        displayWelcome();
    })
    ipcRenderer.on('requestOpenProjectFolder', () => {
        if(appData.projectPath != null && appData.projectPath != ''){
            // TODO: This way of loading the path can be problematic on the future...:
            ipcRenderer.send('openFolder', appData.projectPath+'/'+appData.fileTreeRaw[0].id);
        }else{
            ipcRenderer.send('msg', 'No project is loaded!');
        }
    })
}


