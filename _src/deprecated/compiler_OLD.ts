import { getNodeData } from "../windows/app";
import { AttStorageData,
         getSpecificAttribute,
         SysAttGetBool,
         SysAttGetMath } from "./systemAttributes_OLD";
import { Utils } from "../misc/utils";

import { DebugMonitoring } from "./debugMonitor";
import { Registry } from "../parsing/registry";
import { RunContainer,
         ContainerDictionary,
         AllPossibleContents,
         Container,
         Classifications,
         ContainerHideable,
         ContainerWithId,
         ContainerWithAttributes,
         ContainerWithContent,
         RootContainer,
         ReturnTypes,
         AnyContent,
         ContainerRoles,
         ContainerCondition,
         ContainerClone,
         ContainerLoop,
         ContainerWrappable,
         ContainerSetAttribute,
         BooleanOperations,
         MathOperationContainer } from "../parsing/parsicon";


export class RecursiveRunData{
    /** Flag for ending recursive method */
    interruptRun:             boolean
    /** Create default data to return: */
    compileResult:            RunContainer
    /** interruptRun: Registered instances (cloned instances from registry class), from args */
    registryInstances:        ContainerDictionary
    /** This is for example if a condition needs to use a different content */
    #contentToProcess:         AllPossibleContents
    // contentToProcess:         any
    /** Create default flag for hidden containers, from args */
    hideContainer:            boolean
    /** Final value that would be stored in the instances registry, null to use `contentToProcess` */
    valueToInstanciate:       Container|null
    /** Store this compiler object. For some special uses */
    compiler:                 Compiler_OLD
    /** Expected type of value to return, from args */
    returnAs?:                Classifications
    /** Current Container, from args */
    #currentContainerToCheck:  Container

    constructor(registryInstances: ContainerDictionary,
                currentContainerToCheck: Container,
                hideOverride: boolean | null = null,
                returnAs:Classifications = Classifications.Container,
                compiler:Compiler_OLD) {
        hideOverride = hideOverride == null ? (currentContainerToCheck as ContainerHideable).hidden : hideOverride;
        this.registryInstances         = registryInstances;
        this.hideContainer             = hideOverride;
        this.returnAs                  = returnAs;
        this.interruptRun              = false;
        this.#currentContainerToCheck  = currentContainerToCheck;
        this.#contentToProcess         = null;
        this.compileResult             = { content: null, classification: Classifications.RunContainer };
        this.valueToInstanciate        = null;
        this.compiler                  = compiler;
    }

    public get role() {
        return this.#currentContainerToCheck.role;
    }

