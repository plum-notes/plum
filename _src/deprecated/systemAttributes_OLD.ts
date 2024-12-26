//TODO: This whole file must be improved.

// import { Container, ReturnTypes, ContainerRoles, MathOperationContainer, BooleanOperations, RootContainer, RunContainer, ContainerWithContent, ContainerCondition, Classifications, ContainerWithId, ContainerHideable, ContainerClone, ContainerWrappable } from "./parsicon";
// import { RecursiveRunData } from "./compiler"
import * as store from '../misc/storageManager'
import { Utils } from "../misc/utils";
import { Classifications, Container, ContainerRoles, ContainerWithId, ContainerWithContent } from '../parsing/parsicon';
import { RecursiveRunData } from './compiler_OLD';

const sys:any = {};
export const allAtts: any={sys:sys};


export enum AttributeRoles{
    TextFormat = "textFormat",
    system = "system",
}

export const tf_collapse:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"collapse",
    process(originalResult:string|Array<any>, options:Container|null = null):Array<any>{
        return ['<div class="toggler"><span class="toggler-content">', ...originalResult, "</span></div>"];
    }
}

export const tf_bold:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"bold",
    process(originalResult:string|Array<any>, options:Container|null = null):Array<any>{
        
        return ['<b>', ...origResultAsArray(originalResult), "</b>"];
    }
}
export const tf_link:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"link",
    process(originalResult:string|Array<any>, options:Container|null = null, data: RecursiveRunData|null = null):Array<any>{
        //const container = data?.compiler.getContainerById(data.registryInstances, [options?options:"", "link"]);
        const resultedOption = getNestedOption(options, ['link'], data, '');
        const newResult = ['<a href="'+resultedOption+'">', ...origResultAsArray(originalResult) ,'</a>']
        return newResult;
    }
}

export const tf_Title:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"title",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
                
        const resultedOption = getNestedOption(options, ['level'], data, '1');
        return ['<h'+resultedOption+'>', ...origResultAsArray(originalResult) ,'</h'+resultedOption+'>'];
    }
}

export const tf_italics:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"italics",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        return ['<i>', ...origResultAsArray(originalResult) ,'</i>'];
    }
}

export const tf_image:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"image",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        const resultedOption = getNestedOption(options, ['source'], data, '');
        return ['<img src='+resultedOption+'>', ...origResultAsArray(originalResult)];
    }
}

export const tf_underline:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"underline",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        return ['<u>', ...origResultAsArray(originalResult) ,'</u>'];
    }
}

export const tf_quote:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"quote",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        return ['<blockquote>', ...origResultAsArray(originalResult) ,'</blockquote>'];
    }
}

export const tf_code:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"code",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
                
        return ['<pre><code>', ...origResultAsArray(originalResult) ,'</code></pre>'];
    }
}

export const tf_strike:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"strike",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        return ['<s>', ...origResultAsArray(originalResult) ,'</s>'];
    }
}

export const tf_line:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"line",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{                                
        return ['<hr>', ...origResultAsArray(originalResult)];
    }
}

function origResultAsArray(originalResult:string|Array<any>){
    const isArray = Array.isArray(originalResult);
    if(!isArray)
        return [originalResult];
    return originalResult;
}

export const tf_list:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.TextFormat,
    name:"underline",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{
        const isOriginalArray = Array.isArray(originalResult);
        if(!isOriginalArray)
            return ['<ul><li>',originalResult,'</li></ul>']; 
        const result =   ['<ul>'];
        (originalResult as Array<any>).forEach(function (element:any) {
            if(element!=''){ // && element!='<br>'
                result.push('<li>', element, '</li>');
            }
        });
        result.push('</ul>');
        return result;
    }
}

export const sys_date:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"date",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
        const d:Date = new Date();                              
        return [d.getDate()+'-'+d.getMonth()+'-'+d.getFullYear(), ...origResultAsArray(originalResult)];
    }
}

export const sys_memory:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"memory",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
        
        const id = data?.id;
        const isRef = data?.role == ContainerRoles.Reference;
        let rawId:any;
        const isIdArray = Array.isArray(id);
        const defaultIDValue = 'defaultVarValue';
        if(isIdArray && id != null){
            if(id.length>0)
                rawId=id[id.length-1];
            else
                rawId=defaultIDValue;
        }else
            rawId = id as string;

        if(isRef){
            const storedValue = store.getUserVar(rawId);
            return [storedValue==null?'':storedValue];
        }
        console.log(data?.role);
        
        store.setUserVar(rawId, originalResult[0]?.toString())
        return [...origResultAsArray(originalResult)];




        // TODO: at the moment only works with strings not compounded ids
        // if(Array.isArray(originalResult[0])){
        //     return [...origResultAsArray(originalResult)];
        // }
        // const id:string = 'userData_'+(data?.currentContainerToCheck as ContainerWithId).id;
        // const isRef = data?.currentContainerToCheck.role == ContainerRoles.Reference;
        // if(isRef)
        //     return window.localStorage[id]==null?'':window.localStorage[id];
        // window.localStorage[id] = originalResult[0].toString();
        // return [...origResultAsArray(originalResult)];
    }
}

