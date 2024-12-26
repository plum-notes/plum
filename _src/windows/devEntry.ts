import {Container, ContainerRoles, ReturnTypes }  from "../parsing/parsicon";
import {Compiler}                                 from "../parsing/compiler"
import { Utils }                                  from "../misc/utils";
import * as grammar                               from "../parsing/grammar";
import {Parser, Grammar}                          from "nearley";
import { Registry }                               from "../parsing/registry";
import { TraverserAST } from "../parsing/traverser";

let parser             :Parser = new Parser(Grammar.fromCompiled(grammar.default));
// let rootAST            :OldContainer|null = null;//BasketGenerator("root", undefined, ["Hi there", BasketGenerator("b")], ContainerRoles.Instantiation);//
// let selectedBranchPath :Array<number> = [];

//Query Elements:
const sourceText = document.querySelector("#ast-source"    ) as HTMLTextAreaElement;
const parsedText = document.querySelector("#parsed-text"   ) as HTMLDivElement;
//Btns:
const astBtn     = document.querySelector("#log-ast-button") as HTMLButtonElement;
const regBtn     = document.querySelector("#log-reg-button") as HTMLButtonElement;
const runBtn     = document.querySelector("#log-run-button") as HTMLButtonElement;
const errBtn     = document.querySelector("#log-err-button") as HTMLButtonElement;

const rstBtn     = document.querySelector("#reset-button") as HTMLButtonElement;
const initBtn    = document.querySelector("#init-button")  as HTMLButtonElement;

const autoCheck  = document.querySelector ("#auto-parse"    ) as HTMLInputElement;
const errorCheck = document.querySelector ("#error-check"   ) as HTMLInputElement;



let ast:Container;
let reg:Registry;
let run:any;
let err:Error;




//[a.=1][b=[[a.=[a]+1]>10? :[b]]]
//[a.=1][a.=[a]+1]
//[var1=0] /[add1=[var1.:=[var1]+1]]

/* FUNCTIONAL LOOPS!!!
 /[var1=0] 
 [add1=[var1#:=[var1]+1]]
 /[b=0][b=[[var1]<9?[add1][b]:EXIT]][b]
*/

/*
[(tf.h)=99 bottles of beer]/
/[startValue#=0]/
/[add1=[startValue#:=[startValue]-1]]/
/[loop=[[startValue]>[endValue]?[do]/[add1] [loop]:[onEnd]]]/
/
/[do=[startValue] bottles of beer on the wall, [startValue] bottles of beer.
Take one down and pass it around, [temp#=[startValue]-1] bottles of beer on the wall.\n
]/
/[startValue=99]/
/[endValue#=1]/
/[onEnd=1 bottle of beer on the wall, 1 bottle of beer.
Take one down and pass it around, no more bottles of beer on the wall.

No more bottles of beer on the wall, no more bottles of beer.
Go to the store and buy some more, 99 bottles of beer on the wall.]/
[loop]
*/

/*
TEMP:

/[a=1]
/[b=1]
[c#=[d#:=[a]+[b]]]
/[b=5]
[c]



/[var1=0] 
 [add1=[var1#:=[var1]+1]]
[add1]


/[Collapsable blocks]
[a::sys.clp]
[a=a[a=b[a=c]]]
[a=d]

*/




function generateCompilation(){
    const txt:string = window.localStorage.txt = String(sourceText?.value);
    if(!autoCheck.checked)
        return;
    if(errorCheck.checked){
        performCompilation(txt);
        return;
    }
    try {
        performCompilation(txt);
    } catch (error:any) {
        err = error;
        sourceText.classList.add("error-text");
    }
}

function performCompilation(txt:string){
    const rootContainer = generateAST(txt);
    if(rootContainer == null)
        throw new Error("Unknown parser error.");
    
    // const traverser = new TraverserAST();
    // eslint-disable-next-line no-debugger
    // debugger;
    // traverser.setVisitor('asContainer', (node: unknown, resultData: unknown)=>{
    //     console.log((node as Container).id);
    // })
    // console.log(traverser.traverseNode(rootContainer));
    
    // traverse(rootContainer, {
    //     enter(container:Container){
    //         console.log('+ '+container?.id);
    //     },
    //     exit(container:Container){
    //         console.log('- '+container?.id);
    //     }
    // })
    
    
    ast = Utils.deepClone(rootContainer) as Container;
    reg = new Registry(parser.results[0]); 
    const compiler = new Compiler();
    const resultRun = compiler.runAsHTML(reg);
    run = resultRun;
    parsedText.innerHTML = resultRun.result;
    sourceText.classList.remove("error-text");
}

