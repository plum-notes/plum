import { Utils } from "../misc/utils";
import { BasicOperation, Container } from "./parsicon";

interface TraverseResult {
    success:boolean;
    data?:unknown;
}

export type BubbleItem       = {id:string, object:unknown, type:BubblerType, condition?:Container};
export type BubbleList       = Array<BubbleItem>;
export type BubbleCaller     = (node:unknown, bubbleList:BubbleList) => BubbleList;
export type BubbleResultList = {[name:string]:unknown|Array<unknown>};
export type VisitorCallback  = (node:unknown, data:BubbleResultList) => unknown;
export enum BubblerType {
    None,
    /** Default value, perform regular bubbling */
    Regular,
    AsArray,
    AsLoop,
}

///////////////////////////////////////////////////////

export abstract class ATraverser {
    #visitorCallers:Array<VisitorCaller> = [];
    
    traverseNode(node:unknown):unknown{
        for (const caller of this.#visitorCallers) {
            const callResult = caller.executeCall(node, this.traverseNode.bind(this));
            if(callResult.success)
                return callResult.data;
        }
        return null;
    }

    protected addVisitorCaller(caller:VisitorCaller){
        this.#visitorCallers.push(caller);
    }

}

///////////////////////////////////////////////////////

export class TraverserAST extends ATraverser{
    v_Container:VisitorCaller;
    v_Operation:VisitorCaller;
    v_Array:VisitorCaller;
    v_Default:VisitorCaller;
    
    constructor() {
        super();

        ///////////
        this.addVisitorCaller(this.v_Container = this.createContainerVisitor ());
        this.addVisitorCaller(this.v_Operation = this.createOperationVisitor ());
        this.addVisitorCaller(this.v_Array     = this.createArrayVisitor     ());
        this.addVisitorCaller(this.v_Default   = this.createDefaultVisitor   ());
        ///////////
    }

    private createContainerVisitor() {
        const v_Container = new VisitorCaller((node: unknown) => {
            return Utils.isContainer(node);
        },
        (node: unknown, data: BubbleResultList) => {
            return data.content;
        }
        );
        v_Container.addBubbler((node: unknown, bubbleList: BubbleList) => {
            bubbleList.push({ id: 'content', object: (node as Container).content, type:BubblerType.Regular});
            return bubbleList;
        });
        return v_Container;
    }

    private createOperationVisitor() {
        const v_Operation = new VisitorCaller((node: unknown) => {
            return Utils.isOperation(node);
        },
        (node: unknown, data: BubbleResultList) => {
            return data.content;
        }
        );
        v_Operation.addBubbler((node: unknown, bubbleList: BubbleList) => {
            const operation = node as BasicOperation;
            bubbleList.push({
                id: 'left', object: operation.left, type:BubblerType.Regular
            });
            if(operation.right != null){
                bubbleList.push({
                    id: 'right', object: operation.right, type:BubblerType.Regular
                });
            }
            return bubbleList;
        });
        return v_Operation;
    }

    private createArrayVisitor() {
        const v_Array = new VisitorCaller((node: unknown) => {
            return Array.isArray(node);
        },
        (node: unknown, data: BubbleResultList) => {
            const content = data.content as Array<unknown>;
            if(content.length == 1 && content[0] == null)
                return null;
            return content.join('');
        }
        );
        v_Array.addBubbler((node: unknown, bubbleList: BubbleList) => {
            bubbleList.push({ id: 'content', object: (node as Array<unknown>), type:BubblerType.AsArray });
            return bubbleList;
        });
        return v_Array;
    }

    private createDefaultVisitor() {
        const v_Default = new VisitorCaller(( /*node: unknown*/) => {
            return true;
        },
        (node: unknown) => {
            return node;
        }
        );
        return v_Default;
    }
}

/**
 * This works on three main steps:
 * 1. Validation: Checks if the received node is valid to proceed
 * 2. Bubbling  : With the received value, it sets a list of objects 
 * to propagate deeper.
 * 3. Visits    : Takes the bubbled resulted data and perform the 
 * intended purpose of the traversal.
 */
class VisitorCaller{
    #validator:(node:unknown) => boolean;
    #bubblers :Array<BubbleCaller> = [];
    #visitor:VisitorCallback|null = null;
    constructor(validator:(node:unknown) => boolean, visitor?:VisitorCallback) {
        this.#validator = validator;
        if(visitor != null)
            this.#visitor = visitor;
    }

    addBubblers(callers:Array<{caller:BubbleCaller, addFirst?:boolean|null|undefined}>){
        for (const caller of callers) {
            this.addBubbler(caller.caller, caller.addFirst===null?undefined:caller.addFirst);
        }
    }

    addBubbler(caller:BubbleCaller, addFirst = false){
        if (addFirst) {
            this.#bubblers.unshift(caller);
            return;
        }
        this.#bubblers.push(caller);
    }

    getVisitor(){
        return this.#visitor;
    }

    setVisitor(visitor:VisitorCallback){
        this.#visitor = visitor;
    }

    executeCall(node:unknown, traverserFunction:(node: unknown)=>unknown):TraverseResult{
        // Validate:
        const success = this.#validator(node as Container);
        if(!success)
            return {success:false, data:null};
        
        // const r = node==null?'':((node as {role:string}).role as string);
        // if(r == "condition")
        //     debugger;

        // Bubble analysis:
        let bubbleList:BubbleList = [];
        this.#bubblers.forEach(bubbleCall => {
            bubbleList = bubbleCall(node, bubbleList);
        });

        // Perform bubbling:
        const resultData:BubbleResultList = {};
        bubbleList.forEach(bubble => {
            if(bubble.type === BubblerType.AsArray){
                const resultArray:Array<unknown> = [];
                (bubble.object as Array<unknown>).forEach(element => {
                    resultArray.push(traverserFunction(element));
                });
                resultData[bubble.id] = resultArray;
            }else if(bubble.type === BubblerType.Regular)
                resultData[bubble.id] = traverserFunction(bubble.object);
        });

        // Visit:
        return {success:success, data:this.#visitor===null?resultData:this.#visitor(node, resultData)};
    }
}