    public get id() {
        return (this.#currentContainerToCheck as ContainerWithId).id;
    }

    public get type() {
        return this.#currentContainerToCheck.type;
    }

    public get atts() {
        return (this.#currentContainerToCheck as ContainerWithAttributes).atts;
    }

    public get content() {
        return (this.#contentToProcess==null)?
               (this.#currentContainerToCheck as ContainerWithContent).content:
                this.#contentToProcess;
    }

    public getContainer(){
        return this.#currentContainerToCheck;
    }

    public overrideContent(newContent:AllPossibleContents){
        return this.#contentToProcess = newContent;
    }

    // public get currentContainerToCheck() {
    //     return this.#currentContainerToCheck;
    // }

}


export class Compiler_OLD {
    maxRecursionLevel     = 2048;
    currentRecursionLevel = 0;

    runProcessesDictionary: { (data: RecursiveRunData): RecursiveRunData; }[] = [
        /** Check Reference Containers:                                     */
        this.#runReference,
        /** Check Attribute Role                                            */
        this.#runSetAttributes,
        /** Check Condition Role                                            */
        this.#runCondition,
        /** Check Cloning Containers:                                       */
        this.#runClones,
        /** Check instantiation and override Containers for simple values:  */
        this.#runContainerValues,
        /** Wrapping stuff when needed:                                     */
        this.#runWrappingData,
        /** Store data to instance                                          */
        this.#saveCurrentContainerToInstances,
    ]

    // TODO: Maybe there is a better way to do this.
    attributeLinks       : { [name: string]: AttStorageData[] } = {};

    monitor:DebugMonitoring = new DebugMonitoring();

    #run(reg: Registry) {
        this.attributeLinks = {};
        this.currentRecursionLevel = 0;
        const instancesClone = reg.getInstancesClone();
        this.monitor.init();
        const result = this.#runMainRecursiveMethod(instancesClone, instancesClone[RootContainer]);
        return {
            result: result, instances: instancesClone, monitor: this.monitor.monitorStringData
        };
    }

    #runMainRecursiveMethod( registryInstances: ContainerDictionary,
                            currentContainerToCheck: Container,
                            hideOverride: boolean | null = null,
                            returnAs:Classifications = Classifications.Container) {
        this.#addAndCheckRecursionLevel();
        this.monitor.monitorNewLayer((currentContainerToCheck as ContainerWithId).id as string);

        let recursiveRunData = new RecursiveRunData(registryInstances,currentContainerToCheck,hideOverride,returnAs,this);
        
        for (let processIndex = 0; processIndex < this.runProcessesDictionary.length; processIndex++) {
            const process = this.runProcessesDictionary[processIndex];
            recursiveRunData = process.call(this, recursiveRunData);
            if (this.#checkInterruptRecursiveMethod(recursiveRunData))
                return recursiveRunData.compileResult;
        }

        //Return whatever we have:
        recursiveRunData.interruptRun = true;
        this.#checkInterruptRecursiveMethod(recursiveRunData);
        return recursiveRunData.compileResult;
    }

    #checkInterruptRecursiveMethod(data: RecursiveRunData): boolean {
        if (!data.interruptRun)//Not yet done.
            return false;
        this.currentRecursionLevel--;
        if (data.hideContainer)
            data.compileResult.content = "";
        this.monitor.monitorGoBackLayer();
        return true;
    }

    #addAndCheckRecursionLevel() {
        this.currentRecursionLevel++;
        if (this.currentRecursionLevel > this.maxRecursionLevel)
            throw new Error("Max recursion reached!!!");
    }
    //TODO: refactor
    getContainerById(registryInstances: ContainerDictionary, id: string | number | Array<string|number|Container> | Container | null | undefined, setContainerTo: Container | null = null) {
        if(id == null || id == undefined)
            return null;
        const isIdArray = Array.isArray(id);
        if (!isIdArray){
            const isIdContainer = Utils.isContainer(id);
            if (isIdContainer){
                const contResult = Utils.getRunContDeepContent(this.#runMainRecursiveMethod(registryInstances, id as Container));
                //console.log(registryInstances);
                return registryInstances[contResult as string];
            }
            return registryInstances[id as string];
        }
        //It's indeed an array:
        let firstId = id[0];
        if(firstId==null)
            return null;
        const newId = Utils.shallowCloneArray(id);
        newId.shift();
        firstId = this.getContainerData(firstId as Container, registryInstances);
        return this.getNestedContainer(registryInstances[firstId as string], newId, registryInstances, setContainerTo);
    }
    getNestedContainer(containerChain:Array<Container>|Container, id: Array<string|number|Container>, registryInstances: ContainerDictionary, setContainerTo: Container | null = null) {
        if (!Array.isArray(containerChain))
            containerChain = [containerChain];
        let nextContainer: Container | null = null;
        let idIndex = 0;
        do {
            if(id[idIndex]==null)
                return null;
            nextContainer = null;
            //const isContainer = Utils.isBasket(id[idIndex]);
            const nextId: string|number = this.getContainerData(id[idIndex] as Container, registryInstances) as string|number;
            //console.log(nextId);
            
            //const nextId: string|number = (isContainer?(this.getContainerById(registryInstances, (id[idIndex] as ContainerWithId).id)) as string:id[idIndex]) as string|number;
            const isIdString = Utils.isString(nextId);
            const currentContainer: Container = containerChain[containerChain.length - 1];
            const isContentAny: boolean = currentContainer?.type == ReturnTypes.Any;
            let currentIndex = 0;
            let trueIndex = 0;//Only counts containers as an indexed object.
            if (isContentAny) {
                const contents = ((currentContainer as ContainerWithContent).content as AnyContent);
                for (let i = 0; i < contents.length; i++) {
                    const content = contents[i];
                    if (Utils.isContainer(content)){
                        trueIndex++;
                        if(( isIdString && (content as ContainerWithId).id == nextId ||
                            !isIdString && trueIndex  == nextId)) {
                            nextContainer = content as Container;
                            currentIndex = i;
                            break;
                        }
                    }
                }
            }
            if (!isContentAny || nextContainer == null) {
                return null;
                throw new Error("Id not found." + (nextContainer == null ? "No container inside" : "Wrong type of container."));
            }
            if (setContainerTo != null && idIndex + 1 == id.length) {
                const contents = ((currentContainer as ContainerWithContent).content as AnyContent);
                const id = (setContainerTo as ContainerWithId).id as Container[];
                const newId = id[id.length - 1];
                (contents[currentIndex] as ContainerWithId).id = newId
                    //contents[currentIndex] = { ...setContainerTo, id:newId };
                containerChain.push(nextContainer);
                break;
            }
            containerChain.push(nextContainer);
        } while (++idIndex < id.length);
        return containerChain[containerChain.length - 1];
    }
    getContainerTrueLength(currentContainer:Container):number{
        const isContentAny: boolean = currentContainer?.type == ReturnTypes.Any;
        if(!isContentAny)
            return 0;
        let trueIndex = 0;//Only counts containers as an indexed object.
        const contents = ((currentContainer as ContainerWithContent).content as AnyContent);
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            if (Utils.isContainer(content)){
                trueIndex++;
            }
        }
        return trueIndex;
    }
    getSubcontainers(currentContainer:Container, goInside = false):Array<Container>{
        const isRef = currentContainer?.role == ContainerRoles.Reference;
        if(isRef){
            throw new Error("Can't accept referenced containers.");
            return [];
        }
        const isContentAny = currentContainer?.type == ReturnTypes.Any;
        if(!isContentAny)
            return [];
        const containers:Array<Container> = [];
        const contents = ((currentContainer as ContainerWithContent).content as AnyContent);
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            if (Utils.isContainer(content)){
                containers.push(content as Container)
                if(goInside){
                    containers.push(...this.getSubcontainers(content as Container, goInside));
                }
            }
        }
        return containers;
    }
    getContainersFromArray(contentArray:Array<Container>, goInside = false):Array<Container>{
        const resultArray:Array<Container> = [];
        for (let i = 0; i < contentArray.length; i++) {
            const element = contentArray[i];
            // if(Utils.isContainer(element)){
                resultArray.push(element);
                if(goInside){
                    resultArray.push(...this.getSubcontainers(element, goInside));
                }
            // }
        }
        return resultArray;
    }
    getRunContainersFromArray(contentArray:Array<any>, goInside = false):Array<RunContainer>{
        const resultArray:Array<RunContainer> = [];
        for (let i = 0; i < contentArray.length; i++) {
            const element = contentArray[i];
            if(Utils.isRunContainer(element)){
                resultArray.push(element);
                if(goInside){
                    resultArray.push(...this.getRunContainersFromArray(element, goInside));
                    //resultArray.push(...this.getSubcontainers(element, goInside));
                }
            }
        }
        return resultArray;
    }

