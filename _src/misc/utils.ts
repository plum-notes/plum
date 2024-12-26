//import {Registry, Record} from './registry'
import {BasicOperation, BoolOperationContainer, Classifications, Container, ContainerDictionary, ContainerRoles, MathOperationContainer, ReturnTypes, RunContainer} from '../parsing/parsicon'
import { BubbleList, BubblerType, TraverserAST } from '../parsing/traverser';
import { existNode, getCurrentNodeParents, getNodeData } from '../windows/app';

export class Utils {
    
    static isString(source:any):boolean{
        return (typeof source === 'string' || source instanceof String);
    }

    static isBool(source:any):boolean{
        return (typeof source === 'boolean');
    }

    static isNumber(source:any):boolean{
        return (typeof source === 'number' && isFinite(source));
    }

    static deepClone(source:unknown):unknown{
        if(source==null)
            return null
        return JSON.parse(JSON.stringify(source));
    }

    static shallowCloneObject(source:any):any{
        return {...source};
    }

    static shallowCloneArray(source:any):any{
        return [...source];
    }

    static getRunContDeepContent(source:RunContainer):any{//RunContainer|RunContainer[]
        while ((source).content != null)
            source = (source as RunContainer).content;
    }

    /**
     * Improve later...
     * @param element 
     * @returns 
     */
    static isContainer(item: unknown):boolean  {
        return (<Container>item)?.classification !== undefined &&
               (<Container>item)?.classification == Classifications.Container;
    }
    static isRunContainer(item: unknown):boolean  {
        return (<RunContainer>item)?.classification !== undefined &&
                (<RunContainer>item)?.classification == Classifications.RunContainer;
    }
    static isBoolOperation(item: unknown):boolean  {
        return (<BoolOperationContainer>item)?.classification !== undefined &&
                (<BoolOperationContainer>item)?.classification == Classifications.BoolOperation;
    }
    static isMathOperation(item: unknown):boolean  {
        return (<MathOperationContainer>item)?.classification !== undefined &&
                (<MathOperationContainer>item)?.classification == Classifications.MathOperation;
    }
    static isOperation(item: unknown):boolean  {
        return  (<BasicOperation>item)?.classification !== undefined &&
               ((<BasicOperation>item)?.classification == Classifications.MathOperation ||
                (<BasicOperation>item)?.classification == Classifications.BoolOperation);
    }

    static duplicateContainer(c:Container){
        return Utils.deepClone(c) as Container;
    }

    static triggerError(e:unknown):void{
        console.error(e);
    }

    static pathToString(path:Array<unknown>, divider = "."){
        let txt="";
        for (let i = 0; i < path.length; i++) {
            txt+=path[i];
            if(i<path.length-1)
                txt+=divider
        }
        return txt;
    }
    
    static stringToPath(str:string, divider:string = "."):Array<string>{
        if(str === "" || str === null)
            return [];
        return str?.split(divider);
    }

    static getAstBranch(ast:unknown, path:Array<number>){
        let branch = ast as Array<Container>;
        for (let i = 0; i < path.length; i++) {
            branch = branch[0].content[path[i]];            
        }
        return branch;
    }

    static searchContainersById(c:Container, id:string, goInside = false):Container[]{
        const content = c.content;
        let result:Container[] = [];
        if(content==null)
            result;
        if(this.isContainer(content)){
            if((content as Container).id==id){
                result.push(content);
                return result;
            }
        }
        if(Array.isArray(content)){
            for (const item of content) {
                if(this.isContainer(item)){
                    if((item as Container).id == id){
                        result.push(item);
                    }
                    if(goInside){
                        result = result.concat(this.searchContainersById(item as Container,id,true));
                    }
                }
            }
        }
        return result;
    }

    static replaceContainerInsideContent(setTo:Container, idPath:Array<string|number|Container>|string|Container, instances:ContainerDictionary, traverser:TraverserAST){
        if(!Array.isArray(idPath)||idPath.length<1)
            return;
        const clonedPath = Utils.shallowCloneArray(idPath) as Array<string|number|Container>;
        const id = clonedPath[clonedPath.length-1] as string|number;
        clonedPath.pop();
        const parentContainer = this.getNestedContainerByIdInInstances(instances,clonedPath,traverser);
        const clonedSetTo = this.deepClone(setTo) as Container;
        if(this.isString(id))
            clonedSetTo.id = id;
        if(parentContainer!=null)
            Utils.getContainerById(parentContainer,id,traverser,clonedSetTo);
    }

