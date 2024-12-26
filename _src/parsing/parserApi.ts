import { Grammar, Parser }     from "nearley";
import * as grammar            from "./grammar";
import { Container }           from "./parsicon";
import { Registry }            from "./registry";
import { Compiler, }           from "./compiler";
import * as atts               from "./systemAttributes";

export class ToParser{
    parser : Parser = new Parser(Grammar.fromCompiled(grammar.default));
    ast    : Container|null;
    reg    : Registry|null;
    run    : {raw: string;result: string;};
    err    : Error|null;
    raw    : string;

    constructor(rawText = '') {
        this.parser = new Parser(Grammar.fromCompiled(grammar.default));
        this.ast = this.reg = this.err = null;
        this.raw = rawText;
        this.run = {raw:'',result:''};
    }

    compile(catchErrors = true){        
        if(!catchErrors){
            this.#parseAndCompileData();
            return true;
        }
        let success = true;
        try {
            this.#parseAndCompileData();
        } catch (error:unknown) {
            // console.log((error as Error).name);
            
            this.err = error as Error;
            success = false;
        }
        atts.cleanData();
        return success;
    }

    /**
     * 
     * @returns succeded
     */
    generateASTAndRegistry(){
        const rootContainer = this.#generateAST();
        // const traverser = new TraverserAST();
        // // eslint-disable-next-line no-debugger
        // debugger;
        // traverser.traverse(rootContainer);
        // traverse(rootContainer, {
        //     enter(container:Container){
        //         console.log('+ '+container?.id);
        //     },
        //     exit(container:Container){
        //         console.log('- '+container?.id);
        //     }
        // })
        if(rootContainer == null)
            return false;
        this.ast = rootContainer;//Utils.deepClone(rootContainer);
        this.reg = new Registry(this.ast);
        return true;
    }

    #parseAndCompileData(){

        //Generate AST and Registry
        const registryGenerated = this.generateASTAndRegistry();
        if(!registryGenerated)
            throw new Error("Unexpected end of file.");
        if(this.reg == null)
            throw new Error("Registry data not valid.");

        //Generate compiled data(run)
        this.run = new Compiler().runAsHTML(this.reg);
        // new Compiler();

        return this.run;
    }
    
    #generateAST(){
        this.parser.feed(this.raw);
        return this.parser.results[0] as Container;
    }
}
