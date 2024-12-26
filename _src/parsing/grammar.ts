// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var nonReturnChar: any;
declare var openBasket: any;
declare var closeBasket: any;
declare var propEditChar: any;
declare var exclamation: any;
declare var condition: any;
declare var colon: any;
declare var openPrnth: any;
declare var closePrnth: any;
declare var ast: any;
declare var dot: any;
declare var floatEqual: any;
declare var floatEqualWrap: any;
declare var boolEqualWrap: any;
declare var equal: any;
declare var equalWrap: any;
declare var b_moreThan: any;
declare var b_moreThanEq: any;
declare var b_lessThan: any;
declare var b_lessThanEq: any;
declare var b_equal: any;
declare var b_notEqual: any;
declare var ampersand: any;
declare var b_or: any;
declare var m_sqr: any;
declare var m_sin: any;
declare var add: any;
declare var sub: any;
declare var comma: any;
declare var linkChar: any;
declare var chars: any;
declare var quote: any;
declare var dQuote: any;
declare var typeChars: any;
declare var linkchar: any;
declare var ws: any;
declare var quoteEsc: any;
declare var dquoteEsc: any;
declare var equalEsc: any;
declare var semicolon: any;
declare var openBrEsc: any;
declare var closeBrEsc: any;
declare var escSlash: any;
declare var escBSlash: any;
declare var escQuestion: any;
declare var digits: any;
declare var ghostNL: any;
declare var ghostTab: any;
declare var nl: any;
declare var tab: any;

import * as moo from "moo";
import {Container,
 ReturnTypes,
 ContainerRoles,
 MathOperationOrNumber,
 RootContainer,
 Classifications} from './parsicon';
import * as parsicon from './parsicon';
//const moo = (typeof module === 'object' && module.exports)?require("moo"):window.moo;

