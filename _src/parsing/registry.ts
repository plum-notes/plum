import { Container, ReturnTypes, ContainerRoles, ContainerWithContent, ContainerWithId, BasicOperation, ContainerDictionary, AnyContent } from "./parsicon";
import { Utils } from "../misc/utils";
import { BubbleResultList, TraverserAST } from "./traverser";


export class Registry {
    private instances:ContainerDictionary = {};

    constructor(rootAst: Container) {
        // this.#register(rootAst);
        this.#performRegistration(rootAst);
    }

    #register(container:Container) {
        this.#evaluateAndRegister(container);
        const returnType = container.type;
        if(returnType == ReturnTypes.Bool || returnType == ReturnTypes.Float){
            this.#goThroughBoolOrFloatContentForRegister(container as ContainerWithContent);
        // ReturnTypes.Any:
        }else if(Array.isArray((container as ContainerWithContent)?.content)){
            this.#goThroughAnyContentForRegister(container as ContainerWithContent);
        }
    }

    #performRegistration(rootContainer:Container) {
        const traverser = new TraverserAST();
        traverser.v_Container.setVisitor(this.#traverseContainer.bind(this))
        traverser.traverseNode(rootContainer);
    }
    //(node: unknown, data: bubbleResultList)
    #traverseContainer = (container: unknown, data:BubbleResultList) => {//node:unknown, data:unknown
        this.#evaluateAndRegister(container as Container, data);
    }

    getRecordInstance(id: string) {
        return this.instances[id];
    }

    getInstancesClone() {
        const clonedRecords:ContainerDictionary = {};
        const keys = Object.keys(this.instances);
        keys.forEach((key: string) => {
            clonedRecords[key] = this.instances[key];
        });
        return clonedRecords;
    }

    /**
     * Does the actual registering after it satisfies the correct requirements.
     * @param container 
     */
    #evaluateAndRegister(container:Container, resultData:BubbleResultList = {}){
        resultData;
        const id = (container as ContainerWithId).id as string;
        const role = container.role;
        const savedInstance = this.instances[id];
        const isInstantiationRole = role == ContainerRoles.Instantiation;
        const tryingReinstantiation = (isInstantiationRole &&
                                       savedInstance?.role == ContainerRoles.Instantiation);
        if (tryingReinstantiation)
            throw new Error("Duplicate instantiation.");
        const instantiate = ((isInstantiationRole || savedInstance == null) &&
            id   !== null                           &&
            role !== ContainerRoles.Reference       &&
            role !== ContainerRoles.GlobalReference &&
            role !== ContainerRoles.Attribute       &&
            role !== ContainerRoles.Comment         &&
            role !== ContainerRoles.Clone)

        // this.#setNewLines(container);
        if (instantiate)
            this.instances[id] = container;
        
    }

    #setNewLines(container:Container){
        if(!Array.isArray(container.content))
            return;
        for (const key in container.content) {
            if (Object.prototype.hasOwnProperty.call(container.content, key)) {
                const item = container.content[key];
                if(Utils.isANewLineObject(item)){
                    container.content[key] = '<br>';
                }
            }
        }
    }

    

    #goThroughAnyContentForRegister(container:ContainerWithContent){
        ((container as ContainerWithContent).content as AnyContent).forEach((content: Container|string) => {
            if (Utils.isContainer(content))
                this.#register(content as Container);
        });
    }

    #goThroughBoolOrFloatContentForRegister(container:ContainerWithContent){
        if(Utils.isContainer(container.content)){
            this.#register(container.content as Container);
        }
        else if (Utils.isOperation(container.content)){
            const operation = <BasicOperation>container.content;
            if(Utils.isContainer(operation.left))
                this.#register(operation.left as Container);
            if(Utils.isContainer(operation.right))
                this.#register(operation.right as Container);
        }
    }

    
}


// #registerable(container:Container){
        // const registerable = !(typeof (id) != "string" || role == ContainerRoles.Reference || role == ContainerRoles.GlobalReference || role == ContainerRoles.Attribute)
        // return (Utils.isString((c as ContainerWithId).id) &&
        //         c.role != ContainerRoles.Reference &&
        //         c.role != ContainerRoles.Comment &&
        //         c.role != ContainerRoles.GlobalReference &&
        //         c.role != ContainerRoles.Clone &&
        //         c.role != ContainerRoles.Attribute)
    // }


    // #checkSideOfOperation(operationData: any, checkClassification: Classifications, side: string) {
    //     if (operationData[side]?.classification == Classifications.Container) {
    //         this.register(operationData[side]);
    //     } else if (operationData[side]?.classification == checkClassification) {
    //         this.#checkAndRegisterNestedContainers(operationData[side]);
    //     }
    // }

    // #checkAndRegisterNestedContainersByType(container: any, branchClassification: Classifications) {
    //     const contents = (container as ContainerWithContent).content;
    //     const classification = container.classification;
    //     if (classification == Classifications.Container) {
    //         //if this is a simple container instead of a whole operation.
    //         if (contents?.classification == Classifications.Container) {
    //             this.register(contents as Container);
    //         } else {//otherwise check both sides
    //             this.#checkSideOfOperation(contents, branchClassification, "left");
    //             this.#checkSideOfOperation(contents, branchClassification, "right");
    //         }
    //     }
    //     //Is this just an operation as opposed to a container.
    //     else if (classification == branchClassification) {
    //         this.#checkSideOfOperation(container, branchClassification, "left");
    //         this.#checkSideOfOperation(container, branchClassification, "right");
    //     }
    // }

    // #checkAndRegisterNestedContainers(astBranch: Container) {
    //     if (!this.#isContainerRegistrable(astBranch))
    //         return;

    //     const returnType = astBranch.type;
    //     switch (returnType) {
    //     case ReturnTypes.Bool:
    //         this.#checkAndRegisterNestedContainersByType(astBranch, Classifications.BoolOperation);
    //         break;
    //     case ReturnTypes.Float:
    //         this.#checkAndRegisterNestedContainersByType(astBranch, Classifications.MathOperation);
    //         break;
    //     default://ReturnTypes.Any
    //         (astBranch as ContainerWithContent).content.forEach((content: any) => {
    //             if (content.classification == Classifications.Container)
    //                 this.register(content);
    //         });
    //         break;
    //     }
    // }