    static getRootIdFromIdPath(idPath:string|number|Array<string|number|Container>|Container|undefined|null):string|undefined|null{
        if(Utils.isString(idPath)){
            return idPath as string;
        }
        if(Utils.isContainer(idPath)){
            return (idPath as Container).id as string;
        }
        if(Array.isArray(idPath)){
            if(idPath.length > 0)
                return Utils.getRootIdFromIdPath(idPath[0])
        }
        return null;
    }

    static getExternalRegistryInstances(rootId:string | string[],fromLibrary=false,rootFolder=false){ 
        const externalReg = getNodeData(rootId,fromLibrary,rootFolder);
        const externalInstances = (externalReg == null)?{}:externalReg.getInstancesClone();
        return externalInstances;
    }

    static getNestedContainerByIdInInstancesGlobal(idPath:Array<string|number|Array<string|Container>>|Array<string|Container>,//|string|Container
                                                   traverser:TraverserAST,
                                                   fromLibrary=false,
                                                   rootFolder=false){
        //A simple ref would be Array<string|Container>
        //otherwise  Array<Array<string|Container>>
        const simpleGlobalRef = Utils.isString((idPath as unknown[])[0]);
        let globalId = simpleGlobalRef?
                       idPath as Array<string|Container>:
                       (idPath as unknown[])[0] as Array<string|Container>;
        globalId = this.arrayRefToArrayString(globalId, traverser);
        const importedInstances:ContainerDictionary = Utils.getExternalRegistryInstances(globalId as string[],fromLibrary,rootFolder);
        if(simpleGlobalRef||(idPath as Array<string>).length<2)
            return importedInstances['root'] as Container;
        const idPathClone = Utils.deepClone(idPath) as Array<string|number>;
        idPathClone.shift();

        return Utils.getNestedContainerByIdInInstances(importedInstances,idPathClone,traverser);
    }

    static gatherRefValue(container:Container,registryInstances:ContainerDictionary,traverser:TraverserAST) {
        let nonRefInstance:Container|null = null;
        const r=container.role;
        if (r == ContainerRoles.Reference) {
            nonRefInstance = Utils.getNestedContainerByIdInInstances(
                registryInstances,
                container.id as Array<string | number> | string,
                traverser
            ) as Container | null;
        } else if (r == ContainerRoles.GlobalReference||
                   r == ContainerRoles.LibraryReference||
                   r == ContainerRoles.GlobalRootReference) {
            nonRefInstance = Utils.getNestedContainerByIdInInstancesGlobal(
                container.id as Array<string | number>,// | string
                traverser,
                r == ContainerRoles.LibraryReference,
                r == ContainerRoles.GlobalRootReference);
        }
        return nonRefInstance;
    }

    static refToArrayString(container:Container, traverser:TraverserAST):{globalId:Array<string>, localId:Array<string|number>}|null{
        const r=container.role;
        if(r != ContainerRoles.GlobalReference &&
           r != ContainerRoles.GlobalRootReference &&
           r != ContainerRoles.LibraryReference &&
           r != ContainerRoles.Reference)
            return null;

        let globalId:string[] = [];
        let localId:(string | number)[] = [];

        if (r == ContainerRoles.Reference) {
            localId = this.breakdownNestedId(container.id as Array<string | number> | string, traverser);
        }else{

            const idPath = container.id as Array<string | number>;

            //Gather Ids as string[]
            const simpleGlobalRef = Utils.isString((idPath as unknown[])[0]);
            const rawGlobalId = simpleGlobalRef?
                            idPath as Array<string|Container>:
                            (idPath as unknown[])[0] as Array<string|Container>;
            globalId = this.arrayRefToArrayString(rawGlobalId, traverser);
            // localId = this.breakdownNestedId(container.id as Array<string | number> | string, traverser)
            
            const idPathClone = Utils.deepClone(idPath) as Array<string|number>;
            idPathClone.shift();
            localId = this.breakdownNestedId(idPathClone, traverser);

            const nodeParents = (r == ContainerRoles.GlobalReference)?getCurrentNodeParents():[];
            globalId = [...nodeParents,...globalId];
        }
        return {globalId:globalId, localId:localId}
    }