const lexer = moo.compile({
    ws:                        /[ \t]/,
    chars:                     /[A-Za-zßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëíîïðñòóôõöùúûüýÿŒœŠšŸ]+/,// /[a-zA-Z_]+/,
    // a:/a/,
    digits:                    /[0-9]+/,///0|[1-9][0-9]*/
    //typeEqual:               /[&#%\$]=/,
    ampersand:                 /&/,

    m_sqr:                     /sqrt/,
    m_sin:                     /sin/,
    add:                       /\+/,
    sub:                       /\-/,
    quote:                     /'/,
    dQuote:                    /"/,
            
    //boolEqual:                 /&=/,
    b_moreThanEq:              />=/,
    b_lessThanEq:              /<=/,
    b_moreThan:                />/,
    b_lessThan:                /</,
    b_equal:                   /==/,
    b_notEqual:                /!=/,
    //b_and:                     /&&/,
    b_or:                      /\|\|/,

    //stringEqual:             /\$=/,
    ast:                       /\*/,
    floatEqual:                /#=/,
    //intEqual:                  /\.=/,
    equal:                     /=/,
    floatEqualWrap:            /#:=/,
    //intEqualWrap:              /\.:=/,
    equalWrap:                 /:=/,
    //nextProp:                  /,/,
    conditionChar:             />>/,
    loopChar:                  /<</,
    typeChars:                 /[&#%]/,
    //nonReturnChar:           /~/,
    linkChar:                  /@/,
    dot:                       /\./,
    comma:                     /,/,
    propEditChar:              /\^/,
    openPrnth:                 /\(/,
    closePrnth:                /\)/,
    openBasket:                /\[/,
    closeBasket:               /\]/,
    nonReturnChar:             /\//,

    exclamation:               /!/,
    condition:                 /\?/,
    colon:                     /:/,
    semicolon:                 /;/,

    // specials:                  /[&#%]/,// @?/\\\[\](){}

    // empty:                     /^$/,
    // escapes:                   /\\[\[\]\^\(\)\~\@]/,
    // tab:                       /\\t/,
    nl:                        /\\n/,
    quoteEsc:                  /\\'/,
    dquoteEsc:                 /\\"/,
    colonEsc:                  /\\:/,
    equalEsc:                  /\\=/,
    openBrEsc:                 /\\\[/,
    closeBrEsc:                /\\\]/,
    escSlash:                  /\\\//,
    escBSlash:                 /\\\\/,
    escQuestion:               /\\\?/,


    ghostTab:                  /\t/,
    //escapedNL:        {match:  /\/\n/, lineBreaks: true},
    ghostNL:          {match:  /\n/, lineBreaks: true},
    allButSQ:                  {match:  /[^]/, lineBreaks: true},
     //Escaped characters=>>>     [ \ ^ $ . | ? * + ( )
});

const tabReplace   = '&nbsp;&nbsp;&nbsp;&nbsp;'
const lessTReplace = '&lt'
const moreTReplace = '&gt'
const ampReplace   = '&amp'

const replaceValues=(token:{value:string,type:string})=>{
    if(token.type=='ws' && token.value=='\t')
        return tabReplace;//&#9 &emsp
    if(token.type == 'b_lessThan')
        return lessTReplace;
    if(token.type == 'b_moreThan')
        return moreTReplace;
    if(token.type == "typeChars" && token.value == "&")
        return ampReplace;
    return token.value;
}

const allBut = (d:any[], reject:unknown, exceptionTypes:string[]):unknown => {
    // const exceptionType = isDouble?'dQuote':'quote';
    const token = d[0];
    for (const exceptionType of exceptionTypes) {
        if(token.type==exceptionType){
            return reject;
        }
    }
    return replaceValues(d[0]);
};


interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "INIT$ebnf$1", "symbols": ["anyOperation"], "postprocess": id},
    {"name": "INIT$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "INIT", "symbols": ["INIT$ebnf$1"], "postprocess": (d)=>{
            const trueContent = (d[0]==null)?'':d[0];
            return parsicon.ContainerGenerator(
                ContainerRoles.Instantiation,
                {type:ReturnTypes.Any,
                id:parsicon.RootContainer,
                content:trueContent});
        }},
    {"name": "baskets", "symbols": ["fruitBasket"]},
    {"name": "baskets", "symbols": ["fruitBasket", "baskets"], "postprocess":  (d)=>{
                    d[1].unshift(d[0]);
                    return d[1] as Container[];
        } },
    {"name": "fruitBasket", "symbols": ["AnyBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["BoolBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["CommentBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["RefBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["FloatBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["IfBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["LoopBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["CloneBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["AttributeBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": ["LinkBasket"], "postprocess": id},
    {"name": "fruitBasket", "symbols": [(lexer.has("nonReturnChar") ? {type: "nonReturnChar"} : nonReturnChar), "fruitBasket"], "postprocess":  (d)=>{
              d[1].hidden = true;
              //d[1].eatNL = true;
              return d[1];
        } },
    {"name": "BoolBasket$ebnf$1", "symbols": ["basketDeclaration"], "postprocess": id},
    {"name": "BoolBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "BoolBasket$ebnf$2", "symbols": ["inAtts"], "postprocess": id},
    {"name": "BoolBasket$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "BoolBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "BoolBasket$ebnf$1", "BoolBasket$ebnf$2", "contentBool", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
                {type:parsicon.ReturnTypes.Bool,
                id:d[1]==null?null:d[1].id,
                quickAtts:d[2],
                content:d[3].content})
        }},
    {"name": "FloatBasket$ebnf$1", "symbols": ["basketDeclaration"], "postprocess": id},
    {"name": "FloatBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "FloatBasket$ebnf$2", "symbols": ["inAtts"], "postprocess": id},
    {"name": "FloatBasket$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "FloatBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "FloatBasket$ebnf$1", "FloatBasket$ebnf$2", "contentFloat", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
                {type:parsicon.ReturnTypes.Float,
                id:d[1]==null?null:d[1].id,
                content:d[3].content,
                quickAtts:d[2],
                wrap:d[3].wrap})
        }},
    {"name": "AnyBasket$ebnf$1", "symbols": ["basketDeclaration"], "postprocess": id},
    {"name": "AnyBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "AnyBasket$ebnf$2", "symbols": ["inAtts"], "postprocess": id},
    {"name": "AnyBasket$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "AnyBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "AnyBasket$ebnf$1", "AnyBasket$ebnf$2", "contentAny", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
                {type:parsicon.ReturnTypes.Any,
                id:d[1]==null?null:d[1].id,
                content:d[3].content,
                quickAtts:d[2],
                wrap:d[3].wrap})
        }},
    {"name": "LinkBasket$ebnf$1", "symbols": ["anyOperation"], "postprocess": id},
    {"name": "LinkBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "LinkBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "RefBasket", (lexer.has("propEditChar") ? {type: "propEditChar"} : propEditChar), "LinkBasket$ebnf$1", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                parsicon.ContainerRoles.Link,{
                    type:parsicon.ReturnTypes.Any,
                    content:d[3]==null?'':d[3],
                    id:d[1],
                })//wrap:d[3].wrap
        }},
    {"name": "RefBasket$ebnf$1", "symbols": ["inAtts"], "postprocess": id},
    {"name": "RefBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "RefBasket$ebnf$2", "symbols": [(lexer.has("exclamation") ? {type: "exclamation"} : exclamation)], "postprocess": id},
    {"name": "RefBasket$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "RefBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "refDeclaration", "RefBasket$ebnf$1", "RefBasket$ebnf$2", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{ 
            return parsicon.ContainerGenerator(
                d[1].type,
                {type:parsicon.ReturnTypes.Any,
                quickAtts:d[2],
                id:d[1].id,
                ignoreSavedValue:d[3]!=null})
            
        }},
    {"name": "CommentBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), (lexer.has("nonReturnChar") ? {type: "nonReturnChar"} : nonReturnChar), "anyCharsPBrack", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{ 
            return parsicon.ContainerGenerator(
                ContainerRoles.Comment,
                {type:parsicon.ReturnTypes.None,
                hidden:true,
                eatNL:true,
                id:d[1].id})
        }},
    {"name": "IfBasket$ebnf$1", "symbols": ["elseBasketPart"], "postprocess": id},
    {"name": "IfBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "IfBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "boolOperation", (lexer.has("condition") ? {type: "condition"} : condition), "anyOperation", "IfBasket$ebnf$1", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                ContainerRoles.Condition,
                {type:parsicon.ReturnTypes.Any,
                content:d[3],
                condition:d[1],
                elseContent:d[4]})
        }},
    {"name": "elseBasketPart", "symbols": [(lexer.has("condition") ? {type: "condition"} : condition), "anyOperation"], "postprocess": (d)=>d[1]},
    {"name": "LoopBasket$subexpression$1", "symbols": ["int"]},
    {"name": "LoopBasket$subexpression$1", "symbols": ["boolOperation"]},
    {"name": "LoopBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "LoopBasket$subexpression$1", (lexer.has("condition") ? {type: "condition"} : condition), (lexer.has("condition") ? {type: "condition"} : condition), "anyOperation", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                ContainerRoles.Loop,
                {type:parsicon.ReturnTypes.Any,
                content:d[4],
                condition:Array.isArray(d[1][0])?d[1][0][0]:d[1][0]})
        }},
    {"name": "CloneBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "nonInstanceDeclaration", "contentClone", (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{
            return parsicon.ContainerGenerator(
                ContainerRoles.Clone,
                {type:parsicon.ReturnTypes.Any,
                target:d[2].content,
                id:d[1].id})
        }},
    {"name": "AttributeBasket$ebnf$1", "symbols": ["fruitBasket"], "postprocess": id},
    {"name": "AttributeBasket$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "AttributeBasket", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket), "nonInstanceDeclaration", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("openPrnth") ? {type: "openPrnth"} : openPrnth), "compoundVarName2", "AttributeBasket$ebnf$1", (lexer.has("closePrnth") ? {type: "closePrnth"} : closePrnth), (lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess":  (d)=>{ // 
            return parsicon.ContainerGenerator(
                ContainerRoles.Attribute,
                {type:parsicon.ReturnTypes.None,
                target:d[4],
                sourceOptions:d[5],
                eatNL:true,
                id:d[1].id})
        }},
    {"name": "basketDeclaration", "symbols": ["instanceDeclaration"], "postprocess": id},
    {"name": "basketDeclaration", "symbols": ["nonInstanceDeclaration"], "postprocess": id},
    {"name": "instanceDeclaration", "symbols": [(lexer.has("ast") ? {type: "ast"} : ast), "varName2", "_"], "postprocess": (d)=> {return{type:parsicon.ContainerRoles.Instantiation,   id:d[1]           }}},
    {"name": "nonInstanceDeclaration", "symbols": ["varName2", "_"], "postprocess": (d)=> {return{type:parsicon.ContainerRoles.Overwrite,       id:d[0]           }}},
    {"name": "refDeclaration", "symbols": ["varName2", "_"], "postprocess": (d)=> {return{type:ContainerRoles.Reference,                id:d[0]           }}},
    {"name": "refDeclaration$ebnf$1", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot)], "postprocess": id},
    {"name": "refDeclaration$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "refDeclaration", "symbols": ["refDeclaration$ebnf$1", "importId", "_"], "postprocess": (d)=> {return(d[0]==null?{type:ContainerRoles.GlobalReference,id:d[1]}:{type:ContainerRoles.GlobalRootReference,id:d[1]})}},
    {"name": "refDeclaration", "symbols": ["importIdLib", "_"], "postprocess": (d)=> {return{type:ContainerRoles.LibraryReference,         id:d[0]           }}},
    {"name": "content", "symbols": ["contentBool"], "postprocess": id},
    {"name": "content", "symbols": ["contentFloat"], "postprocess": id},
    {"name": "content", "symbols": ["contentAny"], "postprocess": id},
    {"name": "contentFloat$subexpression$1", "symbols": [(lexer.has("floatEqual") ? {type: "floatEqual"} : floatEqual)]},
    {"name": "contentFloat$subexpression$1", "symbols": [(lexer.has("floatEqualWrap") ? {type: "floatEqualWrap"} : floatEqualWrap)]},
    {"name": "contentFloat", "symbols": ["contentFloat$subexpression$1", "mathOperation"], "postprocess": (d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"float", content:d[1]}}},
    {"name": "contentBool$subexpression$1", "symbols": ["boolEqual"]},
    {"name": "contentBool$subexpression$1", "symbols": [(lexer.has("boolEqualWrap") ? {type: "boolEqualWrap"} : boolEqualWrap)]},
    {"name": "contentBool", "symbols": ["contentBool$subexpression$1", "boolOperation"], "postprocess": (d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"bool",  content:d[1]}}},
    {"name": "contentAny$subexpression$1", "symbols": [(lexer.has("equal") ? {type: "equal"} : equal)]},
    {"name": "contentAny$subexpression$1", "symbols": [(lexer.has("equalWrap") ? {type: "equalWrap"} : equalWrap)]},
    {"name": "contentAny$ebnf$1", "symbols": ["anyOperation"], "postprocess": id},
    {"name": "contentAny$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "contentAny", "symbols": ["contentAny$subexpression$1", "contentAny$ebnf$1"], "postprocess": (d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"any",   content:d[1]==null?'':d[1]}}},
    {"name": "contentClone", "symbols": [(lexer.has("ast") ? {type: "ast"} : ast), (lexer.has("equal") ? {type: "equal"} : equal), "RefBasket"], "postprocess": (d)=>{return{type:"clone", content:d[2]}}},
    {"name": "anyOperation", "symbols": ["baskStr"], "postprocess": id},
    {"name": "anyOperation", "symbols": ["strBask"], "postprocess": id},
    {"name": "baskStr", "symbols": ["baskets", "strBask"], "postprocess": (d)=>d[0].concat(d[1])},
    {"name": "baskStr", "symbols": ["baskets"], "postprocess": id},
    {"name": "strBask", "symbols": ["strQuot", "baskStr"], "postprocess": (d)=>[...d[0],...d[1]]},
    {"name": "strBask", "symbols": ["strQuot"], "postprocess": id},
    {"name": "strQuot", "symbols": ["anyChars", "quotStr"], "postprocess": (d)=>d[0].concat(d[1])},
    {"name": "strQuot", "symbols": ["anyChars"], "postprocess": id},
    {"name": "strQuot", "symbols": ["quotStr"], "postprocess": id},
    {"name": "quotStr", "symbols": ["multiQuote", "strQuot"], "postprocess": (d)=>[d[0]].concat(d[1])},
    {"name": "quotStr", "symbols": ["multiQuote"], "postprocess": id},
    {"name": "multiQuote$ebnf$1", "symbols": ["anyCharsInQuotes"]},
    {"name": "multiQuote$ebnf$1", "symbols": ["multiQuote$ebnf$1", "anyCharsInQuotes"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "multiQuote", "symbols": ["multiQuote$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0][0]:[...d[0], ...d[1]]},
    {"name": "boolOperation", "symbols": ["b_boolValues"], "postprocess": id},
    {"name": "boolOperation", "symbols": ["mathOperation", "b_numeric", "mathOperation"], "postprocess":  (d)=>{
            return parsicon.BoolGenerator(d[0],d[1],d[2]);
        } },
    {"name": "boolOperation", "symbols": ["boolOperation", "b_bool", "boolOperation"], "postprocess":  (d)=>{
            return parsicon.BoolGenerator(d[0],d[1],d[2]);
        } },
    {"name": "boolOperation", "symbols": [(lexer.has("exclamation") ? {type: "exclamation"} : exclamation), "boolOperation"], "postprocess":  (d)=>{
            return parsicon.BoolGenerator(d[1],parsicon.BooleanOperations.Not);
        } },
    {"name": "boolOperation", "symbols": ["boolOperation", (lexer.has("equal") ? {type: "equal"} : equal), (lexer.has("condition") ? {type: "condition"} : condition)], "postprocess":  (d)=>{
            return parsicon.BoolGenerator(d[0],parsicon.BooleanOperations.Equal,null);
        } },
    {"name": "b_boolValues", "symbols": ["bool"], "postprocess": id},
    {"name": "b_boolValues", "symbols": ["fruitBasket"]},
    {"name": "b_numeric", "symbols": [(lexer.has("b_moreThan") ? {type: "b_moreThan"} : b_moreThan)], "postprocess": (d)=>parsicon.BooleanOperations.MoreThan},
    {"name": "b_numeric", "symbols": [(lexer.has("b_moreThanEq") ? {type: "b_moreThanEq"} : b_moreThanEq)], "postprocess": (d)=>parsicon.BooleanOperations.MoreThanEq},
    {"name": "b_numeric", "symbols": [(lexer.has("b_lessThan") ? {type: "b_lessThan"} : b_lessThan)], "postprocess": (d)=>parsicon.BooleanOperations.LessThan},
    {"name": "b_numeric", "symbols": [(lexer.has("b_lessThanEq") ? {type: "b_lessThanEq"} : b_lessThanEq)], "postprocess": (d)=>parsicon.BooleanOperations.LessThanEq},
    {"name": "b_numeric", "symbols": [(lexer.has("b_equal") ? {type: "b_equal"} : b_equal)], "postprocess": (d)=>parsicon.BooleanOperations.Equal},
    {"name": "b_numeric", "symbols": [(lexer.has("b_notEqual") ? {type: "b_notEqual"} : b_notEqual)], "postprocess": (d)=>parsicon.BooleanOperations.NotEqual},
    {"name": "b_bool", "symbols": [(lexer.has("b_equal") ? {type: "b_equal"} : b_equal)], "postprocess": (d)=>parsicon.BooleanOperations.Equal},
    {"name": "b_bool", "symbols": [(lexer.has("b_notEqual") ? {type: "b_notEqual"} : b_notEqual)], "postprocess": (d)=>parsicon.BooleanOperations.NotEqual},
    {"name": "b_bool", "symbols": [(lexer.has("ampersand") ? {type: "ampersand"} : ampersand), (lexer.has("ampersand") ? {type: "ampersand"} : ampersand)], "postprocess": (d)=>parsicon.BooleanOperations.And},
    {"name": "b_bool", "symbols": [(lexer.has("b_or") ? {type: "b_or"} : b_or)], "postprocess": (d)=>parsicon.BooleanOperations.Or},
    {"name": "b_string", "symbols": [(lexer.has("b_equal") ? {type: "b_equal"} : b_equal)], "postprocess": (d)=>parsicon.BooleanOperations.Equal},
    {"name": "b_string", "symbols": [(lexer.has("b_notEqual") ? {type: "b_notEqual"} : b_notEqual)], "postprocess": (d)=>parsicon.BooleanOperations.NotEqual},
    {"name": "bool", "symbols": ["b_true"], "postprocess": id},
    {"name": "bool", "symbols": ["b_false"], "postprocess": id},
    {"name": "b_true", "symbols": [{"literal":"true"}], "postprocess": (d)=>true},
    {"name": "b_true", "symbols": [{"literal":"True"}], "postprocess": (d)=>true},
    {"name": "b_true", "symbols": [{"literal":"1"}], "postprocess": (d)=>true},
    {"name": "b_false", "symbols": [{"literal":"false"}], "postprocess": (d)=>false},
    {"name": "b_false", "symbols": [{"literal":"False"}], "postprocess": (d)=>false},
    {"name": "b_false", "symbols": [{"literal":"0"}], "postprocess": (d)=>false},
    {"name": "mathOperation", "symbols": ["mathAS"], "postprocess": id},
    {"name": "mathAS", "symbols": ["mathAS", "m_as", "mathMD"], "postprocess":  (d)=>{
            return parsicon.MathGenerator(d[0],d[1],d[2]);
        } },
    {"name": "mathAS", "symbols": ["mathMD"], "postprocess": id},
    {"name": "mathMD", "symbols": ["mathMD", "m_md", "mathClose"], "postprocess":  (d)=>{
            return parsicon.MathGenerator(d[0],d[1],d[2]);
        } },
    {"name": "mathMD", "symbols": ["mathClose"], "postprocess": id},
    {"name": "mathClose", "symbols": [(lexer.has("openPrnth") ? {type: "openPrnth"} : openPrnth), "mathAS", (lexer.has("closePrnth") ? {type: "closePrnth"} : closePrnth)], "postprocess": (d)=> d[1]},
    {"name": "mathClose", "symbols": ["mathOthers"], "postprocess": id},
    {"name": "mathOthers", "symbols": ["m_otr", "mathAS"], "postprocess":  (d)=>{
            return parsicon.MathGenerator(d[0],d[1]);
        } },
    {"name": "mathOthers", "symbols": ["mathUnit"], "postprocess": id},
    {"name": "mathUnit", "symbols": ["realNum"], "postprocess": id},
    {"name": "mathUnit", "symbols": ["fruitBasket"], "postprocess": id},
    {"name": "m_otr", "symbols": [(lexer.has("m_sqr") ? {type: "m_sqr"} : m_sqr)], "postprocess": id},
    {"name": "m_otr", "symbols": [(lexer.has("m_sin") ? {type: "m_sin"} : m_sin)], "postprocess": d=>{return parsicon.MathOperations.sin}},
    {"name": "m_md", "symbols": [(lexer.has("ast") ? {type: "ast"} : ast)], "postprocess": d=>{return parsicon.MathOperations.mul}},
    {"name": "m_md", "symbols": [(lexer.has("nonReturnChar") ? {type: "nonReturnChar"} : nonReturnChar)], "postprocess": d=>{return parsicon.MathOperations.div}},
    {"name": "m_as", "symbols": [(lexer.has("add") ? {type: "add"} : add)], "postprocess": d=>{return parsicon.MathOperations.add}},
    {"name": "m_as", "symbols": [(lexer.has("sub") ? {type: "sub"} : sub)], "postprocess": d=>{return parsicon.MathOperations.sub}},
    {"name": "inAtts", "symbols": [(lexer.has("openPrnth") ? {type: "openPrnth"} : openPrnth), "inAtt", (lexer.has("closePrnth") ? {type: "closePrnth"} : closePrnth), "_"], "postprocess": (d)=>d[1]},
    {"name": "inAtt$ebnf$1", "symbols": ["fruitBasket"], "postprocess": id},
    {"name": "inAtt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "inAtt", "symbols": ["compoundVarName2", "inAtt$ebnf$1"], "postprocess": (d)=>{return[{type:"att",id:d[0],sourceOptions:d[1]}]}},
    {"name": "inAtt", "symbols": ["inAtt", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "inAtt"], "postprocess": (d)=>{return d[0].concat(d[4]) }},
    {"name": "importIdLib", "symbols": [(lexer.has("linkChar") ? {type: "linkChar"} : linkChar), "importId"], "postprocess": d=>d[1]},
    {"name": "importId$ebnf$1$subexpression$1", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot), "varName2"]},
    {"name": "importId$ebnf$1", "symbols": ["importId$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "importId$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "importId", "symbols": ["importIds", "importId$ebnf$1"], "postprocess": d=>{
            if(d[1]==null){
                return [[d[0]]];
            }
            if(Array.isArray(d[1][1]))
                return [d[0],...d[1][1]];
            return [d[0],d[1][1]];
        }},
    {"name": "importIds$ebnf$1", "symbols": ["importIds"], "postprocess": id},
    {"name": "importIds$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "importIds", "symbols": [(lexer.has("linkChar") ? {type: "linkChar"} : linkChar), "nameOrBasket", "importIds$ebnf$1"], "postprocess": d=>d[2]==null?[d[1]]:[d[1],...d[2]]},
    {"name": "varName2", "symbols": ["compoundVarName2"], "postprocess": id},
    {"name": "compoundVarName2$ebnf$1", "symbols": ["compoundDotExtra"], "postprocess": id},
    {"name": "compoundVarName2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "compoundVarName2", "symbols": ["nameOrBasket", "compoundVarName2$ebnf$1"], "postprocess": (d)=>d[1]==null?d[0]:[d[0], ...d[1]]},
    {"name": "compoundDotExtra", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot), "compoundExtra"], "postprocess": (d)=>d[1]},
    {"name": "compoundExtra$subexpression$1", "symbols": ["int"]},
    {"name": "compoundExtra$subexpression$1", "symbols": ["nameOrBasket"]},
    {"name": "compoundExtra$ebnf$1", "symbols": ["compoundDotExtra"], "postprocess": id},
    {"name": "compoundExtra$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "compoundExtra", "symbols": ["compoundExtra$subexpression$1", "compoundExtra$ebnf$1"], "postprocess": (d)=>d[1]==null?d[0]:d[0].concat(d[1])},
    {"name": "nameOrBasket", "symbols": ["simpleVarName"], "postprocess": id},
    {"name": "nameOrBasket", "symbols": ["fruitBasket"], "postprocess": id},
    {"name": "simpleVarName$ebnf$1", "symbols": []},
    {"name": "simpleVarName$ebnf$1", "symbols": ["simpleVarName$ebnf$1", "digsChars"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "simpleVarName", "symbols": [(lexer.has("chars") ? {type: "chars"} : chars), "simpleVarName$ebnf$1"], "postprocess": (d)=> d[0]+(d[1].join(""))},
    {"name": "intCompound$ebnf$1$subexpression$1", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot), "intCompound"]},
    {"name": "intCompound$ebnf$1", "symbols": ["intCompound$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "intCompound$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "intCompound", "symbols": ["int", "intCompound$ebnf$1"], "postprocess": (d)=>{
            return d[1]==null?[d[0]]:[d[0], ...d[1][1]];
        }},
    {"name": "anyCharsAsString", "symbols": ["anyCharsInQuotes"], "postprocess": id},
    {"name": "anyCharsAsString", "symbols": ["anyChars"], "postprocess": id},
    {"name": "anyCharsAsString$ebnf$1", "symbols": ["anyCharsInQuotes"]},
    {"name": "anyCharsAsString$ebnf$1", "symbols": ["anyCharsAsString$ebnf$1", "anyCharsInQuotes"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyCharsAsString", "symbols": ["anyCharsAsString$ebnf$1"], "postprocess": (d)=> [d[0]].concat(d[1])[0].join("")},
    {"name": "anyCharsInQuotes$ebnf$1", "symbols": ["allButQuotes"], "postprocess": id},
    {"name": "anyCharsInQuotes$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "anyCharsInQuotes", "symbols": [(lexer.has("quote") ? {type: "quote"} : quote), "anyCharsInQuotes$ebnf$1", (lexer.has("quote") ? {type: "quote"} : quote)], "postprocess": (d)=>d[1]==null?'':d[1]},
    {"name": "anyCharsInQuotes$ebnf$2", "symbols": ["allButDQuotes"], "postprocess": id},
    {"name": "anyCharsInQuotes$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "anyCharsInQuotes", "symbols": [(lexer.has("dQuote") ? {type: "dQuote"} : dQuote), "anyCharsInQuotes$ebnf$2", (lexer.has("dQuote") ? {type: "dQuote"} : dQuote)], "postprocess": (d)=>d[1]==null?'':d[1]},
    {"name": "allButQuotes$ebnf$1", "symbols": ["allButQuote"]},
    {"name": "allButQuotes$ebnf$1", "symbols": ["allButQuotes$ebnf$1", "allButQuote"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "allButQuotes", "symbols": ["allButQuotes$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0]:[d[0], d[1]]},
    {"name": "allButQuote", "symbols": [/./], "postprocess": (d, i, reject)=>{return allBut(d,reject,['quote']);}},
    {"name": "allButQuote", "symbols": ["gNL"], "postprocess": id},
    {"name": "allButDQuotes$ebnf$1", "symbols": ["allButDQuote"]},
    {"name": "allButDQuotes$ebnf$1", "symbols": ["allButDQuotes$ebnf$1", "allButDQuote"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "allButDQuotes", "symbols": ["allButDQuotes$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0]:[d[0], d[1]]},
    {"name": "allButDQuote", "symbols": [/./], "postprocess": (d, i, reject)=>{return allBut(d,reject,['dQuote'] );}},
    {"name": "allButDQuote", "symbols": ["gNL"], "postprocess": id},
    {"name": "anyCharsPQuote$ebnf$1", "symbols": ["anyCharPQuote"]},
    {"name": "anyCharsPQuote$ebnf$1", "symbols": ["anyCharsPQuote$ebnf$1", "anyCharPQuote"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyCharsPQuote", "symbols": ["anyCharsPQuote$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0]:[d[0], d[1]]},
    {"name": "anyCharsPQuote", "symbols": ["anyChars"], "postprocess": id},
    {"name": "anyCharPQuote", "symbols": ["anyCharPlusBase"], "postprocess": id},
    {"name": "anyCharPQuote", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket)], "postprocess": id},
    {"name": "anyCharPQuote", "symbols": [(lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess": id},
    {"name": "anyCharPQuote", "symbols": ["gNL"], "postprocess": id},
    {"name": "anyCharPQuote", "symbols": [(lexer.has("dQuote") ? {type: "dQuote"} : dQuote)], "postprocess": id},
    {"name": "anyCharsPDQuote$ebnf$1", "symbols": ["anyCharPDQuote"]},
    {"name": "anyCharsPDQuote$ebnf$1", "symbols": ["anyCharsPDQuote$ebnf$1", "anyCharPDQuote"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyCharsPDQuote", "symbols": ["anyCharsPDQuote$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0]:[d[0], d[1]]},
    {"name": "anyCharsPDQuote", "symbols": ["anyChars"], "postprocess": id},
    {"name": "anyCharPDQuote", "symbols": ["anyCharPlusBase"], "postprocess": id},
    {"name": "anyCharPDQuote", "symbols": [(lexer.has("openBasket") ? {type: "openBasket"} : openBasket)], "postprocess": id},
    {"name": "anyCharPDQuote", "symbols": [(lexer.has("closeBasket") ? {type: "closeBasket"} : closeBasket)], "postprocess": id},
    {"name": "anyCharPDQuote", "symbols": ["gNL"], "postprocess": id},
    {"name": "anyCharPDQuote", "symbols": [(lexer.has("quote") ? {type: "quote"} : quote)], "postprocess": id},
    {"name": "anyCharsPBrack$ebnf$1", "symbols": ["anyCharPBrack"]},
    {"name": "anyCharsPBrack$ebnf$1", "symbols": ["anyCharsPBrack$ebnf$1", "anyCharPBrack"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyCharsPBrack", "symbols": ["anyCharsPBrack$ebnf$1"], "postprocess": (d)=> [d[0]].concat(d[1])[0].join("")},
    {"name": "anyCharPBrack", "symbols": [/./], "postprocess": (d, i, reject)=>{return allBut(d,reject,['openBasket','closeBasket']);}},
    {"name": "anyCharPBrack", "symbols": ["gNL"], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": ["anyChar"], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("b_moreThan") ? {type: "b_moreThan"} : b_moreThan)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("b_lessThan") ? {type: "b_lessThan"} : b_lessThan)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("ast") ? {type: "ast"} : ast)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("equal") ? {type: "equal"} : equal)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("typeChars") ? {type: "typeChars"} : typeChars)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("linkchar") ? {type: "linkchar"} : linkchar)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("propEditChar") ? {type: "propEditChar"} : propEditChar)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("openPrnth") ? {type: "openPrnth"} : openPrnth)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("closePrnth") ? {type: "closePrnth"} : closePrnth)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("nonReturnChar") ? {type: "nonReturnChar"} : nonReturnChar)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("condition") ? {type: "condition"} : condition)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("colon") ? {type: "colon"} : colon)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("add") ? {type: "add"} : add)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("sub") ? {type: "sub"} : sub)], "postprocess": id},
    {"name": "anyCharPlusBase", "symbols": [(lexer.has("exclamation") ? {type: "exclamation"} : exclamation)], "postprocess": id},
    {"name": "anyChars$ebnf$1", "symbols": ["anyChar"]},
    {"name": "anyChars$ebnf$1", "symbols": ["anyChars$ebnf$1", "anyChar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyChars", "symbols": ["anyChars$ebnf$1"], "postprocess": (d)=> d[1]==null?d[0]:[...d[0],d[1]]},
    {"name": "anyChar", "symbols": ["digsChars"], "postprocess": d=> d[0].value},
    {"name": "anyChar", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": d=>" "},
    {"name": "anyChar", "symbols": ["NL"], "postprocess": id},
    {"name": "anyChar", "symbols": ["tab"], "postprocess": id},
    {"name": "anyChar", "symbols": ["gNL"], "postprocess": id},
    {"name": "anyChar", "symbols": ["eGhNL"], "postprocess": id},
    {"name": "anyChar", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot)], "postprocess": d=>"."},
    {"name": "anyChar", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": d=>","},
    {"name": "anyChar", "symbols": [(lexer.has("sub") ? {type: "sub"} : sub)], "postprocess": d=>"-"},
    {"name": "anyChar", "symbols": [(lexer.has("add") ? {type: "add"} : add)], "postprocess": d=>"+"},
    {"name": "anyChar", "symbols": [(lexer.has("openPrnth") ? {type: "openPrnth"} : openPrnth)], "postprocess": d=>"("},
    {"name": "anyChar", "symbols": [(lexer.has("closePrnth") ? {type: "closePrnth"} : closePrnth)], "postprocess": d=>")"},
    {"name": "anyChar", "symbols": [(lexer.has("quoteEsc") ? {type: "quoteEsc"} : quoteEsc)], "postprocess": d=>"'"},
    {"name": "anyChar", "symbols": [(lexer.has("dquoteEsc") ? {type: "dquoteEsc"} : dquoteEsc)], "postprocess": d=>'"'},
    {"name": "anyChar", "symbols": [(lexer.has("colon") ? {type: "colon"} : colon)], "postprocess": d=>':'},
    {"name": "anyChar", "symbols": [(lexer.has("equalEsc") ? {type: "equalEsc"} : equalEsc)], "postprocess": d=>'='},
    {"name": "anyChar", "symbols": [(lexer.has("ampersand") ? {type: "ampersand"} : ampersand)], "postprocess": d=>ampReplace},
    {"name": "anyChar", "symbols": [(lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": d=>';'},
    {"name": "anyChar", "symbols": [(lexer.has("openBrEsc") ? {type: "openBrEsc"} : openBrEsc)], "postprocess": d=>'['},
    {"name": "anyChar", "symbols": [(lexer.has("closeBrEsc") ? {type: "closeBrEsc"} : closeBrEsc)], "postprocess": d=>']'},
    {"name": "anyChar", "symbols": [(lexer.has("escSlash") ? {type: "escSlash"} : escSlash)], "postprocess": d=>'/'},
    {"name": "anyChar", "symbols": [(lexer.has("escBSlash") ? {type: "escBSlash"} : escBSlash)], "postprocess": d=>'\\'},
    {"name": "anyChar", "symbols": [(lexer.has("escQuestion") ? {type: "escQuestion"} : escQuestion)], "postprocess": d=>'?'},
    {"name": "anyChar", "symbols": [(lexer.has("exclamation") ? {type: "exclamation"} : exclamation)], "postprocess": d=>'!'},
    {"name": "anyChar", "symbols": [(lexer.has("b_moreThan") ? {type: "b_moreThan"} : b_moreThan)], "postprocess": d=>moreTReplace},
    {"name": "anyChar", "symbols": [(lexer.has("b_lessThan") ? {type: "b_lessThan"} : b_lessThan)], "postprocess": d=>lessTReplace},
    {"name": "digsChars", "symbols": [(lexer.has("chars") ? {type: "chars"} : chars)], "postprocess": id},
    {"name": "digsChars", "symbols": [(lexer.has("digits") ? {type: "digits"} : digits)], "postprocess": id},
    {"name": "realNum", "symbols": ["num"], "postprocess": id},
    {"name": "realNum", "symbols": [(lexer.has("sub") ? {type: "sub"} : sub), "num"], "postprocess": d=> -d[1]},
    {"name": "num", "symbols": ["float"], "postprocess": id},
    {"name": "num", "symbols": ["int"], "postprocess": id},
    {"name": "float", "symbols": [(lexer.has("digits") ? {type: "digits"} : digits), (lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("digits") ? {type: "digits"} : digits)], "postprocess": d=> parseFloat(d[0]+"."+d[2])},
    {"name": "int", "symbols": [(lexer.has("digits") ? {type: "digits"} : digits)], "postprocess": d=> parseInt(d[0])},
    {"name": "eGhNL", "symbols": [(lexer.has("nonReturnChar") ? {type: "nonReturnChar"} : nonReturnChar), (lexer.has("ghostNL") ? {type: "ghostNL"} : ghostNL)], "postprocess": d=>""},
    {"name": "gNL", "symbols": [(lexer.has("ghostNL") ? {type: "ghostNL"} : ghostNL)], "postprocess": d=>{return {classification:Classifications.NewLine}}},
    {"name": "gTab", "symbols": [(lexer.has("ghostTab") ? {type: "ghostTab"} : ghostTab)], "postprocess": d=>"\t"},
    {"name": "NL", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": d=>"<br>"},
    {"name": "tab", "symbols": [(lexer.has("tab") ? {type: "tab"} : tab)], "postprocess": d=>"\t"},
    {"name": "boolEqual", "symbols": [(lexer.has("ampersand") ? {type: "ampersand"} : ampersand), (lexer.has("equal") ? {type: "equal"} : equal)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": (d)=> [d[0]].concat(d[1])[0]},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": d=>" "}
  ],
  ParserStart: "INIT",
};

export default grammar;
