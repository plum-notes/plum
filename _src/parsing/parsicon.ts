//PARSER LEXICON
import { RecursiveRunData } from "../deprecated/compiler_OLD";
import { SysAtt } from "../deprecated/systemAttributes_OLD";
import { Utils } from "../misc/utils";

export interface RunContainer{
    type?           : ReturnTypes;
    content         :any;
    //content         : RunContainerContent;//any;//number|boolean|string
    classification  : Classifications.RunContainer;
}

export class _RunContainer{
    type?           : ReturnTypes;
    content         : _RunContainerContent;//any;//number|boolean|string
    classification  = Classifications.RunContainer;
    constructor(content:_RunContainerContent=null ) {
        this.content = content;
    }
    setContent(content:_RunContainerContent|Container|null=null,
               data:RecursiveRunData|null = null){
                this.content = content as _RunContainerContent;
                return;
        if(Utils.isContainer(content)){
            // this.content = data?.compiler.runMainRecursiveMethod(data.registryInstances, content as Container, false, data.returnAs)
        }    
        else if(Utils.isRunContainer(content)){
            this.content = content as _RunContainerContent;
        }else{ 
        // if(content === null || content === undefined){
            this.content = "";
        //     return;
        // }
        }
    }
    getContent(){
        //console.log(content);
        return this.content;
    }
}

export type _RunContainerContent = number|boolean|string|_RunContainer|null|undefined|(number|boolean|string|_RunContainer|null)[];

// export interface OldContainer_{
//     type            : ReturnTypes;
//     content         : Array<any>|MathOperationOrNumber;
//     id              : string|null;
//     role            : ContainerRoles;
//     condition?      : any;
//     elseContent?    : any;
//     hidden          : boolean;
//     wrap?           : any;
//     classification  : Classifications.Container;
// }

export type AttributeData = {
    id:Array<string>;
    type?:"att";
    sourceOptions?:Container;
}

export type Container = {
    classification    : Classifications.Container,
    attributes        : Array<SysAtt>,
    role              : ContainerRoles,
    type?             : ReturnTypes;
    comment?          : string;
    target?           : string|number|Array<string|number|Container>|Container|null,//for cloning
    condition?        : any;
    elseContent?      : any;
    reference?        : any;
    sourceOptions?    : Container;//for atts
    left?             : BasicOperation|Container,
    operation?        : BooleanOperations|MathOperations,
    right?            : BasicOperation|Container|null;
    content?          : any;
    atts?             : AttributeData[],
    wrap?             : boolean|null, 
    hidden            : boolean, 
    id?               : string|number|Array<string|number|Container>|Container|null,
    lastSavedValue?   : unknown,
    ignoreSavedValue? : boolean,
    eatNL?        : boolean
};
//const c:Container2 = {classification:Classifications.Container, attributes:[]}

export type Container2 =  (ContainerInstance      |
                          ContainerOverwrite     |
                          ContainerReference     |
                          ContainerComment       |
                          ContainerClone         |
                          ContainerSetAttribute  |
                          ContainerCondition     |
                          ContainerLoop)         & {classification:Classifications.Container, attributes:Array<SysAtt>, lastSavedValue?:unknown};

export interface ContainerWithContent   {content: AllPossibleContents,                                                  role: ContainerRoles}
export interface ContainerWithId        {id?:     string|number|Array<string|number|Container>|Container|null, role: ContainerRoles}
export interface ContainerHideable      {hidden:  boolean,                                              role: ContainerRoles}
export interface ContainerWrappable     {wrap?:   boolean|null,                                         role: ContainerRoles}
export interface ContainerWithAttributes{atts?:   any,                                                  role: ContainerRoles}

export interface ContainerInstance extends ContainerWithContent,ContainerWithId,ContainerHideable,ContainerWrappable{
    role            : ContainerRoles.Instantiation;
    type            : ReturnTypes;
}

export interface ContainerOverwrite extends ContainerWithContent,ContainerWithId,ContainerHideable,ContainerWrappable{
    role            : ContainerRoles.Overwrite;
    type            : ReturnTypes;
}

export interface ContainerReference extends ContainerWithId,ContainerHideable{
    role            : ContainerRoles.Reference | ContainerRoles.GlobalReference;
    type            : ReturnTypes.Any;
}

