import { Container, ContainerRoles } from "./parsicon";
import * as store from '../misc/storageManager'
import { Utils } from "../misc/utils";
import { BubbleList } from "./traverser";

type ObjectNode      = {[name:string]:ObjectNode|AttMethod|AttBMethod }|AttMethod|AttBMethod;
const attributes:ObjectNode = {};
const attributesBubbling:ObjectNode = {};

//TODO: There must be a better way
let saveDataToClean:Array<string> = [];
export function cleanData(){
    for (const data of saveDataToClean) {
        store.setUserVar(data, null);
    }
    saveDataToClean = [];
}

const dataAttributeRequirements:Map<AttMethod|AttBMethod, RequirementData[]> = new Map();

export type AttMethodArgs   = {originalContent?:string, 
                               attSettings?:RequirementData[], 
                               sourceId?:string,
                               sourceRole?:ContainerRoles,
                            //    nonRefSrcContainer?:Container|null,
                            };
export type AttBMethodArgs  = {
                               container?:Container|null,
                               bubbleList?:BubbleList,
                               attSettings?:RequirementData[], 
                            };
export type AttMethod       = (data:AttMethodArgs)=>unknown;
export type AttBMethod      = (data:AttBMethodArgs)=>unknown;
export type RequirementData = {help:string,default:unknown,path:Array<string>,id:string};

////////////////////////////
////////////////////////////
// System //
////////////////////////////
////////////////////////////

const atts_system:{[name:string]:AttMethod} = {};
attributes.sys = attributes.system = atts_system;

const atts_b_system:{[name:string]:AttBMethod} = {};
attributesBubbling.sys = attributesBubbling.system = atts_b_system;


atts_system.horizontalLine = 
atts_system.hr = 
atts_system.hl = ({originalContent}:AttMethodArgs) => {
    return '<hr>'+originalContent;
}
atts_system.image =
atts_system.img =
atts_system.im = ({originalContent, attSettings}:AttMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    const source = requirements.sourceImage;
    return '<img src='+source+'>'+originalContent;
}
dataAttributeRequirements.set(atts_system.img,[
    {id:'sourceImage', path:['source'], default:'', help:'TODO...'}
]);
atts_system.button =
atts_system.btn = ({originalContent,sourceId}:AttMethodArgs) => {
    saveDataToClean.push(sourceId as string);
    return '<button type="button" class="user-button" data-user-id="'+(sourceId as string)+'">'+originalContent+'</button>';
}
atts_system.checkbox =
atts_system.cb = ({originalContent,sourceId}:AttMethodArgs) => {
    // const savedData = store.getUserAuto_OLD(store.AutoCategories_OLD.Checkbox,sourceId as string)==true;
    const savedData = store.getUserVar(sourceId as string)===true;
    return '<input type="checkbox" class="user-checkbox" '+(savedData?'checked':'')+' data-user-id="'+(sourceId as string)+'">'+originalContent+'</input>';
}
atts_system.mem = 
atts_system.memory = ({originalContent,sourceId,sourceRole}:AttMethodArgs) => {
    if(!Utils.isString(sourceId))
        return originalContent;
    const id:string = sourceId as string;
    if(sourceRole==ContainerRoles.Reference)
        return store.getUserVar(id);
    store.setUserVar(id, originalContent)
    return originalContent;
}
atts_system.rnd =
atts_system.random = ({originalContent/*,sourceId,sourceRole*/}:AttMethodArgs) => {
    const floatContent = Utils.toFloat(originalContent)
    return (Math.ceil(Math.random()*floatContent));
}
atts_b_system.length = ({container,bubbleList}:AttBMethodArgs) => {
    return Utils.setInBubbleList(bubbleList as BubbleList,'content', Utils.getContainerLength(container as Container));
}
atts_b_system.filter = ({container,bubbleList,attSettings}:AttBMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    const id = requirements.id as string;
    const overwrite = requirements.overwrite as boolean;
    const goInside = requirements.goInside as boolean;
    const containers = Utils.searchContainersById(container as Container,id,Utils.toBool(goInside));
    Utils.setInBubbleList(bubbleList as BubbleList,'content', containers);
    if(overwrite){
        (container as Container).content = containers;
        (container as Container).lastSavedValue = null;
    }
    return bubbleList;
}
dataAttributeRequirements.set(atts_b_system.filter,[
    {id:'id', path:['id'], default:'', help:'TODO...'},
    {id:'overwrite', path:['overwrite'], default:false, help:'TODO...'},
    {id:'goInside', path:['goInside'], default:false, help:'TODO...'},
]);

////////////////////////////
////////////////////////////
// Tables //
////////////////////////////
////////////////////////////

const atts_tables:{[name:string]:AttMethod} = {};
attributes.tb = attributes.table = attributes.tables = atts_tables;

