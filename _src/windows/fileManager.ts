import path from 'path'
import fs from 'fs';
import { TreeNode } from './app';

const maxNestedFolders = 16;
const maxFilesProcessed = 1028;
let filesProcessed = 0;

/**
 * Load files from disk based on the saved project path.
 */
export function getFilesData(projectPath = ''){
    filesProcessed = 0;
    return getFilesTreeData(projectPath,0);
}

function getFilesTreeData(projectPath = '', nestedLevel:number ){
    const filenames = fs.readdirSync(projectPath, { withFileTypes: true });
    const data: TreeNode[] = [];
    const namesDictionary:{[name:string]:number} = {};
    for (const fileData of filenames) {
        getData(fileData, projectPath, namesDictionary, data, nestedLevel);
    }
    return data;
}

function getData(fileData: fs.Dirent, projectPath: string, namesDictionary: { [name: string]: number; }, data: TreeNode[], nestedLevel:number) {
    const fileName = fileData.name;
    const rawName = path.parse(fileName).name; // No extension.
    if (fileData.isDirectory()) {
        const nestedPath = projectPath + '/' + fileName;
        const children = nestedLevel>maxNestedFolders?[]:getFilesTreeData(nestedPath, nestedLevel+1);
        if (namesDictionary[rawName] == null) {
            addToData(data, '', rawName, children, projectPath, namesDictionary);
        }
        else
            data[namesDictionary[rawName]].children = children;
    } else if (path.extname(fileName) == '.plum') { // || path.extname(fileName)=='.plm'
        const content = fs.readFileSync(projectPath + '/' + fileName, 'utf-8');
        if (namesDictionary[rawName] == null) {
            addToData(data, content, rawName, [], projectPath, namesDictionary);
        }
        else {
            data[namesDictionary[rawName]].data = content;
        }
    }
}
function addToData(data: TreeNode[], nodeData = '', rawName: string, children: TreeNode[], projectPath: string, namesDictionary: { [name: string]: number; }) {
    data.push({ id: rawName, data: nodeData, children: children, path: projectPath });
    namesDictionary[rawName] = data.length - 1;
    filesProcessed++;
    if(filesProcessed>maxFilesProcessed){
        throw new Error("Max files loaded/processed.");
    }
}