export interface ContainerComment{
    role            : ContainerRoles.Comment;
    type            : ReturnTypes.None;
    comment         : string;
}

export interface ContainerClone extends ContainerWithId, ContainerHideable{
    role            : ContainerRoles.Clone;
    type            : ReturnTypes.Any;
    target          : string;
}

export interface ContainerCondition extends ContainerWithContent, ContainerHideable{
    role            : ContainerRoles.Condition;
    type            : ReturnTypes.Any;
    condition       : any;
    elseContent?    : any;
}

export interface ContainerLoop extends ContainerWithContent,ContainerHideable{
    role            : ContainerRoles.Loop;
    type            : ReturnTypes.Any;
    condition       : any;
}

export interface ContainerSetAttribute extends ContainerWithId{
    role            : ContainerRoles.Attribute;
    type            : ReturnTypes.None;
    reference       : any;
    sourceOptions   : Container;
}

export type MathOperationOrNumber = number|MathOperationContainer;
export interface MathOperationContainer extends BasicOperation {
    type?           : ReturnTypes.Float,
    operation       : MathOperations,
    classification  : Classifications.MathOperation;
}

export type BoolOperationOrBool = boolean|BoolOperationContainer;
export interface BoolOperationContainer extends BasicOperation {
    type?          : ReturnTypes.Bool,
    operation      : BooleanOperations,
    classification : Classifications.BoolOperation;
}

export type BasicOperation = {
    type?          : ReturnTypes.Bool|ReturnTypes.Float,
    left           : BasicOperation|Container,
    operation      : BooleanOperations|MathOperations,
    right?         : BasicOperation|Container|null;
    classification : Classifications.BoolOperation|Classifications.MathOperation;
}

export type BasicRawOperation = {
    type?          : ReturnTypes.Bool|ReturnTypes.Float,
    left           : unknown,
    operation      : BooleanOperations|MathOperations,
    right?         : unknown|null,
    classification : Classifications.BoolOperation|Classifications.MathOperation,
}

export type AllPossibleContents = AnyContent|OperationContent|null
export type AnyContent=(Container|string)[];
export type OperationContent=BasicOperation|Container;

export function ContainerGenerator(role:ContainerRoles,
                            {id=null,
                             type=ReturnTypes.None,
                             wrap=null,
                             hidden=null,
                             content=null,
                             comment=null,
                             condition=null,
                             elseContent=null,
                             target=null,
                             sourceOptions=null,
                             quickAtts=null,
                             ignoreSavedValue=null,
                             eatNL=null
                          }:{id?:string|Array<string>|null,
                             type?:ReturnTypes,
                             wrap?:boolean|null,
                             hidden?:boolean|null,
                             content?:AnyContent|null,
                             comment?:string|null,
                             condition?:any,
                             elseContent?:any,
                             target?:string|null,
                             sourceOptions?:Container|null,
                             quickAtts?:any|null,
                             ignoreSavedValue?:boolean|null,
                             eatNL?:boolean|null
                          }={}):Container{
    let container:any = {};
    container.role = role;
    container.classification = Classifications.Container;
    container.eatNL = eatNL;
    
    switch (container.role) {
        case ContainerRoles.Instantiation:
        case ContainerRoles.Overwrite:
        case ContainerRoles.AnonInstance:
        case ContainerRoles.Link:
            (container as ContainerOverwrite) = {...container,
                role     : container.role,
                type     : type,
                hidden   : hidden as boolean,
                id       : id,
                content  : content,
                wrap     : wrap,
                atts     : quickAtts,
            }
        break;
        case ContainerRoles.GlobalReference:
        case ContainerRoles.Reference:
        case ContainerRoles.LibraryReference:
        case ContainerRoles.GlobalRootReference:
            (container as ContainerReference) = {...container,
                role     : container.role,
                type     : ReturnTypes.Any,
                hidden   : hidden as boolean,
                //wrap     : true,
                atts     : quickAtts,
                ignoreSavedValue: ignoreSavedValue,
                id       : id}
        break;
        case ContainerRoles.Comment:
            (container as ContainerComment) = {...container,
                role     : container.role,
                type     : ReturnTypes.None,
                comment  : comment as string,
                }
        break;
        case ContainerRoles.Clone:
            (container as ContainerClone) = {...container,
                role             : container.role,
                type             : ReturnTypes.Any,
                hidden           : hidden as boolean,
                target  : target as string,
                id               : id,
                }
        break;
        case ContainerRoles.Condition:
            (container as ContainerCondition) = {...container,
                role             : container.role,
                type             : ReturnTypes.Any,
                hidden           : hidden as boolean,
                content          : content,
                condition        : condition,
                elseContent      : elseContent
                }
        break;
        case ContainerRoles.Loop:
            (container as ContainerLoop) = {...container,
                role             : container.role,
                type             : ReturnTypes.Any,
                hidden           : hidden as boolean,
                content          : content,
                condition        : condition,
                }
        break;
        case ContainerRoles.Attribute:
            (container as ContainerSetAttribute) = {...container,
                role             : container.role,
                type             : ReturnTypes.None,
                id               : id,
                reference        : target,
                sourceOptions    : sourceOptions,
                }
        break;
        default:
        break;
    }
    // console.log(container);
    return container;
}