const atts_b_tables:{[name:string]:AttBMethod} = {};
attributesBubbling.tb = attributesBubbling.table = attributesBubbling.tables = atts_b_tables;

atts_b_tables.t =
atts_b_tables.table = ({bubbleList,attSettings}:AttBMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    const border = requirements.borderWidth;
    const header = requirements.headerType;
    let cellTag = 'tc';
    const rows = Utils.toFloat(requirements.rowsAmount);
    let contCount = 0;
    const newBubbleList:Array<string|Container> = [];
    newBubbleList.push('<table border="'+border+'"><tr>');
    Utils.goThroughBubbleListItems(bubbleList as BubbleList, (contentItem: unknown/*, content: unknown[], key: number*/)=>{
        const isContainer = Utils.isContainer(contentItem);
        if(isContainer){
            contCount++;
            cellTag='td';
            if((header=='top'&&contCount<=rows)||
                (header=='left'&&(contCount)%rows==1))
                cellTag='th';
            newBubbleList.push('<'+cellTag+'>');
            newBubbleList.push(contentItem as Container);
            newBubbleList.push('</'+cellTag+'>');
            if(contCount%rows==0)
                newBubbleList.push('<tr></tr>');
        }
        return false;
    });
    newBubbleList.push('</tr></table>');
    Utils.setInBubbleList(bubbleList as BubbleList,'content',newBubbleList)
    return bubbleList;
}
dataAttributeRequirements.set(atts_b_tables.t,[
    {id:'borderWidth', path:['border'], default:1,     help:'TODO...'},
    {id:'headerType',  path:['header'], default:'top', help:'TODO...'},
    {id:'rowsAmount',  path:['rows'],   default:3,     help:'TODO...'},
]);
atts_tables.mt =
atts_tables.manualTable = ({originalContent, attSettings}:AttMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    const border = requirements.borderWidth;
    return '<table border="'+border+'">'+originalContent+'</table>';
}
atts_b_tables.manualTable = ({bubbleList}:AttBMethodArgs) => {
    return atts_b_textFormat.noNL({bubbleList:bubbleList});
}

dataAttributeRequirements.set(atts_tables.manualTable,[
    {id:'borderWidth', path:['border'], default:'0', help:'TODO...'}
]);
atts_tables.h =
atts_tables.th =
atts_tables.header = ({originalContent}:AttMethodArgs) => {
    return '<th>'+originalContent+'</th>';
}
atts_b_tables.h =
atts_b_tables.th =
atts_b_tables.header = ({bubbleList}:AttBMethodArgs) => {
    return atts_b_textFormat.noNL({bubbleList:bubbleList});
}
atts_tables.r =
atts_tables.tr =
atts_tables.row = ({originalContent}:AttMethodArgs) => {
    return '<tr>'+originalContent+'</tr>';
}
atts_b_tables.r =
atts_b_tables.tr =
atts_b_tables.row = ({bubbleList}:AttBMethodArgs) => {
    return atts_b_textFormat.noNL({bubbleList:bubbleList});
}
atts_tables.c =
atts_tables.td =
atts_tables.cell = ({originalContent}:AttMethodArgs) => {
    return '<td>'+originalContent+'</td>';
}
atts_b_tables.c =
atts_b_tables.td =
atts_b_tables.row = ({bubbleList}:AttBMethodArgs) => {
    return atts_b_textFormat.noNL({bubbleList:bubbleList});
}


////////////////////////////
////////////////////////////
// Boxes //
////////////////////////////
////////////////////////////


const atts_boxes:{[name:string]:AttMethod} = {};
attributes.box = attributes.bx = atts_boxes;

const atts_b_boxes:{[name:string]:AttBMethod} = {};
attributesBubbling.boxes = attributesBubbling.bx = atts_b_boxes;

atts_boxes.box =
atts_boxes.bx =
atts_boxes.b = ({originalContent}:AttMethodArgs) => {
    return '<div class="box" style="max-height:400px">'+originalContent+'</div>';
}
atts_boxes.code = ({originalContent}:AttMethodArgs) => {
    return '<p class="codebox"><code>'+originalContent+'</code></p>';
}
atts_boxes.warn = ({originalContent}:AttMethodArgs) => {
    return '<p class="warn box">'+originalContent+'</p>';
}
atts_boxes.quote = ({originalContent}:AttMethodArgs) => {
    return '<blockquote  cite="">'+originalContent+'</blockquote>';
}

////////////////////////////
////////////////////////////
// Text Format //
////////////////////////////
////////////////////////////

const atts_textFormat:{[name:string]:AttMethod} = {};
attributes.tf = attributes.textFormat = atts_textFormat;

const atts_b_textFormat:{[name:string]:AttBMethod} = {};
attributesBubbling.textFormat = attributesBubbling.tf = atts_b_textFormat;

