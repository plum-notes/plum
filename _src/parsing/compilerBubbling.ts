import { Utils } from "../misc/utils";
import { AttributeData, Container, ContainerDictionary, ContainerRoles } from "./parsicon";
import { getAttribute, AttBMethod, AttMethod, getAttributeRequirements, RequirementData } from "./systemAttributes";
import { BubbleList, TraverserAST } from "./traverser";


export class BubblingHandler{
    #traverser:TraverserAST;
    #registryInstances: ContainerDictionary = {};
    #attributeLinks: { [name: string]: Array<AttributeData>} = {};
    
    constructor(traverser:TraverserAST, registryInstances:ContainerDictionary, attributeLinks: { [name: string]: Array<AttributeData>} ) {
        this.#traverser = traverser;
        this.#registryInstances = registryInstances;
        this.#attributeLinks = attributeLinks;
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerCondition.bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerCloning  .bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerLoop     .bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerRef      .bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerLink     .bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerAttribute.bind(this));
        this.#traverser.v_Container.addBubbler(this.#bubbleContainerExtra    .bind(this));
    }

    #bubbleContainerCondition = (node:unknown, bubbleList:BubbleList) => {
        const container:Container = node as Container;
        if(container.role != ContainerRoles.Condition)
            return bubbleList;
        
        const conditionContainer = Utils.duplicateContainer(container.condition);
        conditionContainer.ignoreSavedValue = true;
        const conditionRawResult = Utils.toBool(this.#traverser.traverseNode(conditionContainer));
        const conditionResult = conditionRawResult === true;

        // conditionContainer.ignoreSavedValue = true;
        // const conditionResult = (this.#traverser as TraverserAST).traverseNode(conditionContainer) === true;
        if(!conditionResult){
            Utils.setInBubbleList(bubbleList,'content',container.elseContent==null?'':container.elseContent);
        }
        
        
        return bubbleList;
    }

    #bubbleContainerCloning = (node:unknown, bubbleList:BubbleList) => {
        const container:Container = node as Container;
        if(container.role != ContainerRoles.Clone){
            return bubbleList;
        }
        const nonRefInstance = Utils.gatherRefValue(container.target as Container,this.#registryInstances,this.#traverser);
        if(nonRefInstance==null)
            return bubbleList;
        const clonedTarget = Utils.duplicateContainer(nonRefInstance);
        // let clonedTarget = Array.isArray(container.target)?Utils.shallowCloneArray(container.target) as unknown:container.target;
        // const isGlobal = (container.target as string[])[0]=='@';
        // if(isGlobal){
        //     (clonedTarget as string[]).shift();
        //     clonedTarget=(clonedTarget as string[])[0];
        // }
        // const clonedContainer = Utils.deepClone(
        //     isGlobal?
        //     Utils.getNestedContainerByIdInInstancesGlobal(clonedTarget as (string | number)[],this.#traverser):
        //     Utils.getNestedContainerByIdInInstances(this.#registryInstances,clonedTarget as Array<string|number>|string,this.#traverser)
        // ) as Container;
        // this.#registryInstances[container.id as string] = clonedContainer;
        this.#registryInstances[container.id as string] = clonedTarget;
        Utils.setInBubbleList(bubbleList,'content',clonedTarget);
        return bubbleList;
    }

    #bubbleContainerLoop = (node:unknown, bubbleList:BubbleList) => {
        const container:Container = Utils.duplicateContainer(node as Container);
        if(container.role !== ContainerRoles.Loop)
            return bubbleList;
        let conditionContainer = container.condition;

        let conditionResult = false;
        if(conditionContainer==true)
            conditionContainer = 1;
        if(conditionContainer==null||!conditionContainer){
            conditionResult = false;
            Utils.setInBubbleList(bubbleList,
                'content', '');
            return bubbleList;
        }else if(Utils.isNumber(conditionContainer)||Utils.isString(conditionContainer)){
            let conditionValue = parseInt(conditionContainer as unknown as string);
            
            const goDown = (conditionValue>0);
            conditionValue=goDown?conditionValue-1:conditionValue+1;
            container.condition = conditionValue;
            conditionResult=conditionValue!=0;
        }else{
            conditionContainer.ignoreSavedValue = true;
            const conditionRawResult = Utils.toBool(this.#traverser.traverseNode(conditionContainer));
            conditionResult = conditionRawResult === true;
        }
        
        
        if(conditionResult){
            Utils.setInBubbleList(bubbleList,
                                  'content',
                                  [this.#traverser.traverseNode(container.content),
                                   this.#traverser.traverseNode(container)] // <= This creates the loop.
                                 );
        }
        return bubbleList;
    }

    #bubbleContainerLink = (node:unknown, bubbleList:BubbleList) => { 
        const container:Container = node as Container;
        const isLink = container.role == ContainerRoles.Link;
        if(!Utils.isContainer(node) || !isLink)
            return bubbleList;
        const idContainer = (node as Container).id as Container;
        const idData = Utils.refToArrayString(idContainer, this.#traverser);
        const isLibrary = idContainer.role==ContainerRoles.LibraryReference;
        const exist = Utils.existNode(idData?.globalId, isLibrary)!=null;        
        if(idData!=null){
            if((node as Container).content==null||(node as Container).content==''){
                Utils.setInBubbleList(bubbleList,'content',exist);
            }else{
                const newBubbleList:Array<string|Container> = 
                    ['<span class="'+((exist&&!isLibrary)?'link-to':'link-invalid')+'" data-link-target="'+idData.localId.join('.')+'" data-link-target-global="'+idData.globalId.join('.')+'">',
                    (node as Container).content, '</span>'];
                Utils.setInBubbleList(bubbleList,'content',newBubbleList);
            }
        }
        return bubbleList;
    }

    #bubbleContainerRef = (node:unknown, bubbleList:BubbleList) => {
        const container:Container = node as Container;
        // const isRef = container.role == ContainerRoles.Reference ||
        //               container.role == ContainerRoles.GlobalReference ||
        //               container.role == ContainerRoles.GlobalRootReference ||
        //               container.role == ContainerRoles.LibraryReference;
        let nonRefInstance = Utils.gatherRefValue(container,this.#registryInstances,this.#traverser);
        if(nonRefInstance==null)
            return bubbleList;
        const useSavedValue = nonRefInstance.lastSavedValue!=null&&container.ignoreSavedValue!=true;
        if(!useSavedValue){
            nonRefInstance = Utils.deepClone(nonRefInstance) as Container
            nonRefInstance.hidden = false;
        }
        const result = useSavedValue?nonRefInstance.lastSavedValue:nonRefInstance;
        Utils.setInBubbleList(bubbleList,'content',result);
        return bubbleList;
    }

    //* Keep in mind only some attributes work in the bubbling stage.
    #bubbleContainerAttribute = (node:unknown, bubbleList:BubbleList) => {
        if(!Utils.isContainer(node))
            return bubbleList;
        const container:Container = node as Container;
        this.#applyAttributesBubbling(container,bubbleList);
        return bubbleList;
    }

    #bubbleContainerExtra = (node:unknown, bubbleList:BubbleList) => {
        //Remove new lines if indicated by previous Container.
        let eat = false;
        Utils.goThroughBubbleListItems(bubbleList, (contentItem: unknown, content: unknown[], key: number)=>{
            const isContainer = Utils.isContainer(contentItem);
            const isNL = Utils.isANewLineObject(contentItem);
            if (isContainer&&((contentItem as Container).eatNL || (contentItem as Container).hidden)) {
                eat = true;
            }else {
                if(isNL && eat){
                    content[key] = '';
                }
                eat = false;
            }
            return false;
        });
        return bubbleList;
    }