    getContainerData(container:Container, registryInstances: ContainerDictionary){
        if(!Utils.isContainer(container))
            return container;
        let result:any/*RunContainer[]|RunContainer|string|number|boolean*/ = Utils.getRunContDeepContent(this.#runMainRecursiveMethod(registryInstances, container));
        const isArray = Array.isArray(result);
        result = isArray?(result as RunContainer[]).join():result;
        //result = (isArray && (result as Array<any>).length == 1)?(result as Array<any>)[0]:result;
        switch ((container as Container).type) {
            case ReturnTypes.Float:
                result = parseFloat(result as string);
                break;
            case ReturnTypes.Bool:
                // TODO: convert this to a method:
                result = ((result as boolean)===true||result===1||result==='true'||result==='True'||result==='1');
                break;
            default:
                break;
        }
        
        return result;
    }

    #runCondition(data: RecursiveRunData): RecursiveRunData {
        if (data.role != ContainerRoles.Condition)
            return data;
        const container = data.getContainer() as ContainerCondition;
        const conditionMatched: boolean = this.#doBool(container.condition, data.registryInstances);
        if (conditionMatched)
            return data;
        if (container.elseContent != null){
            data.overrideContent(container.elseContent);
        }else{
            data.interruptRun = true;
        }
        return data;
    }

