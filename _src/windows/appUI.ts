import { Utils } from "../misc/utils";
import { TreeNodePanel } from "./app";


type ListenerData={token:string, cb:{ (target:HTMLElement): void; }, thisArg:unknown};

export class AppUI {
    // Elements Declaration
    ////////////////////////////
    sourceText:HTMLTextAreaElement;
    parsedText:HTMLDivElement;
    treePanel:HTMLDivElement;
    splittedWindows:NodeListOf<HTMLDivElement>;
    subPanel:HTMLDivElement;
    content:HTMLDivElement;
    subPanelDivider:HTMLDivElement;
    //let addBtn:HTMLButtonElement;
    // let rmvBtn:HTMLButtonElement;
    // let rfsBtn:HTMLButtonElement;
    private clickListeners:ListenerData[] = [];
    private inputListeners:Array<{ (): void}> = [];
    private currentLayout = 0;

    constructor() {
        this.sourceText      = document.querySelector("#ast-source")    as HTMLTextAreaElement;
        this.parsedText      = document.querySelector("#parsed-text")   as HTMLDivElement;
        this.treePanel       = document.querySelector(".sidebar-nodes") as HTMLDivElement;
        this.splittedWindows = document.querySelectorAll('.divided-window');
        this.subPanel        = document.querySelector('.subdiv-panel') as HTMLDivElement;
        this.subPanelDivider = this.subPanel.children[1] as HTMLDivElement;
        this.content         = document.querySelector('.app-content') as HTMLDivElement;

        // addBtn = document.querySelector(".add-node") as HTMLButtonElement;
        // rmvBtn = document.querySelector(".rmv-node") as HTMLButtonElement;
        // rfsBtn = document.querySelector(".rfs-node") as HTMLButtonElement;

        this.sourceText.oninput = this.triggerInputListeners.bind(this);
        this.sourceText.addEventListener('keydown',this.keyHandlerSrc.bind(this),false);
        window.addEventListener('keydown',this.keyHandler.bind(this),false);
        this.mouseHandler();
        this.initDividedWindowFunctionality();
    }

    /**--------------------------------------------
     **               Panel Functionality
     *---------------------------------------------**/

    private initDividedWindowFunctionality(){
        for (const split of this.splittedWindows) {
            split.children[1].addEventListener('dragstart',(/*e:Event*/)=>{
                split.children[1].classList.add('dragging');
            })
            split.children[1].addEventListener('dragend',(e:Event)=>{
                const ev = e as DragEvent;
                split.children[1].classList.remove('dragging');
                const parent = (ev.target as HTMLElement|null)?.parentElement;
                if(parent == null)
                    return

                this.resizeSplits(parent, ev.x);
            })
        }
        window.addEventListener('dragover',(e:Event)=>{
            const dragger = document.querySelector('.dragging');
            if(dragger == null)
                return;
            const ev = e as DragEvent;
            const parent = dragger.parentElement;
            if(parent == null)
                return
            this.resizeSplits(parent, ev.x);
        })
    }

    changeLayout(refresh=false){
        // this.content
        // └   this.subPanel
        //     └   this.sourceText
        //     └   this.subPanelDivider
        //     └   this.parsedText
        if(!refresh){
            this.currentLayout++;
            this.currentLayout=this.currentLayout%3;
        }
        this.content.innerHTML = '';
        switch (this.currentLayout) {
            case 0:
                this.subPanel.innerHTML = '';
                this.subPanel.appendChild(this.sourceText);
                this.subPanel.appendChild(this.subPanelDivider);
                this.subPanel.appendChild(this.parsedText);
                this.content.appendChild(this.subPanel);
                break;
            case 1:
                this.content.appendChild(this.parsedText);
                this.parsedText.style.width = '';
                break;
            case 2:
                this.content.appendChild(this.sourceText);
                this.sourceText.style.width = '';
                break;
            
            default:
                break;
        }
    }

    private resizeSplits(splittedElement:HTMLElement, middleDivision:number){
        const splitterBounds = splittedElement.getBoundingClientRect();
        middleDivision = Math.min(splitterBounds.right, Math.max(splitterBounds.left, middleDivision));
        const leftWidth = (middleDivision-splitterBounds.left);
        (splittedElement.children[0] as HTMLElement).style.width = leftWidth.toString();
    }

    /*-----------------------------------*/
    /*-----------------------------------*/
    /*-----------------------------------*/
    
    clearPanels(){
        this.sourceText.value = this.sourceText.innerHTML = '';
        this.parsedText.innerHTML = '';
    }
    
    
    addClickListener(token:string, thisArg:unknown, cb:{ (target:HTMLElement): void;}){
        this.clickListeners.push({token:token,cb:cb,thisArg:thisArg});
    }
    addInputListener(cb:{ (): void}){
        this.inputListeners.push(cb);
    }

    triggerInputListeners(/*ev: Event|null = null*/){
        for (const listener of this.inputListeners) {
            listener.call(null);
        }
    }