atts_textFormat.monospace =
atts_textFormat.ms =
atts_textFormat.code = ({originalContent}:AttMethodArgs) => {
    return '<code>'+originalContent+'</code>';
}
atts_textFormat.sm =
atts_textFormat.small = ({originalContent}:AttMethodArgs) => {
    return '<small>'+originalContent+'</small>';
}
atts_textFormat.underline =
atts_textFormat.u = ({originalContent}:AttMethodArgs) => {
    return '<u>'+originalContent+'</u>';
}
atts_textFormat.collapse =
atts_textFormat.clp = 
atts_textFormat.cl = ({originalContent}:AttMethodArgs) => {
    return '<div class="toggler"><span class="toggler-content">'+originalContent+"</span></div>";
}
atts_textFormat.bold =
atts_textFormat.b = ({originalContent}:AttMethodArgs) => {
    return '<b>'+originalContent+'</b>';
}
atts_textFormat.italic =
atts_textFormat.i = ({originalContent}:AttMethodArgs) => {
    return '<i>'+originalContent+'</i>';
}
atts_textFormat.strike =
atts_textFormat.s = ({originalContent}:AttMethodArgs) => {
    return '<s>'+originalContent+'</s>';
}
atts_textFormat.header =
atts_textFormat.h = ({originalContent, attSettings}:AttMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    let size = requirements.level;
    size = (size=="2"||size=="3"||size=="4"||size=="5"||size=="6")?size:"1";
    return '<h'+size+'>'+originalContent+'</h'+size+'>';
}
dataAttributeRequirements.set(atts_textFormat.h,[
    {id:'level', path:['level'], default:'1', help:'TODO...'}
]);
atts_textFormat.out = ({originalContent, attSettings}:AttMethodArgs) => {
    const requirements = condenseRequirements(attSettings)
    const source = requirements.source==''?originalContent:requirements.source;
    return '<span class="hyperlink" data-hyperlink-source='+source+'>'+originalContent+'</span>';
}
dataAttributeRequirements.set(atts_textFormat.out,[
    {id:'source', path:['source'], default:'', help:'TODO...'}
]);

atts_b_textFormat.ignoreNewLines =
atts_b_textFormat.noNL = ({bubbleList}:AttBMethodArgs) => {
    Utils.goThroughBubbleListItems(bubbleList as BubbleList, (contentItem: unknown, content: unknown[], key: number)=>{
        const isNL = Utils.isANewLineObject(contentItem);
        if (isNL) {
            content[key] = '';
        }
        return false;
    });
    return bubbleList;
}

atts_b_textFormat.list = ({bubbleList, attSettings}:AttBMethodArgs) => {  
    const requirements = condenseRequirements(attSettings)
    const listTag = Utils.toBool(requirements.ordered)?'ol':'ul';
    const newBubbleList:Array<string|Container> = [];
    newBubbleList.push('<'+listTag+'>');
    Utils.goThroughBubbleListItems(bubbleList as BubbleList, (contentItem: unknown/*, content: unknown[], key: number*/)=>{
        const isContainer = Utils.isContainer(contentItem);
        if(isContainer){
            newBubbleList.push('<li>');
            newBubbleList.push(contentItem as Container);
            newBubbleList.push('</li>');
        }
        return false;
    });
    newBubbleList.push('</'+listTag+'>');
    Utils.setInBubbleList(bubbleList as BubbleList,'content',newBubbleList)
    return atts_b_textFormat.noNL({bubbleList:bubbleList});
}
dataAttributeRequirements.set(atts_b_textFormat.list,[
    {id:'ordered', path:['ordered'], default:false, help:'TODO...'}
]);


///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////





export function getAttributeRequirements(att:Array<string>|AttMethod|AttBMethod|null):Array<RequirementData>{
    if(Array.isArray(att))
        att = getAttribute(att);
    if(att === null)
        return [];
    return dataAttributeRequirements.get(att) as Array<RequirementData>;
}

export function getAttribute(path:Array<string>, inBublingPhase = false){
    let rootObject:ObjectNode = inBublingPhase?attributesBubbling:attributes;
    for (const iterator of path) {
        rootObject = (rootObject as {[name:string]:ObjectNode})[iterator];
        if(rootObject == null)
            return null;
    }
    return rootObject as AttMethod|AttBMethod;
}

export function getAttributeAndExecute(path:Array<string>, dataContent:string, attSettings?:Container){
    const att = getAttribute(path) as unknown as (dataContent:string, attSettings?:unknown) => unknown;
    if(att==null)
        return '-Invalid Attribute('+dataContent+')-';
    return att(dataContent, attSettings);
}


function condenseRequirements(reqs:RequirementData[]|undefined){
    const condensedRequirements:{[name:string]:unknown} = {}
    if(reqs!==undefined){
        for (const requirementSettings of reqs) {
            condensedRequirements[requirementSettings.id] = requirementSettings.default;
        }
    }
    return condensedRequirements;
}