    /**
     * Converts an array-id and breaks it down if an element 
     * is a container or a nested id element.
     * @param source 
     * @param traverser 
     * @returns 
     */
    static arrayRefToArrayString(source:Array<string|Container|Array<string|Container>>,
                                           traverser:TraverserAST){
        let result = this.shallowCloneArray(source)as Array<string|Container|Array<string|Container>>;
        if(Array.isArray(result[0]))
            result = result[0] as Array<string|Container>;
        for (const key in result) {
            const item = result[key];
            if(this.isString(item))
                continue;
            if(this.isContainer(item)){ // && (item as Container).role == ContainerRoles.Reference
                result[key] = traverser.traverseNode(item) as string;
            }else{
                throw new Error("Unexpected data.");
            }
        }
        return result as Array<string>;
    }

    // This function is too similar to the previous, TODO: analyze if its better to combine both.
    static breakdownNestedId(idPath:Array<string|number|Container>|string, traverser:TraverserAST){
        if(Utils.isContainer(idPath)){
            idPath = traverser.traverseNode(idPath as unknown as Container) as string;
        }
        if(Utils.isString(idPath)){
            return [idPath as string|number];
        }
        let result:Array<string|number> = [];
        for (const id of idPath) {
            result = [...result, ...this.breakdownNestedId(id as string, traverser)];
        }
        return result;
    }

    static getNestedContainerByIdInInstances(instances:ContainerDictionary, idPath:Array<string|number|Container>|string, traverser:TraverserAST){
        if(Utils.isContainer(idPath)){
            idPath = traverser.traverseNode(idPath as unknown as Container) as string;
        }
        if(Utils.isString(idPath)){
            return instances[idPath as string];
        }
        const idPathClone = Utils.deepClone(idPath) as Array<string|number>;
        if(!Utils.isString(idPathClone[0]) && !Utils.isContainer(idPathClone[0]))
            throw new Error("First item of compound id must be a string or Container.");
        const c = Utils.isContainer(idPathClone[0])?
            instances[traverser.traverseNode(idPathClone[0] as unknown as Container) as string]:
            instances[idPathClone[0]] as Container;
        if(idPathClone.length == 1)
            return c;
        idPathClone.shift();
        return Utils.getNestedContainerById(c, idPathClone, traverser);
    }

    static getNestedContainerById(c:Container, idPath:Array<string|number|Container>, traverser:TraverserAST):Container|null{
        let resultContainer:Container|null = c;
        for (const id of idPath) {
            resultContainer = Utils.getContainerById(resultContainer, id, traverser);
            if(resultContainer==null)
                return null;
        }
        return resultContainer;
    }

