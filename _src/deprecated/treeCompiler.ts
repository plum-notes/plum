import {Utils} from '../misc/utils';
//import {Basket, ContainerRoles, ReturnTypes, Classifications} from './parsicon'
type Basket = any;
const ContainerRoles:any = {};

type IledgerElement = IledgerMarkStart|IledgerContent|IledgerMarkEnd;

interface IledgerContent{
    content:any;
    path:Array<number>;
}

interface IledgerMarkStart{
    mark:"start";
    path:Array<number>;
    isAnInheritedReference:boolean;
}

interface IledgerMarkEnd{
    mark:"end";
    path:Array<number>;
}

interface IexploreTreeParams{
    currentBranch?:Basket;
    astSourceLocation?:Array<number>;
    storedRunLedger?:Array<IledgerElement>;
    isAnInheritedReference?:boolean;
}

export class Compiler {
    ast:Basket;
    runtimeValuesLocation:any = {};
    /**
     *
     */
    constructor(ast:Basket) {
        this.ast = ast;
        
    }

    getBranchFromPath(path:Array<any>|string){
        try {
            if(Utils.isString(path)){
                path = this.runtimeValuesLocation[path as string]
            }
            let branch = this.ast;
            (path as Array<any>).forEach(index => {
                branch = branch.content[index];
            });
            return branch;
        } catch (error) {
            console.log("Error: "+path);
            
            return undefined;
        }
    }

    exploreTree({currentBranch                   = this.ast as Basket,
                 astSourceLocation               = [],
                 storedRunLedger:storedRunLedger = [],
                 isAnInheritedReference          = false,
                 }:IexploreTreeParams
    ):Array<IledgerElement>{

        const isCurrentBranchARef:boolean = (currentBranch.role===ContainerRoles.Reference);
        if(isCurrentBranchARef){
            const referenceBranch = this.getBranchFromPath(currentBranch.id as string);
            this.exploreTree({currentBranch:referenceBranch,
                              astSourceLocation:this.runtimeValuesLocation[currentBranch.id as string],
                              storedRunLedger:storedRunLedger,
                              isAnInheritedReference:true});
            return storedRunLedger;
        }

        //Not a referenced Branch

        const isBranchNamedAndNotRoot:boolean = (currentBranch.id != null && astSourceLocation.length!=0);
        if(isBranchNamedAndNotRoot)
            this.runtimeValuesLocation[currentBranch.id as string]=[...astSourceLocation];
            
        //Go through all content elements:
        for (let i = 0; i < currentBranch.content?.length; i++) {
            const currentPath = [...astSourceLocation, i];
            storedRunLedger.push({mark:"start", path:currentPath, isAnInheritedReference:isAnInheritedReference});
            const astContent = currentBranch.content[i];
            if(Utils.isContainer(astContent)){
                this.exploreTree({currentBranch:astContent, astSourceLocation:currentPath, storedRunLedger:storedRunLedger});
            }else{
                storedRunLedger.push({content:astContent, path:currentPath});
            }
            storedRunLedger.push({mark:"end", path:currentPath});
        }
        return storedRunLedger;
}

    run():string{
        const ledger = this.exploreTree({storedRunLedger: [{mark:"start", path:[], isAnInheritedReference:false}]});
        ledger.push({mark:"end", path:[]});
        let ledgerContent = ``;
        ledger.forEach(ledgerElement => {
            const isContent = 'content' in ledgerElement;
            //console.log(`${ledgerElement.content}:(${ledgerElement.path})`);
            //ledgerContent+=ledgerElement.content;
            if (isContent) {
                ledgerContent+=(ledgerElement as IledgerContent).content;
            }
            else{
                if((ledgerElement as any).mark == "start"){
                    //console.log((ledgerElement as IledgerMarkStart).isAReference);
                    const ledgerPath = "-"+Utils.pathToString(ledgerElement.path, "-")
                    ledgerContent += `<span ${!(ledgerElement as IledgerMarkStart).isAnInheritedReference?"id=\"plum"+ledgerPath+"\"":""} plum-container="${ledgerPath}">`
                    //ledgerContent+="<span plum-container=\""+ Utils.pathToString(ledgerElement.path, "-") +"\">";
                    //ledgerContent+="<span id=\"plum-"+ Utils.pathToString(ledgerElement.path, "-") +"\">";
                }else{
                    ledgerContent+="</span>";
                }
            }
            //ledgerContent+="[" +ledgerElement.content + "]("+ledgerElement.path +")";
        });
        //console.log(ledgerContent);
        return ledgerContent;
    }

    /**
     * Probably better to set this in a separate class
     */
    astToHTMLTree(currentBranch:Basket=this.ast, listName="plum-tree"){
        let HTMLresult = `<ul class="${listName}">`
        //let path:Array<number> = [];
        currentBranch.content?.forEach((branchSingleContent:any) => {
            if(Utils.isString(branchSingleContent)){
                HTMLresult += `<li>${branchSingleContent}</li>`;
            }else{
                HTMLresult += `<li><span class="tree-caret">${(branchSingleContent as Basket).id}</span>`;
                HTMLresult += this.astToHTMLTree((branchSingleContent as Basket), "plum-branch");
                HTMLresult += `</li>`;
            }
        });
        HTMLresult += '</ul>';
        return HTMLresult;
    }

}