export const sys_button:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"button",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
                return ['<button type="button" class="user-button">', ...origResultAsArray(originalResult) ,'</button>'];
    }
}

export const sys_length:SysAttGetMath = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"length",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{ 
                const isRef = data?.role == ContainerRoles.Reference; 
                const id = data?.id
                if(!isRef || (id == null || id == undefined))
                    return [...origResultAsArray(originalResult)];
                const targetCont = data?.compiler.getContainerById(data.registryInstances, id) as Container
                const l = data?.compiler.getContainerTrueLength(targetCont);
                return isRef?[l]:[...origResultAsArray(originalResult)];
    },
    processMath(originalResult:string|Array<any>,
        options:Container|null = null,
        data: RecursiveRunData|null = null):number{ 
            return parseFloat(this.process(originalResult, options, data).join(''));
        },
}

export const sys_checkbox:SysAttGetBool = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"checkbox",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{ 
        const id = data?.id;
        /*let rawId:string;
        const isIdArray = Array.isArray(id);
        const defaultIDValue = 'defaultCheckboxValue';
        if(isIdArray && id != null){
            if(id.length>0)
                rawId=id[id.length-1];
            else
                rawId=defaultIDValue;
        }else
            rawId = id as string;*/
        const rawId:string|number = getRawId(id, this.name);
        const savedData = this.processBool(originalResult,options,data);
        return ['<input type="checkbox" class="user-checkbox" '+((savedData==true)?'checked':'')+' data-user-id="'+rawId+'">', ...origResultAsArray(originalResult) ,'</input>'];
    },
    processBool(originalResult:string|Array<any>, 
            options:Container|null = null,
            data: RecursiveRunData|null = null):boolean{ 
        const id = data?.id;
        const rawId:string|number = getRawId(id, this.name)
        /*const isIdArray = Array.isArray(id);
        if(isIdArray && id != null){
            if(id.length>0)
                rawId=id[id.length-1];
            else
                rawId=defaultIDValue;
        }else
            rawId = id as string;*/
        let savedData = false//Boolean(store.getUserAuto_OLD(store.AutoCategories_OLD.Checkbox,rawId.toString()));
        //console.log(savedData);        
        savedData = ((savedData==null)?false:savedData);
        
        return savedData;
    },
}

export const math_random:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"random",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
                return [Math.random()];
    }
}

export const sys_getNodes:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"getNodes",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
                const isRef    = data?.role == ContainerRoles.Reference;
                const id       = getNestedOption(options, ['id'], data, '')[0];
                //const target   = getNestedOption(options, ['target'], data, null)[0] as Container|null;
                const target = data?.content as Array<any>;
                const goInside = getNestedOption(options, ['inside'], data, false)[0] as boolean;
                
                //TODO: getNestedOption shouldn't return an array.
                
                if(target==null || target.length == 0 || Utils.isString(target)){
                    return [];//...origResultAsArray(originalResult)
                }
                //const unfilteredConts = data?.compiler.getContainersFromArray(target, goInside);
                const unfilteredConts:Array<Container> = [];
                for (let i = 0; i < target.length; i++) {
                    let element = target[i];
                    if(Utils.isContainer(element)){
                        if((element as Container).role == ContainerRoles.Reference){
                            element = data?.compiler.getContainerById(data.registryInstances, (element as ContainerWithId).id as string)
                            unfilteredConts.push(...(data?.compiler.getSubcontainers(element, goInside) as Container[]));
                        }else{
                            unfilteredConts.push(...(data?.compiler.getSubcontainers(element, goInside) as Container[]));
                            if(goInside){
                                const subConts = data?.compiler.getSubcontainers(element, goInside);
                                if(subConts !== undefined)
                                    unfilteredConts.push(...(subConts as Container[]));
                            }
                        }
                    }
                }
                //console.log(unfilteredConts);
                

                // if(!Utils.isBasket(target))
                //     return [];
                // let unfilteredConts:Container[]|null|undefined;
                // const isTargetRef = target.role == ContainerRoles.Reference;
                // if(isTargetRef){                    
                //     const refTarget = data?.compiler.getContainerById(data.registryInstances, target?.id as string)
                //     unfilteredConts = data?.compiler.getSubcontainers(refTarget, goInside);
                // }else{
                //     unfilteredConts = data?.compiler.getSubcontainers(target, goInside);
                // }
                if(unfilteredConts==null || unfilteredConts.length == 0){
                    return [];//...origResultAsArray(originalResult)
                }
                const resultedConts:Container[] = [];
                unfilteredConts.forEach(cont => {
                    if((cont as ContainerWithId).id == id){
                        resultedConts.push(cont);
                    }
                });
                return [...resultedConts];
    }
}