    /**
     * Takes a path of strings(by their id) or numbers(index in 
     * container) to search for a specific child container.
     * @param c ContainerParent
     * @param resultedId Path to go through
     * @returns Result container or null if not found
     */
    static getContainerById(c:Container, id:string|number|Container, traverser:TraverserAST, setTo?:Container):Container|null{
        const content = c?.content;
        if(content == null)
            return null;
        let resultedId:string|number|Container|null = id;
        const isIdContainer = Utils.isContainer(resultedId)
        if(isIdContainer){
            resultedId = traverser.traverseNode(resultedId) as string|number|Container|null;
        }
        if(resultedId == null)
            return null;
        const isIdString = Utils.isString(resultedId);
        if(isIdString && Utils.isContainer(content) && (content as Container).id === resultedId)
            return content;
        if(!Array.isArray(content))
            return null;
        if(isIdString){
            return Utils.#getContainerInContentArray(content, resultedId as string, setTo);
        }
        return Utils.#getContainerInContentArrayByIndex(content, resultedId as number, setTo);
    }
    static #getContainerInContentArray(content:unknown[], id:string, setTo?:Container){
        for (const key in content) {
            if (Object.prototype.hasOwnProperty.call(content, key)) {
                const innerContent = content[key];
                if(Utils.isContainer(innerContent) && (innerContent as Container).id === id){
                    if(setTo!=null)
                        content[key] = setTo;
                    return innerContent as Container;
                }
            }
        }
        return null;
    }
    static #getContainerInContentArrayByIndex(content:unknown[], id:number, setTo?:Container){
        let contentIndex = 0;
        for (const key in content) {
            if (Object.prototype.hasOwnProperty.call(content, key)) {
                const innerContent = content[key];
                if(Utils.isContainer(innerContent)){
                    contentIndex++;
                    if(contentIndex===id){
                        if(setTo!=null)
                            content[key] = setTo;
                        return innerContent as Container;
                    }
                }
            }
        }
        return null;
    }

    static getContainerLength(c:Container){
        const content = c?.content;
        if(content == null)
            return 0;
        if(!Array.isArray(content)){
            if(Utils.isContainer(content))
                return 1;
            return 0;
        }
        let contentIndex = 0;
        for (const innerContent of content) {
            if(Utils.isContainer(innerContent)){
                contentIndex++;
            }
        }
        return contentIndex;
    }

    static toFloat(item: unknown){
        if(this.couldPassAsBool(item)){
            return this.toBool(item)?1:0;
        }
        return parseFloat(item as string);
    }

    static couldPassAsBool(item:unknown){
        return((item as boolean)===true||item===1||item==='true'||item==='True'||item==='1'||
               (item as boolean)===false||item===0||item==='false'||item==='False'||item==='0');
    }

    static toBool(item: unknown){
        return((item as boolean)===true||item===1||item==='true'||item==='True'||item==='1');
    }

    static searchBubbleList(list:BubbleList, id:string){
        for (let i = 0; i < list.length; i++) {
            if(list[i].id === id){
                return i;
            }
        }
        return -1;
    }
    static setInBubbleList(list:BubbleList, id:string, to:unknown, type:BubblerType = BubblerType.Regular){
        if(to==null)
            to = '';
        const i = Utils.searchBubbleList(list, id);
        if(i===-1){
            list.push({id:id,object:to, type:type})
            return i;
        }
        list[i].object = to;
        return i;
    }

    // Based on this: https://attacomsian.com/blog/javascript-merge-objects
    static mergeNestedObjects(...objs:unknown[]):unknown{

        // create a new object
        const target:any = {};
    
        // deep merge the object into the target object
        const merger = (obj:any) => {
            for (const prop in obj as any) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        // if the property is a nested object
                        target[prop] = Utils.mergeNestedObjects(target[prop], obj[prop]);
                    } else {
                        // for regular property
                        target[prop] = obj[prop];
                    }
                }
            }
        };
    
        // iterate through all objects and 
        // deep merge them with target
        for (let i = 0; i < objs.length; i++) {
            merger(objs[i]);
        }
    
        return target;
    }

    static isANewLineObject(obj:unknown){
        return (obj as {classification:string})?.classification !=null && (obj as {classification:string}).classification === Classifications.NewLine
    }
    
    static goThroughBubbleListItems(bubbleList:BubbleList, callback:(contentItem:unknown, content:unknown[], key:number) => boolean, id = 'content'){
        for (const item of bubbleList) {
            if(item.id != id || !Array.isArray(item.object))
                continue;

            const content = item.object;
            for (const key in content) {
                // if (Object.prototype.hasOwnProperty.call(content, key)) { }
                const contentItem = content[key];
                const stopChecking = callback(contentItem, content, key as unknown as number);
                if(stopChecking)
                    return;
            }
        }
    }

    static findFirstInHTMLElement(parent:HTMLElement, childClass:string){
        if(parent==null)
            return null;
        for (const child of parent.children) {
            if(child.classList.contains(childClass))
                return child as HTMLElement;
        }
        return null;
    }

    static findAllHTMLElements(parent:HTMLElement, childClass:string, goInside=false){
        let children:Array<HTMLElement> = [];
        for (const child of parent.children) {
            if(child.classList.contains(childClass)){
                children.push(child as HTMLElement);
            }
            if(goInside){
                children = [...children, ...this.findAllHTMLElements(child as HTMLElement,childClass,true)]
            }
        }
        return children;
    }

    static existNode(nodePath:string[]|null|undefined, inLibrary=false){
        return existNode(nodePath, inLibrary);
    }

}