    #runReference(data: RecursiveRunData): RecursiveRunData {
        const isRef = data.role == ContainerRoles.Reference ||
                      data.role == ContainerRoles.GlobalReference;
        if(!isRef)
            return data;
        const isGlobal = data.role == ContainerRoles.GlobalReference;
        const id:string|string[] = (data.id as string|string[]);
        let containerContent:Container|null;//|RunContainerContent
        if(isGlobal){
            const isCompoundId = Array.isArray(id);
            const rootId:string = isCompoundId?id[0]:id as string;
            const externalReg = getNodeData(rootId);
            const externalInstances = (externalReg == null)?{}:externalReg.getInstancesClone();

            let newResult:any;
            if(isCompoundId){
                if((id as Array<string>).length==1)
                    newResult = externalInstances[RootContainer];
                else if((id as Array<string>).length==2)
                    newResult = externalInstances[id[1]];
                else{
                    const cloneId = Utils.shallowCloneArray(id) as string[];
                    cloneId.shift();
                    cloneId.shift();
                    newResult = this.getNestedContainer(externalInstances[id[1]], cloneId, data.registryInstances);
                    // console.log(cloneId);
                    // console.log(newResult);
                }
            }
            
            /*let idSource;
            if(isCompoundId && (id as Array<string>).length>1){
                const cloneId = Utils.shallowCloneArray(id) as string[];
                //cloneId.shift();
                cloneId[0] = RootContainer;
                idSource = cloneId;
            }
            else
                idSource = RootContainer;
            
            containerContent = this.getContainerById(externalInstances, idSource);//?.getRecordInstance('root') as Container;
            */
            containerContent = newResult;
        }
        else{
            const id = data.id as string | Array<string>;
            // console.log(id);            
            containerContent = this.getContainerById(data.registryInstances, id);
        }
        //console.log(containerContent);

        // if (containerContent == null){
        //     //console.log(containerContent);
        //     //data.compileResult.content = "";
        //     (data.compileResult.content as Array<any>) = 
        //         this.applyAtts((data.currentContainerToCheck as ContainerWithId).id, [''], data, (data.currentContainerToCheck as ContainerWithAttributes).atts);
        // }
        // else if (containerContent.classification == Classifications.Container){

            // data.compileResult.setContent(containerContent);
            if (containerContent != null && Utils.isContainer(containerContent)){
                data.compileResult.content = this.#runMainRecursiveMethod(data.registryInstances, containerContent, false, data.returnAs);
        
                //data.compileResult.setContent(this.runMainRecursiveMethod(data.registryInstances, containerContent as Container, false, data.returnAs));
            }else{
                data.compileResult.content = containerContent;
                // data.compileResult.setContent(containerContent as RunContainerContent);
            }
        //Execute attributes.
        if (containerContent == null){
            (data.compileResult.content as Array<any>) = 
            this.#applyAtts(data.id, [''], data, data.atts);

            // data.compileResult.setContent(this.#applyAtts(data.id, [''], data, data.atts));
                // (data.compileResult.content as Array<any>) = //ContainerDictionary
                //     this.#applyAtts(data.id, [''], data, data.atts);
        }else{
            const attsResult = this.#applyAtts(data.id, [data.compileResult.content], data, data.atts);

            // const attsResult = this.#applyAtts(data.id, [data.compileResult.getContent()], data, data.atts);
                //The way this is stored is a bit of a hack, so TODO: fix it.
                // (data.compileResult.content as Array<any>) = attsResult.length ==1?attsResult[0]:attsResult;
            (data.compileResult.content as Array<any>) = attsResult.length ==1?attsResult[0]:attsResult;

            // data.compileResult.setContent(attsResult.length ==1?attsResult[0]:attsResult);
                
        }
        
