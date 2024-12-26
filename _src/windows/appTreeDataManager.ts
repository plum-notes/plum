import { TreeNode, TreeNodePanel } from "./app";
import { getFilesData } from "./fileManager";
import * as store from '../misc/storageManager'
import { Utils } from "../misc/utils";

const PROJECT_PATH = 'projectPath';
const LIBRARY_PATH = 'libraryPath';

export class AppTreeDataMng{
    fileTreeRaw    :Array<TreeNode>      = [];
    fileTree       :Array<TreeNodePanel> = [];
    fileTreeLibRaw :Array<TreeNode>      = [];
    fileTreeLib    :Array<TreeNodePanel> = [];
    currentNode    :TreeNodePanel|null   = null;
    projectPath    = '';
    libraryPath    = '';

    constructor() {
        this.setProjectPath(store.getAppVar(PROJECT_PATH) as string);
        this.setProjectPath(store.getAppVar(LIBRARY_PATH) as string, true);
    }

    purgeLibrary(){
        this.libraryPath='';
    }

    purgeProject(){
        this.projectPath='';
    }

    isLibrarySet() {
        return this.libraryPath!='' && this.libraryPath!=null;
    }

    isProjectSet() {
        return this.projectPath!='' && this.projectPath!=null;
    }

    areAllFilesSaved(){
        for (const node of this.fileTree) {
            if(node.saved==false)
                return false;
        }
        return true;
    }

    setProjectPath(replacePath:string|null='',isLibrary=false){
        if(replacePath==null)
            replacePath='';
        if(isLibrary)
            this.libraryPath=replacePath;
        else
            this.projectPath=replacePath;
        store.initData(this.projectPath);
        store.setAppVar(isLibrary?LIBRARY_PATH:PROJECT_PATH,replacePath);
    }

    /**
    * Load files from disk based on the saved project path.
    */
    loadFilesFromMem(replacePath:string|null=null){
        if(replacePath!=null)
            this.setProjectPath(replacePath);
        this.fileTree = []; //{data:'',id:'node1'},{data:'',id:'node2'}
        this.fileTreeRaw = [];
        if(this.projectPath != ''){
            const data = getFilesData(this.projectPath);
            this.buildTree(data);
        }
        // appUI.populateSidePanelWithTreeData(this.fileTree);
        // if(fileTree.length > 0)
        //     loadFileFromTree(fileTree[0]);
    }
    loadLibraryFromMem(replacePath:string|null=null){
        if(replacePath!=null)
            this.setProjectPath(replacePath,true);
        if(this.libraryPath == '')
            return;
        const tree = getFilesData(this.libraryPath);
        this.fileTreeLibRaw = tree;
        this.fileTreeLib = this.getAllFlattenBranches(this.fileTreeLibRaw);
    }

    /**
     * Modifies the tree data into more a more usable structure(flatten)
     * @param tree 
     * @returns 
     */
    buildTree(tree: TreeNode[] | null) {
        if(tree == null)
            return;
        this.fileTreeRaw = tree;
        this.fileTree = this.getAllFlattenBranches(tree);
        // populateSidePanelWithTreeData();
    }
    getNestedTree(parents: string[]){
        let currentTree = this.fileTreeRaw;
        let currentPath = this.projectPath;
        for (const i in parents) {
            const parent = parents[i];
            for (let ii = 0; ii < currentTree.length; ii++) {
                const checkBranch = currentTree[ii];
                if(checkBranch.id==parent){
                    currentTree=checkBranch.children;
                    currentPath=checkBranch.path+'/'+checkBranch.id;
                    continue;
                }
            }
            if(currentTree == this.fileTreeRaw)
                return {tree:[], path:'', success:false};
        }
        return {tree:currentTree, path:currentPath, success:true};
    }
    addTreeBranch(newName:string, targetNode:TreeNodePanel|null, asChild=false){
        // if(targetNode==null)
        //     targetNode = this.fileTree;
        const parents:string[]= targetNode==null?[]:[...targetNode.parents as string[]];
        if(asChild&&targetNode!=null)
            parents.push(targetNode.id);
        const {tree,path,success} = this.getNestedTree(parents);
        if(!success)
            return;
        const newNode:TreeNode = {data:'',id:newName,path:path,children:[]};
        tree.push(newNode)
        this.buildTree(this.fileTreeRaw);
    }
    
    getAllFlattenBranches(tree: TreeNode[], parentIndexes:string[]=[]){
        const allBranches:TreeNodePanel[] = [];
        for (const i in tree) {
            const branch:TreeNode = tree[i];
            const clonedBranch = branch as TreeNodePanel;// Utils.shallowCloneObject(branch) as TreeNodeFlat;
            // clonedBranch.data = branch.data;
            clonedBranch.parents = parentIndexes;
            clonedBranch.index = i as unknown as number;
            allBranches.push(clonedBranch);
            const childrenBranches = this.getAllFlattenBranches(branch.children, [...parentIndexes, branch.id]);
            allBranches.push(...childrenBranches);
        }
        return allBranches;
    }

    searchIdInTreePanels(sourceId:string|string[]|null|undefined){
        return this.searchIDInTree(sourceId, this.fileTreeRaw) as TreeNodePanel|null;
    }

    searchIDInLibTree(sourceId:string|string[]|null|undefined){
        return this.searchIDInTree(sourceId, this.fileTreeLibRaw);
    }
    searchIDInTree(sourceId:string|string[]|null|undefined, tree:TreeNode[]|null = null):TreeNode|null{
        if(sourceId==null||sourceId==undefined)
            return null;
        if(tree == null)
            tree = this.fileTreeRaw;
        if(Utils.isString(sourceId)){
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i];
                if(node.id == sourceId)
                    return node;
            }
        }
        else{
            let parentNode:TreeNode | null=null;
            for (const id of sourceId) {
                parentNode = this.searchIDInTree(id,tree);
                if(parentNode==null)
                    return null;
                tree=parentNode.children;
            }
            return parentNode;
        }
        return null;
    }
}