function generateAST(txt:string){    
    parser = new Parser(Grammar.fromCompiled(grammar.default));
    parser.feed(txt);
    return parser.results[0] as Container;
}

function initCompile(){
    errorCheck.checked = window.localStorage.strictErrors === "true";
    // console.log(window.localStorage.txt);
    // if(window.localStorage.txt && sourceText){
        sourceText.value=window.localStorage.txt;
        generateCompilation();
    // }
    if(sourceText){
        (sourceText as HTMLElement).oninput = generateCompilation;
    }
    
}

function reset(){
    window.localStorage.txt = sourceText.value = "";
}

function keyHandler(e:KeyboardEvent) {
    const TABKEY = "Tab";
    
    if(e.key == TABKEY) {
        //sourceText.value += "\t";
        insertAtCursor(sourceText, "\t");
        if(e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }
}

function insertAtCursor(myField:any, myValue:any) {
    if (myField.selectionStart || myField.selectionStart == '0') {
        const startPos = myField.selectionStart;
        const endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
    }
}


/*interface a  {
    a1:boolean,
}
interface b  {
    b1:boolean,
}
interface c extends a,b {c1:boolean};

let ob1:a = {a1:true};

let ob2:c = ob1 as c;

type xx = (a | b) & {num:number};

let yy:xx = {a1:false, num:122}/**/

/*let object:any = {
    a: 2,
    b: 3,
};

let object2 = {...object};
object.a=5;

console.log(object = {...object, a:3});/**/



// function oldCollapser() {
//     const togglers = document.querySelectorAll(".toggler") as NodeListOf<HTMLElement>;
//     togglers.forEach((toggler:HTMLElement) => {
//         toggler.addEventListener("click", (ev: MouseEvent) => {
//             //console.log((ev.target as HTMLElement));
//             //console.log(ev.currentTarget);
//             if((ev.target as HTMLElement).matches( ".toggler" )){
//                 if(toggler.classList.contains("collapsed")){
//                     toggler.getElementsByClassName("toggler-content")[0].removeAttribute("hidden");
//                     //toggler.setAttribute("data-collapsed", "false");
//                     toggler.classList.remove("collapsed");
//                 }else{
//                     toggler.getElementsByClassName("toggler-content")[0].setAttribute("hidden", "");
//                     //toggler.setAttribute("data-collapsed", "true");
//                     toggler.classList.add("collapsed");
//                 }
//             }
//         })
//     });
// }

function mouseHandler() {
    document.addEventListener("click", (ev: MouseEvent) =>{
        //TOGGLERS
        if((ev.target as HTMLElement).classList.contains("toggler")){
            const toggler = (ev.target as HTMLElement);
            const togglerContents = (ev.target as HTMLElement).children[0];
            if(toggler.classList.contains("collapsed")){
                toggler.classList.remove("collapsed");
                togglerContents.removeAttribute("hidden");
            }else{
                toggler.classList.add("collapsed");
                togglerContents.setAttribute("hidden", "");
            }
        }
        // BUTTONS
        if((ev.target as HTMLElement).classList.contains("user-button")){
            console.log('Button Clicked!!!');            
            generateCompilation();
        }
    });
}



/**
 * Initialization
 */
export function init(){
    astBtn.addEventListener("click", (e:Event)=>console.log(ast));
    regBtn.addEventListener("click", (e:Event)=>console.log(reg));
    runBtn.addEventListener("click", (e:Event)=>console.log(run));//monitor//instances//?.raw
    errBtn.addEventListener("click", (e:Event)=>console.log(err?.message));
    
    rstBtn.addEventListener("click", (e:Event)=>reset());
    initBtn.addEventListener("click", (e:Event)=>initCompile());
    
    autoCheck.onchange  = (e:Event)=>{if(autoCheck.checked)generateCompilation()};
    errorCheck.onchange = (e:Event)=>{window.localStorage.strictErrors = errorCheck.checked;generateCompilation();};
    
    sourceText.addEventListener('keydown',keyHandler,false);


    mouseHandler();
    initCompile();
}
// init();