        data.interruptRun = true;
        return data;//{resultedContent:contentT oProcess, interruptRun:true, compileResult:data.compileResult};

    }

    #runClones(data: RecursiveRunData): RecursiveRunData {
        if (data.role != ContainerRoles.Clone)
            return data;
        const container = data.getContainer() as ContainerClone;
        const newId: string = data.id as string;
        const targetName = container.target;

        let recordContent: any = this.getContainerById(data.registryInstances, targetName);
        //let recordContent:any = (data.registryInstances[targetName]);
        if ((recordContent as Container)?.classification == Classifications.Container) {
            recordContent = Utils.deepClone(recordContent);
            recordContent.id = newId;
            //data.compileResult.content = this.runMainRecursiveMethod(data.registryInstances,recordContent, false);
            data.compileResult.content = recordContent.content//Utils.shallowCloneArray(recordContent.content);
        }
        else {
            recordContent = "";
        }
        //else
        //    data.compileResult.content = recordContent.content//Utils.shallowCloneArray(recordContent.content);
        //if((data.compileResult.content as RunContainer).classification == Classifications.RunContainer)
        //    data.hideContainer = false;

        data.registryInstances[newId] = recordContent;
        data.interruptRun = true;
        return data;
    }

    #doAny(data: RecursiveRunData){
        const compileResultContent:Array<any> = [];
        (data.content as AnyContent).forEach((containerSingleContent: any) => {
            const isContainer = Utils.isContainer(containerSingleContent);
            const dataToPush: any = isContainer ?
                this.#runMainRecursiveMethod(data.registryInstances, containerSingleContent) :
                containerSingleContent;
            compileResultContent.push(dataToPush);
        });
        return compileResultContent;
    }

    // #runContainerValues(data: RecursiveRunData): RecursiveRunData {
    //     //Reminder: The storing into current instances is done later by saveCurrentContainerToInstances function.

    //     const containerType = data.type;
    //     if (containerType == ReturnTypes.Any) {
    //         // data.compileResult.content = [];
    //         // const compileResultContent:Array<any> = [];
    //         // TODO: Looping might need to be separated from this function:
    //         let loop = true;
    //         let loopCount = 0;
    //         const doLoop = data.role == ContainerRoles.Loop;
    //         const containerLoop = (data.getContainer() as ContainerLoop);
    //         if (doLoop){
    //             loop = this.#doBool(containerLoop.condition, data.registryInstances);
    //         }
    //         while(loop){
    //             loopCount++;
    //             this.#addAndCheckRecursionLevel();
    //             loop = false;
    //             data.compileResult.setContent(this.#doAny(data));

    //             if (doLoop){
    //                 loop = this.#doBool(containerLoop.condition, data.registryInstances);
    //             }
    //         }
    //         this.currentRecursionLevel -= loopCount;
            
    //     }
    //     else if (containerType == ReturnTypes.Bool) {
    //         data.compileResult.setContent([this.#doBool(data.content, data.registryInstances)]);
    //     }
    //     else if (containerType == ReturnTypes.Float) {
    //         data.compileResult.setContent(this.#doMath(data.content, data.registryInstances));
    //     }
    //     else if (containerType == ReturnTypes.None) {
    //         data.compileResult.setContent("");
    //     }
    //     //Apply attributes:
    //     if(data.compileResult.getContent() != null){
    //         data.compileResult.setContent(
    //         this.#applyAtts(data.id,
    //             data.compileResult.getContent() as any[],//[data.compileResult.content]
    //                         data,
    //                         data.atts)
    //                         )
    //     }
    //     //data.compileResult.type = containerType;
    //     return data;
    // }
    #runContainerValues(data: RecursiveRunData): RecursiveRunData {

        //Reminder: The storing into current instances is done later by saveCurrentContainerToInstances function.

        const containerType = data.type;
        //console.log(containerType+' :>'+(<ContainerWithId>data.currentContainerToCheck).id)
        
        if (containerType == ReturnTypes.Any) {

            data.compileResult.content = [];
            const compileResultContent:Array<any> = [];
            // TODO: Looping might need separated from this function:
            let loop = true;
            let loopCount = 0;
            const doLoop = data.role == ContainerRoles.Loop;
            const containerLoop = (data.getContainer() as ContainerLoop);
            if (doLoop){
                loop = this.#doBool(containerLoop.condition, data.registryInstances);
            }
            while(loop){
                loopCount++;
                this.#addAndCheckRecursionLevel();
                loop = false;
                (data.content as AnyContent).forEach((containerSingleContent: any) => {
                    const dataToPush: any = containerSingleContent.classification == Classifications.Container ?
                        this.#runMainRecursiveMethod(data.registryInstances, containerSingleContent) :
                        containerSingleContent;
                    compileResultContent.push(dataToPush);
                });
                
                
                //Apply attributes:
                (data.compileResult.content as Array<any>) = 
                    this.#applyAtts(data.id,
                                    compileResultContent, 
                                    data,
                                    data.atts);

                if (doLoop){
                    loop = this.#doBool(containerLoop.condition, data.registryInstances);
                }
            }
            this.currentRecursionLevel -= loopCount;
            
        }
        else if (containerType == ReturnTypes.Float) {
            data.compileResult.content = this.#doMath(data.content, data.registryInstances);
        }
        else if (containerType == ReturnTypes.Bool) {
            data.compileResult.content = this.#doBool(data.content, data.registryInstances);
            //Apply attributes:
            (data.compileResult.content as Array<any>) = 
                this.#applyAtts(data.id,
                                [data.compileResult.content], 
                                data,
                                data.atts);
        }
        else if (containerType == ReturnTypes.None) {
            data.compileResult.content = "";
        }
        //data.compileResult.type = containerType;

        return data;
    }

    #applyAtts(containerId:any, 
                      compileResultContent:Array<any>, 
                      data: RecursiveRunData, 
                      quickAtts:any = null){
        compileResultContent = this.#executeAtts(compileResultContent,data,this.attributeLinks[containerId]);
        compileResultContent = this.#executeAtts(compileResultContent,data,quickAtts);
        //(<ContainerWithContent>data.currentContainerToCheck).content = compileResultContent;
        return compileResultContent;
    }

    #executeAtts(compileResultContent:Array<any>, 
                        data: RecursiveRunData, 
                        atts:Array<any>){
        const hasAtts = atts?.length > 0;
        if(!hasAtts)
            return compileResultContent;
        const getAsTypeOfData = data.returnAs;
        for (let i = 0; i < atts.length; i++) {
            const att = (atts[i].att == null)?getSpecificAttribute(atts[i].id):atts[i].att;

            if(att == null)
                continue;
            const sourceOptions = atts[i].sourceOptions;
            if(getAsTypeOfData==Classifications.BoolOperation){
                compileResultContent = [(att as SysAttGetBool).processBool(compileResultContent,
                                            sourceOptions,
                                            data)];
            }else if(getAsTypeOfData==Classifications.MathOperation){
                compileResultContent = [(att as SysAttGetMath).processMath(compileResultContent,
                                            sourceOptions,
                                            data)];
            }else{
                compileResultContent = att.process(compileResultContent,
                                                sourceOptions,
                                                data);
            }
        }
        return compileResultContent;
    }

    #runWrappingData(data: RecursiveRunData): RecursiveRunData {
        const recordId = data.id;
        const container = data.getContainer() as ContainerWrappable;
        if (((recordId != null) && container.wrap)) {
             data.valueToInstanciate = Utils.shallowCloneObject(data.getContainer()) as Container;
            (data.valueToInstanciate as ContainerWithContent).content = this.#wrapContainers(data.compileResult);
            (data.valueToInstanciate as ContainerWrappable).wrap = false;
            //(data.currentContainerToCheck as ContainerWithContent).content = this.wrapContainers(data.compileResult);
            //(data.currentContainerToCheck as ContainerWrappable).wrap = false;
            //this.monitorData("wrapping", [(data.currentContainerToCheck as ContainerWithContent).content]);//"wrapping", [(data.currentContainerToCheck as ContainerWithContent).content,
        } //else {
            //this.monitorData("Not wrapping", [(data.currentContainerToCheck as ContainerWithContent).content]);//"wrapping", [(data.currentContainerToCheck as ContainerWithContent).content,
        //}
        return data;
    }

    #runSetAttributes(data: RecursiveRunData): RecursiveRunData {
        if (data.role != ContainerRoles.Attribute)
            return data;
        const container:ContainerSetAttribute = data.getContainer() as ContainerSetAttribute;
        //data.compileResult.content = "attribute";
        //(data.currentContainerToCheck as ContainerWithAttributes).atts
        //console.log(getSpecificAttribute(currentContainer.reference));
        const att = getSpecificAttribute(container.reference);
        
        //TODO: what if it's not a string as the id.
        const containerId:string = container.id as string;
        if(this.attributeLinks[containerId]==null)
            this.attributeLinks[containerId] = [];
        if(att !== null){
            const attData:AttStorageData = {att:att,sourceOptions:container.sourceOptions,classification:Classifications.AttributeStorage}
            this.attributeLinks[containerId].push(attData);
        }
        //[a::sys.text_format.bold[abc]]

        if(container.sourceOptions != null)
            this.#runMainRecursiveMethod(data.registryInstances, container.sourceOptions);


            
        return data;
    }

    #saveCurrentContainerToInstances(data: RecursiveRunData): RecursiveRunData {
        //TODO: store non-saving containers and automatize this and also the registering as well.
        if (data.role == ContainerRoles.Reference ||
            data.role == ContainerRoles.GlobalReference ||
            data.role == ContainerRoles.Attribute/**/)
            return data;


        const recordId = data.id;
        const container = data.getContainer();

        //console.log(data.currentContainerToCheck);
        const emptyValueToInstantiate = data.valueToInstanciate == null;
        // if(!emptyValueToInstantiate){
        //     console.log(emptyValueToInstantiate);
        // }

        const valueToInstance = emptyValueToInstantiate?container:data.valueToInstanciate as Container;


        //Compound reference id:
        if (Array.isArray(recordId)) {
            //let containerContent:any = this.getContainerById(data.registryInstances, recordId);
            //containerContent = data.currentContainerToCheck;
            this.getContainerById(data.registryInstances, recordId, valueToInstance);

            //Regular id:
        } else {
            data.registryInstances[recordId as string] = valueToInstance;
            this.monitor.monitorData("Set data to instance", valueToInstance);
        }
        return data;
    }

    #checkOperationIsContainer(operation: any, registryInstances: any, returnAs:Classifications = Classifications.Container): any {
        if ((operation as Container).classification != Classifications.Container)
            return null;
        const container: Container = (operation as Container);
        let recordResult: any = this.#runMainRecursiveMethod(registryInstances, container, null, returnAs);//, true
        // console.log(recordResult);
        
        //TODO: Test this next statement
        // return Utils.getRunContDeepContent(recordResult);
        while (Utils.isRunContainer(recordResult)){
            // recordResult = (recordResult as RunContainer).getContent();
            recordResult = (recordResult as RunContainer).content;
        }
        return recordResult;
    }

    asBool(value:unknown):boolean{
        if (Array.isArray(value) && value.length == 1) {
            return Boolean(value[0]);
        }
        if(value == 'false' || value == '0' || value == 0)
            return false;
        return Boolean(value);
    }

    #doBool(operation: any, registryInstances: any): boolean {
        const resultContainer = this.#checkOperationIsContainer(operation, registryInstances, Classifications.BoolOperation);
        if (resultContainer != null) {
            //console.log(resultContainer+' '+this.asBool(resultContainer));
            return this.asBool(resultContainer);
        }
        if (operation.type != ReturnTypes.Bool)
            return Boolean(operation);
        let result = false;
        switch (operation.operation) {
            case BooleanOperations.And:
                result = this.#doBool(operation.left, registryInstances) && this.#doBool(operation.right, registryInstances);
                break;
            case BooleanOperations.Or:
                result = this.#doBool(operation.left, registryInstances) || this.#doBool(operation.right, registryInstances);
                break;
            case BooleanOperations.Equal:
                result = (this.doBoolOrMath(operation.left, registryInstances) == this.doBoolOrMath(operation.right, registryInstances));
                break;
            case BooleanOperations.NotEqual:
                result = this.doBoolOrMath(operation.left, registryInstances) != this.doBoolOrMath(operation.right, registryInstances);
                break;
            //Numeric comparison:
            case BooleanOperations.MoreThan:
                result = this.#doMath(operation.left, registryInstances) > this.#doMath(operation.right, registryInstances);
                break;
            case BooleanOperations.LessThan:
                result = this.#doMath(operation.left, registryInstances) < this.#doMath(operation.right, registryInstances);
                break;
            case BooleanOperations.MoreThanEq:
                result = this.#doMath(operation.left, registryInstances) >= this.#doMath(operation.right, registryInstances);
                break;
            case BooleanOperations.LessThanEq:
                result = this.#doMath(operation.left, registryInstances) <= this.#doMath(operation.right, registryInstances);
                break;
            default:
                break;
        }
        return result;
    }

    #doMath(operation: any, registryInstances: any): number {
        if (typeof (operation) === 'number')
            return operation;
        const resultContainer = this.#checkOperationIsContainer(operation, registryInstances, Classifications.MathOperation);
        if (resultContainer != null)
            return Number(resultContainer);
        operation = (operation as MathOperationContainer)
        let result = 0;
        switch (operation.operation) {
            case "add":
                result = this.#doMath(operation.left, registryInstances) + this.#doMath(operation.right, registryInstances);
                break;
            case "sub":
                result = this.#doMath(operation.left, registryInstances) - this.#doMath(operation.right, registryInstances);
                break;
            case "div":
                result = this.#doMath(operation.left, registryInstances) / this.#doMath(operation.right, registryInstances);
                break;
            case "mul":
                result = this.#doMath(operation.left, registryInstances) * this.#doMath(operation.right, registryInstances);
                break;
            default:
                break;
        }
        return result;
    }

    doBoolOrMath(operation: any, registryInstances: any): boolean|number {
        let resultContainer: boolean|number = this.#checkOperationIsContainer(operation, registryInstances, Classifications.MathOperation);
        if (resultContainer != null)
            return resultContainer;
        if ((operation as Container).type == ReturnTypes.Float) {
            resultContainer = this.#doMath(operation, registryInstances);
        }
        else if ((operation as Container).type == ReturnTypes.Bool) {
            resultContainer = this.#doBool(operation, registryInstances);
        }
        else
            resultContainer = operation;
        return resultContainer;//operation
    }

    // #wrapContainers(runContainer: RunContainer): any {
    //     if ((runContainer.getContent() as RunContainer)?.classification == Classifications.RunContainer) {
    //         this.monitor.monitorData("wrappingType", ['RunContainer']);
    //         return this.#wrapContainers((runContainer.getContent() as RunContainer));
    //     }
    //     const isContentArray = Array.isArray(runContainer.getContent());
    //     if (!isContentArray) {
    //         this.monitor.monitorData("wrappingType", ['Not array']);
    //         return runContainer.getContent();
    //     }

    //     const arrayResult: any = [];
    //     (runContainer.getContent() as Array<any>).forEach((innerContent: any) => {
    //         const isRunContainer: boolean = (innerContent as RunContainer).classification == Classifications.RunContainer;
    //         arrayResult.push(isRunContainer ? this.#wrapContainers(innerContent) : innerContent);
    //     });

    //     this.monitor.monitorData("wrappingType", ['Array']);
    //     return arrayResult;//runContainer.content;
    // }

    #wrapContainers(runContainer: RunContainer): any {
        if ((runContainer.content as RunContainer).classification == Classifications.RunContainer) {
            this.monitor.monitorData("wrappingType", ['RunContainer']);
            return this.#wrapContainers((runContainer.content as RunContainer));
        }
        const isContentArray = Array.isArray(runContainer.content);
        if (!isContentArray) {
            this.monitor.monitorData("wrappingType", ['Not array']);
            return runContainer.content;
        }

        const arrayResult: any = [];
        (runContainer.content as Array<any>).forEach((innerContent: any) => {
            const isRunContainer: boolean = (innerContent as RunContainer).classification == Classifications.RunContainer;
            arrayResult.push(isRunContainer ? this.#wrapContainers(innerContent) : innerContent);
        });

        this.monitor.monitorData("wrappingType", ['Array']);
        return arrayResult;//runContainer.content;
    }

    runAsHTML(reg: Registry): any {
        const { result, instances, monitor } = this.#run(reg);// runContainer:RunContainer
        return { raw: result, result: this.#getInnerRunData(result), instances: instances, monitor: monitor };
    }

    #getInnerRunData(runContainer: RunContainer): string {
        let result: string = "";//"<pre>";//
        if (runContainer.content?.classification == Classifications.RunContainer){
            return this.#getInnerRunData((runContainer.content as RunContainer));
        }
        const isContentArray = Array.isArray(runContainer.content);
        if (!isContentArray) {
            result += runContainer.content!=null?
                      runContainer.content:
                      (typeof runContainer === 'string'?runContainer:'');
            return result;
        }
        (runContainer.content as Array<any>).forEach((content: any) => {
            if(content.classification){
                result += this.#getInnerRunData(content);
            }else if (Array.isArray(content)){
                content.forEach(innerContent => {
                    result += this.#getInnerRunData(innerContent);
                });
            }else{
                result += content;
            }
        });
        
        return result;
    }

    // #getInnerRunData(runContainer: RunContainer): string {
    //     let result = "";//"<pre>";//   
    //     if(!Utils.isRunContainer(runContainer)){
    //         return result;
    //     }
    //     if (Utils.isRunContainer(runContainer.getContent())){
    //         return this.#getInnerRunData((runContainer.getContent() as RunContainer));
    //     }
    //     const isContentArray = Array.isArray(runContainer.getContent());
    //     if (!isContentArray) {
    //         result += runContainer.getContent()!=null?
    //                   runContainer.getContent():
    //                   (typeof runContainer === 'string'?runContainer:'');
    //         return result;
    //     }
    //     (runContainer.getContent() as Array<any>).forEach((content: any) => {
    //         if(content.classification){
    //             result += this.#getInnerRunData(content);
    //         }else if (Array.isArray(content)){
    //             content.forEach(innerContent => {
    //                 result += this.#getInnerRunData(innerContent);
    //             });
    //         }else{
    //             result += content;
    //         }
    //     });
        
    //     return result;
    // }

}