export function MathGenerator(l:any, op:MathOperations, r:any = null):MathOperationContainer{
    const operationContainer:MathOperationContainer ={
        classification:Classifications.MathOperation,
        type:ReturnTypes.Float,
        left: l,
        operation: op,
    };
    if (r != null){
        operationContainer.right = r;
    }
    return operationContainer;
}

export function BoolGenerator(l:any, op:BooleanOperations, r:any = null):BoolOperationContainer{
    const operationContainer:BoolOperationContainer ={
        classification:Classifications.BoolOperation,
        type:ReturnTypes.Bool,
        left: l,
        operation: op,
    };
    if (r != null){
        operationContainer.right = r;
    }
    return operationContainer;
}

// export interface RecursiveRunData {
//     /** Flag for ending recursive method */
//     interruptRun:             boolean,
//     /** Create default data to return: */
//     compileResult:            RunContainer,
//     /** interruptRun: Registered instances (cloned instances from registry class), from args */
//     registryInstances:        ContainerDictionary,
//     /** Current Container, from args */
//     currentContainerToCheck:  Container,
//     /** This is for example if a condition needs to use a different content */
//     contentToProcess:         any,
//     /** Create default flag for hidden containers, from args */
//     hideContainer:            boolean,
//     /** Final value that would be stored in the instances registry, null to use `contentToProcess` */
//     valueToInstanciate:       any|null,
//     /** Store this compiler object. For some special uses */
//     compiler:                 Compiler,
//     /** Expected type of value to return, from args */
//     returnAs?:                Classifications,
// }

export interface ContainerDictionary { [name: string]: Container }
// export interface ContainerDictionary2{ [name: string]: {container:Container, raw:unknown} }

export enum ReturnTypes {
    Any   = "any",
    Bool  = "bool",
    Float = "float",
    None  = "none",
    // Int   = "int",
}

export enum ContainerRoles{
    Instantiation        = "instantiation",
    Reference            = "reference",
    GlobalReference      = "globalReference",
    GlobalRootReference  = "globalRootRef",
    LibraryReference     = "libReference",
    Overwrite            = "overwrite",
    Comment              = "comment",
    Condition            = "condition",
    Clone                = "clone",
    AnonInstance         = "anon",
    Attribute            = "att",
    Loop                 = "loop",
    Link                 = "link",
}    


export const RootContainer = "root";

export enum BooleanOperations{
    MoreThan           = ">",
    MoreThanEq         = ">=",
    LessThan           = "<",
    LessThanEq         = "<=",
    Equal              = "==",
    NotEqual           = "!=",
    Not                = "!",
    And                = "&&",
    Or                 = "||",
}
export enum MathOperations{
    add = "add",
    sin = "sin",
    mul = "mul",
    div = "div",
    sub = "sub",
}

export enum Classifications{
    Container        = "Container",
    MathOperation    = "Math",
    BoolOperation    = "Bool",
    RunContainer     = "RunContainer",
    Attribute        = "Attribute",
    AttributeStorage = "AttributeStorage",
    NewLine          = "NewLine"
}


//ContainerGenerator(ContainerRoles.Instantiation, {type:ReturnTypes.Any, id:RootContainer, content:[]})