// type TraverseOptions  = {
//     enter?    :(node:unknown) => void,
//     exit?     :(node:unknown, data?: unknown) => unknown,
// }

// type Validator = (node:unknown, options:TraverseOptions) => TraverseResult;

// interface TraverseVisitor {
//     validator: Validator;
//     visit?: TraverseOptions;
// }

        // this.visitors[ValidatorIds.Container] = {validator: validators[ValidatorIds.Container]};
        // this.visitors[ValidatorIds.Operation] = {validator: validators[ValidatorIds.Operation]};
        // this.visitors[ValidatorIds.Array    ] = {validator: validators[ValidatorIds.Array    ]};
        // this.visitors[ValidatorIds.String   ] = {validator: validators[ValidatorIds.String   ]};
        // this.visitors[ValidatorIds.Bool     ] = {validator: validators[ValidatorIds.Bool     ]};
        // this.visitors[ValidatorIds.Number   ] = {validator: validators[ValidatorIds.Number   ]};
        // this.visitors[ValidatorIds.Default  ] = {validator: validators[ValidatorIds.Default  ]};

// export enum ValidatorIds {
//     Container = 'asContainer',
//     Operation = 'asOperation',
//     Array     = 'asArray',
//     String    = 'asString',
//     Bool      = 'asBool',
//     Number    = 'asNumber',
//     Default   = 'asDefault',
// }

////////////////////////////
//** LIST OF VALIDATORS **//
// const validators: { [name: string]: Validator } = {};

// validators[ValidatorIds.Container] = function(node:unknown, options:TraverseOptions){
//     // Validates
//     const success = Utils.isContainer(node);
//     if(!success)
//         return {success:false, data:null};

//     // Data bubbling
//     const container = node as Container;
//     if(options.enter != null)
//         options.enter(node);
//     type ContainerData  = {success:boolean, data:{
//         content:unknown,
//         elseContent:unknown,
//         condition:unknown,
//     } };
//     const containerResult:ContainerData = {success:true, data:{
//         content:null,
//         elseContent:null,
//         condition:null,
//     }};
//     if(container.content !== null){
//         containerResult.data.content=(this as unknown as ATraverser).traverseNode(container.content);
//     }
//     if(container.elseContent !== null){
//         containerResult.data.elseContent=(this as unknown as ATraverser).traverseNode(container.elseContent);
//     }
//     if(container.condition !== null){
//         containerResult.data.condition=(this as unknown as ATraverser).traverseNode(container.condition);
//     }

//     // Visits
//     const result = {success:true, data:{} as unknown}
//     if(options.exit != null)
//         result.data = options.exit(node as Container, containerResult.data);
//     return result;
// }

// validators[ValidatorIds.Operation] = function(node:unknown, options:TraverseOptions){
//     const success = Utils.isOperation(node);
//     if(!success)
//         return {success:false, data:null};
//     if(options.enter != null)
//         options.enter(node);
//     const operation = node as BasicOperation;
//     const resultData:unknown = {
//         left           : (this as unknown as ATraverser).traverseNode(operation.left),
//         right          : (this as unknown as ATraverser).traverseNode(operation.right),
//         operation      : operation.operation,
//         classification : operation.classification,
//     }
//     const result = {success:true, data:resultData}
//     if(options.exit != null)
//         result.data = options.exit(node, result?.data);
//     return result;
// }

// validators[ValidatorIds.Array] = function(node:unknown, options:TraverseOptions){
//     const success = Array.isArray(node);
//     if(!success)
//         return {success:false, data:null};
//     if(options.enter != null)
//         options.enter(node);
//     const nodeArray = node as Array<unknown>;
//     let result:unknown = [];
//     nodeArray.forEach(subNode => {
//         (result as Array<unknown>).push((this as unknown as ATraverser).traverseNode(subNode));
//     });
//     if(options.exit != null)
//         result = options.exit(node, result);
//     return {success:success, data:result};
// }

// validators[ValidatorIds.String] = function(node:unknown, options:TraverseOptions){
//     const success = Utils.isString(node);
//     if(!success)
//         return {success:false, data:null};
//     if(options.enter != null)
//         options.enter(node);
//     let result:unknown = node as string;
//     if(options.exit != null)
//         result = options.exit(node, result);
//     return {success:success, data:result};
// }

// validators[ValidatorIds.Bool] = function(node:unknown, options:TraverseOptions){
//     const success = Utils.isBool(node);
//     if(!success)
//         return {success:false, data:null};
//     if(options.enter != null)
//         options.enter(node);
//     let result:unknown = node as boolean;
//     if(options.exit != null)
//         result = options.exit(node, result);
//     return {success:success, data:result};
// }

// validators[ValidatorIds.Number] = function(node:unknown, options:TraverseOptions){
//     const success = Utils.isNumber(node);
//     if(!success)
//         return {success:false, data:null};
//     if(options.enter != null)
//         options.enter(node);
//     let result:unknown = node as string;
//     if(options.exit != null)
//         result = options.exit(node, result);
//     return {success:success, data:result};
// }

// validators[ValidatorIds.Default] = function(node:unknown, options:TraverseOptions){
//     if(options.enter != null)
//         options.enter(node);
//     let result:unknown = node;
//     if(options.exit != null)
//         result = options.exit(node, result);
//     return {success:true, data:result};
// }