    #getTextSelectionInfo(){
        const brokenText = this.sourceText.value.split("\n");
        const brokenTextSelectionCap = this.sourceText.value.substring(0, this.sourceText.selectionStart).split("\n");
        const info = {
            colNumber:brokenTextSelectionCap[brokenTextSelectionCap.length-1].length,
            lineNumber:brokenTextSelectionCap.length,
            currentLine:brokenText[brokenTextSelectionCap.length-1],
            brokenText:brokenText,
        }
        return info;
    }

    // TODO: Undo support for preventDefault text operations.
    keyHandlerSrc(e:KeyboardEvent) {
        const textarea:HTMLTextAreaElement = this.sourceText;
        let defaultPrevented = false;
        const TABKEY = "Tab";
        const SQ_BRACKET_KEY = "[";
        const SQ_BRACKET_CLOSE_KEY = "]";
        const EQUAL_KEY = "=";
        const D_KEY = "d";

        if(document.activeElement !== textarea) {
            return;
        }

        const hasStart = typeof textarea.selectionStart == 'number';
        const hasEnd = typeof textarea.selectionEnd == 'number';
        const hasStartAndEnd = hasStart && hasEnd;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const isSelecting = hasStartAndEnd && start != end

        if(e.key == TABKEY) {
            this.insertAtCursor(textarea, "\t");//sourceText.value += "\t";
            defaultPrevented = true;
        }

        function insertOutSelection(left='',right='') {
            defaultPrevented = true;
            const selectedText = textarea.value.slice(start, end);
            const before = textarea.value.slice(0, start);
            const after = textarea.value.slice(end);
            const text = before + left + selectedText + right + after;
            textarea.value = text;
            // textarea.selectionEnd = textarea.selectionStart = start+1;
        }
        
        if( (e.key == EQUAL_KEY && (isSelecting || e.ctrlKey)) ||
            (e.key == SQ_BRACKET_KEY && isSelecting)) {
            insertOutSelection('[=',']');
            textarea.selectionEnd = textarea.selectionStart = start+1;
        }else if(e.key == SQ_BRACKET_CLOSE_KEY && (isSelecting || e.ctrlKey)) {
            insertOutSelection('[',']');
            textarea.selectionEnd = textarea.selectionStart = start+1;
        }else if(e.key == SQ_BRACKET_KEY && e.ctrlKey) {
            defaultPrevented = true;
            const textInfo = this.#getTextSelectionInfo();
            textInfo.brokenText[textInfo.lineNumber-1] = '[='+textInfo.brokenText[textInfo.lineNumber-1]+']';
            textarea.value = textInfo.brokenText.join('\n');
            textarea.selectionStart = textarea.selectionEnd = start-textInfo.colNumber+1;
        }
        if(e.key == D_KEY && e.ctrlKey){
            defaultPrevented = true;
            const textInfo = this.#getTextSelectionInfo();
            textInfo.brokenText.splice(textInfo.lineNumber, 0, textInfo.currentLine);
            textarea.value = textInfo.brokenText.join('\n');
            textarea.selectionStart = textarea.selectionEnd = start;
        }

        if(defaultPrevented) { 
            e.preventDefault();
            this.triggerInputListeners();
        }
    }
    keyHandler(e:KeyboardEvent) {
        e
        // if(e.code == 'Space' && e.ctrlKey) {
        //     this.changeLayout();
        // }        
    }

    insertAtCursor(myField:HTMLTextAreaElement, myValue:string) {
        if (myField.selectionStart || myField.selectionStart == 0) { //'0'
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

    mouseHandler() {
        document.addEventListener("click", (ev: MouseEvent) =>{
            const clickedObject = ev.target as HTMLElement;
            for (const listener of this.clickListeners) {
                if(clickedObject.classList.contains(listener.token))
                    listener.cb.call(listener.thisArg,clickedObject);
            }
        });
    }

    populateSidePanelWithTreeData(fileTree: TreeNodePanel[]){
        this.treePanel.innerHTML = '';
        let lastNestedLevel = 0;
        let resultedHtmlData = ''
        const _ = '&nbsp';
        for (let i = 0; i < fileTree.length; i++) {
            let preSpace = '';   
            const nestedLevel = fileTree[i].parents.length;
            for (let ii = 0; ii < nestedLevel; ii++) {
                preSpace+=_+_+_+_;
            }
            // End of nested nodes
            if(nestedLevel<lastNestedLevel)
                resultedHtmlData +='</span></span>';
            // -------
            if(i!=0)
                resultedHtmlData+='<br>'
            resultedHtmlData +=preSpace+'<span class="toggler">'+'<span class="node-title tree-node" data-tree-index='+
                               i+'>'+_+fileTree[i].id+'</span>'+
                               '<span class="toggler-content">';
            if(fileTree[i].children.length==0)
                resultedHtmlData +='</span></span>'
            else{
                resultedHtmlData +='';
            }

            // const addAsNestedNode = fileTree[i].children.length>0;
            // let containerType = 'p';
            // if(addAsNestedNode){
            //     resultedHtmlData +='<span class="toggler">';
            //     containerType = 'span'
            // }
            // resultedHtmlData += '<'+containerType+' class="tree-node" data-tree-index='+i+'>'+preSpace+'&#x2022 '+
            //                     fileTree[i].id+'<br></'+containerType+'>';
            // if(addAsNestedNode)
            //     resultedHtmlData +='<span class="toggler-content">';
            lastNestedLevel=nestedLevel;
        }
        this.treePanel.innerHTML+=resultedHtmlData;
//return '<div class="toggler"><span class="toggler-content">'+originalContent+"</span></div>";

        // This is necessary since populating buttonTrees as the list is created causes some issues.
        // for (let i = 0; i < this.treePanel.childNodes.length; i++) {
        //     fileTree[i].buttonTree = (this.treePanel.childNodes[i] as HTMLElement);
        // }
        const children = Utils.findAllHTMLElements(this.treePanel,"tree-node",true);
        for (let i = 0; i < children.length; i++) {
            fileTree[i].buttonTree = children[i];
        }
    }
}