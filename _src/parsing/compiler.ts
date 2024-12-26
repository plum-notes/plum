import { Container, 
         ContainerRoles,
         BooleanOperations,
         RootContainer,
         Classifications,
         ContainerDictionary,
         MathOperations,
         BasicOperation,
         AttributeData,
         ReturnTypes,
        } from "./parsicon";
import { Utils } from "../misc/utils";
import { Registry } from "./registry";
import { TraverserAST } from "./traverser";
import { AttMethod, getAttribute, getAttributeRequirements, RequirementData } from "./systemAttributes";
import { BubblingHandler } from "./compilerBubbling";

export class Compiler {
    // #result:RunContainer = {content:[], classification:Classifications.RunContainer};
    #registryInstances: ContainerDictionary = {};
    #attributeLinks       : { [name: string]: Array<AttributeData>} = {};
    #traverser:TraverserAST = new TraverserAST();
    // #maxRecursionLevel = 2048;

    #run(reg: Registry) {
        this.#registryInstances = reg.getInstancesClone();
        const root = this.#registryInstances[RootContainer];

        this.#initRunTraverser();
        // debugger;
        return this.#traverser.traverseNode(root);
    }
    runAsHTML(reg: Registry) {
        const runResult = this.#run(reg) as string;        
        return { raw: 'raw', result: runResult};//, instances: instances, monitor: monitor
    }

    #initRunTraverser(){
        // this.#traverser.v_Container.addBubbler(this.#bubbleContainerCondition.bind(this));
        // this.#traverser.v_Container.addBubbler(this.#bubbleContainerCloning.bind(this));
        // this.#traverser.v_Container.addBubbler(this.#bubbleContainerLoop.bind(this));
        // this.#traverser.v_Container.addBubbler(this.#bubbleContainerRef.bind(this));
        // this.#traverser.v_Container.addBubbler(this.#bubbleContainerAttribute.bind(this));
        new BubblingHandler(this.#traverser,this.#registryInstances,this.#attributeLinks);

        this.#traverser.v_Container.setVisitor(this.#traverseContainer.bind(this));
        this.#traverser.v_Operation.setVisitor(this.#traverseOperation.bind(this));
        this.#traverser.v_Default.  setVisitor(this.#traverseDefault.  bind(this));
    }

    #traverseDefault = (node:unknown, data:unknown) =>{
        data
        if(Utils.isANewLineObject(node))
            return '<br>';
        return node;
    }

    #traverseOperation = (node:unknown, data:unknown) =>{
        const operation:{left:unknown, right?:unknown} = data as {left:unknown, right?:unknown};
        
        let result = operation.left;
        const classification = (node as BasicOperation).classification;
        if(classification == Classifications.MathOperation){
            switch ((node as BasicOperation).operation) {
                case MathOperations.add:
                    result = Utils.toFloat(operation.left) + Utils.toFloat(operation.right);
                    break;
                case MathOperations.sub:
                    result = Utils.toFloat(operation.left) - Utils.toFloat(operation.right);
                    break;
                case MathOperations.div:
                    result = Utils.toFloat(operation.left) / Utils.toFloat(operation.right);
                    break;
                case MathOperations.mul:
                    result = Utils.toFloat(operation.left) * Utils.toFloat(operation.right);
                    break;
                case MathOperations.sin:
                    result = Math.sin(Utils.toFloat(operation.left));
                    break;
                default:
                    break;
            }
        }else if(classification == Classifications.BoolOperation){
            switch ((node as BasicOperation).operation) {
                case BooleanOperations.And:
                    result = Utils.toBool(operation.left) && Utils.toBool(operation.right);
                    break;
                case BooleanOperations.Equal:
                    if(operation.right==null)
                        result = operation.left != null;
                    else
                        result = Utils.toFloat(operation.left) == Utils.toFloat(operation.right);
                    break;
                case BooleanOperations.LessThan:
                    result = Utils.toFloat(operation.left)  < Utils.toFloat(operation.right);
                    break;
                case BooleanOperations.LessThanEq:
                    result = Utils.toFloat(operation.left) <= Utils.toFloat(operation.right);
                    break
                case BooleanOperations.MoreThan:
                    result = Utils.toFloat(operation.left)  > Utils.toFloat(operation.right);
                    break;
                case BooleanOperations.MoreThanEq:
                    result = Utils.toFloat(operation.left) >= Utils.toFloat(operation.right);
                    break;
                case BooleanOperations.NotEqual:
                    result = Utils.toFloat(operation.left) != Utils.toFloat(operation.right);
                    break;
                case BooleanOperations.Or:
                    result = Utils.toBool(operation.left) || Utils.toBool(operation.right);
                    break;
                case BooleanOperations.Not:
                    result = !Utils.toBool(operation.left);
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    #traverseContainer = (node:unknown, data:{[name:string]:unknown}) =>{
        const container:Container = node as Container;
        const isContentArray = Array.isArray(data.content);
        let dataContent = isContentArray?(data.content as Array<unknown>).join(''):data.content;

        switch (container.role) {
            case ContainerRoles.Overwrite:
            case ContainerRoles.Instantiation:{
                if(Utils.isString(container.id))
                    this.#registryInstances[container.id as string] = container;
                else
                    Utils.replaceContainerInsideContent(container,container?.id as Array<string|number|Container>,this.#registryInstances,this.#traverser);
            }break;
            case ContainerRoles.Attribute:
                if(!Utils.isString(container.id))
                    throw new Error("Invalid name for an attribute assignation.");
                
                if(this.#attributeLinks[container.id as string]==null)
                    this.#attributeLinks[container.id as string]=[];
                this.#attributeLinks[container.id as string].push({id:container.reference,sourceOptions:container.sourceOptions});
                break;
            default:
                break;
        }
        if(container.type==ReturnTypes.Bool){
            dataContent = Utils.toBool(dataContent);
        }else if(container.type==ReturnTypes.Float){
            dataContent = Utils.toFloat(dataContent);
        }
        if(container.role != ContainerRoles.Attribute)
            dataContent = this.#applyAttributes(container, dataContent);
        container.lastSavedValue = dataContent;
        if(container.hidden)
            dataContent = '';
        // console.log('  ***');
        // console.log(container.role);
        // console.log(container);
        
        return dataContent;
    }

    /*================================ MISC ==============================*/
    

    #applyAttributes(container:Container, dataContent:unknown){
        const allAtts = this.#gatherAttributes(container) as AttributeData[];
        if(allAtts == null)
            return dataContent;
        // if(dataContent==null)
        //     dataContent='';
        for (const att of allAtts) {
            const attMethod = getAttribute(att.id) as AttMethod;
            if(attMethod !== null){
                dataContent = attMethod({
                    originalContent:dataContent==null?'':dataContent as string,
                    attSettings:this.#containerToAttRequirement(att.sourceOptions, attMethod),
                    sourceId:container.id as string,
                    sourceRole:container.role,
                });
            }
        }
        return dataContent;
    }
    #gatherAttributes(container:Container){
        let allAtts = Utils.deepClone(this.#attributeLinks[container.id as string]) as AttributeData[];
        if(allAtts == null)
            allAtts = [];
        if(container.atts != null){
            for (const att of container.atts) {
                allAtts.push(att);
            }
        }
        return allAtts;
    }

    #containerToAttRequirement(containerSettings:Container|undefined, attMethod:AttMethod){
        const attReqs = Utils.deepClone(getAttributeRequirements(attMethod)) as RequirementData[];
        if(attReqs==null)
            return;
        if(containerSettings==null)
            return attReqs;
        const isRef = containerSettings.role==ContainerRoles.Reference;
        for (const attReq of attReqs) {
            let instance:Container|null;
            if(isRef){
                instance = Utils.getNestedContainerByIdInInstances(
                    this.#registryInstances,
                    [containerSettings.id, ...attReq.path] as Array<string>|string,
                    this.#traverser
                ) as Container|null;
            }else{
                instance = Utils.getNestedContainerById(containerSettings, attReq.path,this.#traverser)
            }
            if(instance!==null){
                attReq.default = this.#traverser.traverseNode(instance.lastSavedValue==null?instance:instance.lastSavedValue);
            }
        }
        return attReqs;
    }

}