/**========================================================================
 *                           HELPER METHODS:
 *========================================================================**/


    #applyAttributesBubbling(container:Container, bubbleList:BubbleList){
        const allAtts = this.#gatherAttributes(container) as AttributeData[];
        if(allAtts == null)
            return bubbleList;
        // let nonRefInstance = container as Container|null;
        // if(nonRefInstance?.role == ContainerRoles.Reference){
        //     nonRefInstance = Utils.getNestedContainerByIdInInstances(
        //         this.#registryInstances,
        //         container.id as Array<string|number>|string,
        //         this.#traverser
        //     ) as Container|null;
        // }else if(nonRefInstance?.role == ContainerRoles.GlobalReference){
        //     nonRefInstance = Utils.getNestedContainerByIdInInstancesGlobal(
        //         container.id as Array<string|number>|string,
        //         this.#traverser) as Container|null;
        // }
        const refInstance = Utils.gatherRefValue(container,this.#registryInstances,this.#traverser);
        for (const att of allAtts) {
            const attMethod = getAttribute(att.id, true) as AttBMethod;
            if(attMethod !== null){
                attMethod({
                    container:refInstance==null?container:refInstance,
                    bubbleList:bubbleList,
                    attSettings:this.#containerToAttRequirement(att.sourceOptions, attMethod),
                });
            }
        }        
        return bubbleList;
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



}