export const sys_dummy:SysAtt = {
    classification:Classifications.Attribute,
    role:AttributeRoles.system,
    name:"dummy",
    process(originalResult:string|Array<any>,
            options:Container|null = null,
            data: RecursiveRunData|null = null):Array<any>{  
                const isRef = data?.role == ContainerRoles.Reference;
                return [...origResultAsArray(originalResult)];
    }
}

function getRawId(id: string | number | Container | Array<string|number|Container> | null | undefined, defaultValue:string){
    let rawId:string|Container|number;
    const isIdArray = Array.isArray(id);
    if(isIdArray && id != null){
        if(id.length>0)
            rawId=id[id.length-1];
        else
            rawId=defaultValue;
    }else
        rawId = id as string;
    if(Utils.isContainer(rawId)){
        throw new Error("Containers as ids not yet implemented in attributes");
    }
    return rawId as string|number;
}

function getNestedOption(options:Container|null, nestedOptions:string[], data: RecursiveRunData|null, defaultValue:any){
    if(options == null)
        return defaultValue;
    const id = (options as ContainerWithId)?.id;
    const result = (id==null)?
                   (data?.compiler.getNestedContainer(options, nestedOptions, data.registryInstances) as ContainerWithContent).content:
                   ((data?.compiler.getContainerById(data.registryInstances, [id as string , ...nestedOptions]) as ContainerWithContent)?.content);
        
    return result == null?defaultValue:result;
}

export interface SysAtt{
    classification:Classifications.Attribute,
    role:AttributeRoles,
    name:string,
    process:(originalResult:string|Array<any>, options:Container|null, data: RecursiveRunData|null)=> Array<any> 
}

export interface AttStorageData{
    classification:Classifications.AttributeStorage,
    att:SysAtt,
    sourceOptions:Container
}

export interface SysAttGetBool extends SysAtt{
    processBool:(originalResult:string|Array<any>, options:Container|null, data: RecursiveRunData|null)=>boolean,
}

export interface SysAttGetMath extends SysAtt{
    processMath:(originalResult:string|Array<any>, options:Container|null, data: RecursiveRunData|null)=>number,
}

export function getSpecificAttribute(location:Array<string>,
                                     attributeObject:any = null
                                    ):SysAtt|null{
    if(attributeObject == null)
        attributeObject = allAtts.sys;
    const possibleAttribute = attributeObject[location[0]];
    if(possibleAttribute==null)
        return null;        
    
    if(location.length == 1){
        return (possibleAttribute as SysAtt).classification == Classifications.Attribute?
            possibleAttribute:null;
    }
    const locationCopy:Array<string> = [...location]
    locationCopy.shift();
    return getSpecificAttribute(locationCopy, possibleAttribute)
}

sys.math = sys.m = {
    random      : math_random,
    rnd         : math_random,
}
sys.sys = sys.system = {
    date        : sys_date,
    memory      : sys_memory,
    mem         : sys_memory,
    button      : sys_button,
    btn         : sys_button,
    checkbox    : sys_checkbox,
    cb          : sys_checkbox,
    length      : sys_length,
    nodes       : sys_getNodes
}
sys.text_format = sys.tf = {
    b                : tf_bold,
    collp            : tf_collapse,
    link             : tf_link,
    h                : tf_Title,
    i                : tf_italics,
    u                : tf_underline,
    img              : tf_image,
    list             : tf_list,
    code             : tf_code,
    quote            : tf_quote,
    s                : tf_strike,
    hl               : tf_line,
    horizontalLine   : tf_line,
};
sys.b           = tf_bold;
sys.collp       = tf_collapse;
sys.link        = tf_link;
sys.h           = tf_Title;
sys.i           = tf_italics;
sys.u           = tf_underline;
sys.img         = tf_image;
sys.list        = tf_list;
sys.code        = tf_code;
sys.quote       = tf_quote;
sys.s           = tf_strike;
sys.line        = tf_line;