@preprocessor typescript
#     nearleyc ./src/grammar.ne -o ./src/grammar.ts
#     nearley-test ./grammar.ts --input '1+2+3'
#     nearleyc grammar.ne -o grammar.js

@{%
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

%}
@lexer lexer

##########################################################
##########################################################
##########################################################

# DEBUG -> importId {%id%}   #anyCharsPDQuote{%id%} #%nonReturnChar %ghostNL {%id%}#INIT {%id%}

INIT  -> anyOperation:? {%(d)=>{
    const trueContent = (d[0]==null)?'':d[0];
    return parsicon.ContainerGenerator(
        ContainerRoles.Instantiation,
        {type:ReturnTypes.Any,
        id:parsicon.RootContainer,
        content:trueContent});
}%}


#--Fruit Baskets--#

baskets -> fruitBasket
         | fruitBasket baskets {% (d)=>{
            d[1].unshift(d[0]);
            return d[1] as Container[];
} %}

# fruitBasket ->    fruitBskRaw    gNL:*  {% (d)=>d[1]==null?d[0]:[d[0],'('+d[1].length+')'] %}
fruitBasket ->    AnyBasket      {%id%}
             |    BoolBasket     {%id%}
             |    CommentBasket  {%id%}
             |    RefBasket      {%id%}
             |    FloatBasket    {%id%}
             |    IfBasket       {%id%}
             |    LoopBasket     {%id%}
             |    CloneBasket    {%id%}
             |    AttributeBasket{%id%}
             |    LinkBasket     {%id%}
            #|    IntBasket      {%id%}
             |    %nonReturnChar fruitBasket {% (d)=>{
                        d[1].hidden = true;
                        //d[1].eatNL = true;
                        return d[1];
                  } %}

BoolBasket  -> %openBasket basketDeclaration:? inAtts:? contentBool %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
        {type:parsicon.ReturnTypes.Bool,
        id:d[1]==null?null:d[1].id,
        quickAtts:d[2],
        content:d[3].content})
}%}
FloatBasket      -> %openBasket basketDeclaration:? inAtts:? contentFloat %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
        {type:parsicon.ReturnTypes.Float,
        id:d[1]==null?null:d[1].id,
        content:d[3].content,
        quickAtts:d[2],
        wrap:d[3].wrap})
}%}
AnyBasket  -> %openBasket basketDeclaration:? inAtts:? contentAny %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        d[1]==null?parsicon.ContainerRoles.AnonInstance:d[1].type,
        {type:parsicon.ReturnTypes.Any,
        id:d[1]==null?null:d[1].id,
        content:d[3].content,
        quickAtts:d[2],
        wrap:d[3].wrap})
}%}
LinkBasket  -> %openBasket RefBasket %propEditChar anyOperation:? %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        parsicon.ContainerRoles.Link,{
            type:parsicon.ReturnTypes.Any,
            content:d[3]==null?'':d[3],
            id:d[1],
        })//wrap:d[3].wrap
}%}
RefBasket  -> %openBasket refDeclaration inAtts:? %exclamation:? %closeBasket {% (d)=>{ 
    return parsicon.ContainerGenerator(
        d[1].type,
        {type:parsicon.ReturnTypes.Any,
        quickAtts:d[2],
        id:d[1].id,
        ignoreSavedValue:d[3]!=null})
    
}%}
CommentBasket -> %openBasket %nonReturnChar anyCharsPBrack %closeBasket {% (d)=>{ 
    return parsicon.ContainerGenerator(
        ContainerRoles.Comment,
        {type:parsicon.ReturnTypes.None,
        hidden:true,
        eatNL:true,
        id:d[1].id})
}%}

IfBasket    -> %openBasket boolOperation %condition anyOperation elseBasketPart:? %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        ContainerRoles.Condition,
        {type:parsicon.ReturnTypes.Any,
        content:d[3],
        condition:d[1],
        elseContent:d[4]})
}%}
elseBasketPart  -> %condition anyOperation {%(d)=>d[1]%}

# LoopBasket   -> %openBasket boolOperation %condition %condition anyOperation %closeBasket {% (d)=>{
#     return parsicon.ContainerGenerator(
#         ContainerRoles.Loop,
#         {type:parsicon.ReturnTypes.Any,
#         content:d[4],
#         condition:d[1]})
# }%}
LoopBasket   -> %openBasket (int | boolOperation) %condition %condition anyOperation %closeBasket {% (d)=>{
    return parsicon.ContainerGenerator(
        ContainerRoles.Loop,
        {type:parsicon.ReturnTypes.Any,
        content:d[4],
        condition:Array.isArray(d[1][0])?d[1][0][0]:d[1][0]})
}%}

CloneBasket  -> %openBasket nonInstanceDeclaration contentClone  %closeBasket  {% (d)=>{
    return parsicon.ContainerGenerator(
        ContainerRoles.Clone,
        {type:parsicon.ReturnTypes.Any,
        target:d[2].content,
        id:d[1].id})
}%}

AttributeBasket  -> %openBasket nonInstanceDeclaration %colon %openPrnth compoundVarName2 fruitBasket:? %closePrnth %closeBasket   {% (d)=>{ // 
    return parsicon.ContainerGenerator(
        ContainerRoles.Attribute,
        {type:parsicon.ReturnTypes.None,
        target:d[4],
        sourceOptions:d[5],
        eatNL:true,
        id:d[1].id})
}%}

# Maybe change the name of 'basketDeclaration'
basketDeclaration -> instanceDeclaration    {%id%}
                   | nonInstanceDeclaration {%id%}
                  #| refDeclaration         {%id%}  #FIX
                  #| importedRefDeclaration {%id%}  #FIX


instanceDeclaration    -> %ast       varName2             _   {%(d)=> {return{type:parsicon.ContainerRoles.Instantiation,   id:d[1]           }}%}
                       #| %dot       int                 _   {%(d)=> {return{type:ContainerRoles.RelativeInstantiation,    id:d[1]           }}%}
                       #| %dot       varName             _   {%(d)=> {return{type:ContainerRoles.RelativeInstantiation,    id:d[1]           }}%}

nonInstanceDeclaration -> varName2                        _   {%(d)=> {return{type:parsicon.ContainerRoles.Overwrite,       id:d[0]           }}%}
                       #| basketDeclaration %dot varName _   {%(d)=> {return{type:parsicon.ContainerRoles.Overwrite,       id:d[2], from:d[0]}}%}


refDeclaration         -> varName2                        _   {%(d)=> {return{type:ContainerRoles.Reference,                id:d[0]           }}%}
                       #| basketDeclaration %dot varName  _   {%(d)=> {return{type:parsicon.ContainerRoles.Overwrite,       id:d[2], from:d[0]}}%}
                        | %dot:?   importId               _   {%(d)=> {return(d[0]==null?{type:ContainerRoles.GlobalReference,id:d[1]}:{type:ContainerRoles.GlobalRootReference,id:d[1]})}%}
                        | importIdLib                     _   {%(d)=> {return{type:ContainerRoles.LibraryReference,         id:d[0]           }}%}


# importedRefDeclaration -> importId                        _   {%id%}
#---Content---#

content -> contentBool   {%id%}
         | contentFloat  {%id%}
         | contentAny    {%id%}
         #| contentInt    {%id%}

contentFloat -> (%floatEqual | %floatEqualWrap)   mathOperation        {%(d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"float", content:d[1]}}%}
contentBool  -> (boolEqual   | %boolEqualWrap)    boolOperation        {%(d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"bool",  content:d[1]}}%}
contentAny   -> (%equal      | %equalWrap)        anyOperation:?       {%(d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"any",   content:d[1]==null?'':d[1]}}%} 
# contentClone -> %ast           %equal %openBasket %linkChar:? varName2 %closeBasket  {%(d)=>{return{type:"clone", content:(d[3]==null?d[4]:['@',d[4]])}}%}
contentClone -> %ast           %equal RefBasket {%(d)=>{return{type:"clone", content:d[2]}}%}
#contentInt   -> (%intEqual   | %intEqualWrap)     mathOperation        {%(d)=>{return{wrap:d[0][0]?.type?.endsWith("Wrap"), type:"int",   content:d[1]}}%}



#---Any Operations---#

anyOperation -> baskStr                   {%id%}
              | strBask                   {%id%}

baskStr      -> baskets strBask           {%(d)=>d[0].concat(d[1])%}
              | baskets                   {%id%}

strBask      -> strQuot baskStr           {%(d)=>[...d[0],...d[1]]%}#{%(d)=>[d[0],1].concat(d[1])%}
              | strQuot                   {%id%}


# strQuotNL    -> strQuot            {%id%}
#               | strQuot gNL:+ strQuotNL      {%(d)=>[d[0],...d[1],...d[2]]%}

strQuot      -> anyChars quotStr         {%(d)=>d[0].concat(d[1])%}
              | anyChars                 {%id%}
              | quotStr                  {%id%}

# anyCharsNL   -> anyChars gNL:+           {%(d)=>[d[0]].concat(d[1])%}
# quotStrNL    -> quotStr gNL:+            {%(d)=>[d[0]].concat(d[1])%}

quotStr      -> multiQuote strQuot       {%(d)=>[d[0]].concat(d[1])%}
              | multiQuote               {%id%}

multiQuote   -> anyCharsInQuotes:+       {%(d)=> d[1]==null?d[0][0]:[...d[0], ...d[1]]%}
# multiQuote   -> anyCharsInQuotes:+       {%(d)=>[d[0]].concat(d[1])[0].join("")%}



#---Bool Operations---# 

boolOperation -> b_boolValues                                  {%id%}
            #    | b_numValues    b_numeric     b_numValues      {% (d)=>{
               | mathOperation    b_numeric     mathOperation      {% (d)=>{
                        return parsicon.BoolGenerator(d[0],d[1],d[2]);
                    } %}
            #    | b_stringValues b_string      b_stringValues   {% (d)=>{
            #             return parsicon.BoolGenerator(d[0],d[1],d[2]);
            #         } %}
            #    | %openPrnth     boolOperation %closePrnth      {% (d)=>d[1]%}
               | boolOperation  b_bool        boolOperation    {% (d)=>{
                        return parsicon.BoolGenerator(d[0],d[1],d[2]);
                    } %}
               | %exclamation boolOperation {% (d)=>{
                        return parsicon.BoolGenerator(d[1],parsicon.BooleanOperations.Not);
                    } %}
               | boolOperation %equal %condition {% (d)=>{
                        return parsicon.BoolGenerator(d[0],parsicon.BooleanOperations.Equal,null);
                    } %}

b_boolValues    -> bool                   {%id%} | fruitBasket
# b_boolValues    -> bool             {%id%} | BoolBasket  {%id%} | RefBasket {%id%}
# b_numValues     -> realNum                    {%id%} | fruitBasket {%id%} #| RefBasket {%id%} #| IntBasket   {%id%}
# b_numValues     -> num              {%id%} | FloatBasket {%id%} | RefBasket {%id%} #| IntBasket   {%id%}
# b_stringValues  -> anyChars               {%id%} | fruitBasket {%id%} | RefBasket {%id%}
b_numeric       -> %b_moreThan            {% (d)=>parsicon.BooleanOperations.MoreThan    %}
                 | %b_moreThanEq          {% (d)=>parsicon.BooleanOperations.MoreThanEq  %}
                 | %b_lessThan            {% (d)=>parsicon.BooleanOperations.LessThan    %}
                 | %b_lessThanEq          {% (d)=>parsicon.BooleanOperations.LessThanEq  %}
                 | %b_equal               {% (d)=>parsicon.BooleanOperations.Equal       %}
                 | %b_notEqual            {% (d)=>parsicon.BooleanOperations.NotEqual    %}
b_bool          -> %b_equal               {% (d)=>parsicon.BooleanOperations.Equal       %}
                 | %b_notEqual            {% (d)=>parsicon.BooleanOperations.NotEqual    %}
                 | %ampersand %ampersand  {% (d)=>parsicon.BooleanOperations.And         %}
                 | %b_or                  {% (d)=>parsicon.BooleanOperations.Or          %}
b_string        -> %b_equal               {% (d)=>parsicon.BooleanOperations.Equal       %}
                 | %b_notEqual            {% (d)=>parsicon.BooleanOperations.NotEqual    %}
 
bool    -> b_true  {%id%}         | b_false {%id%}
b_true  -> "true"  {%(d)=>true%}  |"True"   {%(d)=>true%}  | "1" {%(d)=>true%}
b_false -> "false" {%(d)=>false%} | "False" {%(d)=>false%} | "0" {%(d)=>false%}

#---Math Operations---#

mathOperation -> mathAS {%id%}

mathAS         -> mathAS m_as mathMD {% (d)=>{
                return parsicon.MathGenerator(d[0],d[1],d[2]);
            } %} | mathMD {%id%}
mathMD         -> mathMD m_md mathClose {% (d)=>{
                return parsicon.MathGenerator(d[0],d[1],d[2]);
            } %} | mathClose {%id%}
mathClose     -> %openPrnth mathAS %closePrnth {% (d)=> d[1] %} | mathOthers {%id%}
mathOthers    -> m_otr mathAS {% (d)=>{
                return parsicon.MathGenerator(d[0],d[1]);
            } %} | mathUnit {%id%}

mathUnit -> realNum {%id%} | fruitBasket {%id%} #| FloatBasket {%id%} | RefBasket {%id%}

m_otr -> %m_sqr {%id%}                                      | %m_sin          {%d=>{return parsicon.MathOperations.sin}%}
m_md  -> %ast   {%d=>{return parsicon.MathOperations.mul}%} | %nonReturnChar  {%d=>{return parsicon.MathOperations.div}%}
m_as  -> %add   {%d=>{return parsicon.MathOperations.add}%} | %sub            {%d=>{return parsicon.MathOperations.sub}%}

#---Props---#

#properties      -> %openPrnth property %closePrnth _
#                    {%(d)=>{return{type:"props",content:d[1]}}%}
#property        -> varName propertyContent:?
#                    {%(d)=>{return[{type:"prop",id:d[0],content:d[1]}]}%}
#                 | property %comma property
#                    {%(d)=>{return d[0].concat(d[2]) }%}
#propertyContent -> %equal digsChars {%d=>d[1]%} #content {%id%}

#---Inner Attributes (this should replace properties idea)---#

inAtts  -> %openPrnth inAtt %closePrnth _    {%(d)=>d[1]%} #{{return{type:"atts",content:d[1]}}
inAtt   -> compoundVarName2 fruitBasket:?    {%(d)=>{return[{type:"att",id:d[0],sourceOptions:d[1]}]}%}
         | inAtt _ %comma _ inAtt            {%(d)=>{return d[0].concat(d[4]) }%}

#---Miscellaneous---#

importIdLib   ->  %linkChar importId {%d=>d[1]%}

importId      ->  importIds (%dot varName2):? {%d=>{
                        if(d[1]==null){
                            return [[d[0]]];
                        }
                        if(Array.isArray(d[1][1]))
                            return [d[0],...d[1][1]];
                        return [d[0],d[1][1]];
                    }%} 
importIds     ->  %linkChar nameOrBasket importIds:? {%d=>d[2]==null?[d[1]]:[d[1],...d[2]]%}

varName2        ->  compoundVarName2                {%id%}
#varName2        ->  nameOrBasket   {%id%}                | compoundVarName2                {%id%}
#varName         ->  simpleVarName  {%id%}                | compoundVarName                 {%id%}

compoundVarName2->  nameOrBasket   compoundDotExtra:? {%(d)=>d[1]==null?d[0]:[d[0], ...d[1]]%}
#compoundVarName ->  simpleVarName  %dot  (simpleVarName  | intCompound | compoundVarName ) {%(d)=> [d[0]].concat(d[2][0])%}
compoundDotExtra   ->  %dot compoundExtra  {%(d)=>d[1]%}
compoundExtra      ->  (int | nameOrBasket) compoundDotExtra:? {%(d)=>d[1]==null?d[0]:d[0].concat(d[1])%}
nameOrBasket    ->  simpleVarName  {%id%}                | fruitBasket {%id%}
simpleVarName   ->  %chars digsChars:*                                 {%(d)=> d[0]+(d[1].join(""))%}

intCompound     ->  int (%dot intCompound):? {%(d)=>{
    return d[1]==null?[d[0]]:[d[0], ...d[1][1]];
}%}

#This either uses regular characters or uses special characters but inside quotes
anyCharsAsString->  anyCharsInQuotes    {%id%}
                 |  anyChars            {%id%}
                 |  anyCharsInQuotes:+  {%(d)=> [d[0]].concat(d[1])[0].join("")%}
                #  |  anyChars 

#This takes care of special characters that have to use within quotes or other means...
anyCharsInQuotes->  %quote  allButQuotes :? %quote  {%(d)=>d[1]==null?'':d[1]%}
                 |  %dQuote allButDQuotes:? %dQuote {%(d)=>d[1]==null?'':d[1]%} 

allButQuotes  -> allButQuote :+ {%(d)=> d[1]==null?d[0]:[d[0], d[1]]%}
allButQuote   -> .              {%(d, i, reject)=>{return allBut(d,reject,['quote']);}%}
               | gNL            {%id%}
allButDQuotes -> allButDQuote:+ {%(d)=> d[1]==null?d[0]:[d[0], d[1]]%}
allButDQuote  -> .              {%(d, i, reject)=>{return allBut(d,reject,['dQuote'] );}%}
               | gNL            {%id%}

anyCharsPQuote  ->  anyCharPQuote:+     {%(d)=> d[1]==null?d[0]:[d[0], d[1]]%}
# anyCharsPQuote  ->  anyCharPQuote:+     {%(d)=> [d[0]].concat(d[1])[0].join("")%}
                 |  anyChars            {%id%}
anyCharPQuote   ->  anyCharPlusBase     {%id%}
                 |  %openBasket         {%id%}
                 |  %closeBasket        {%id%}
                 |  gNL                 {%id%}
                 |  %dQuote             {%id%}

anyCharsPDQuote ->  anyCharPDQuote:+    {%(d)=> d[1]==null?d[0]:[d[0], d[1]]%}
# anyCharsPDQuote ->  anyCharPDQuote:+    {%(d)=> [d[0]].concat(d[1])[0].join("")%}
                 |  anyChars            {%id%}
anyCharPDQuote  ->  anyCharPlusBase     {%id%}
                 |  %openBasket         {%id%}
                 |  %closeBasket        {%id%}
                 |  gNL                 {%id%}
                 |  %quote              {%id%}

anyCharsPBrack  ->  anyCharPBrack:+     {%(d)=> [d[0]].concat(d[1])[0].join("")%}
                #  |  anyChars            {%id%}
anyCharPBrack  ->  .                    {%(d, i, reject)=>{return allBut(d,reject,['openBasket','closeBasket']);}%}
                 | gNL                  {%id%}
# anyCharPBrack   ->  anyCharPlusBase     {%id%}
#                  |  %dQuote             {%id%}
#                  |  %quote              {%id%}

anyCharPlusBase ->  anyChar             {%id%}
                 |  %b_moreThan         {%id%}
                 |  %b_lessThan         {%id%}
                 |  %ast                {%id%}
                 |  %equal              {%id%}
                 |  %typeChars          {%id%}
                 |  %linkchar           {%id%}
                 |  %propEditChar       {%id%}
                 |  %openPrnth          {%id%}
                 |  %closePrnth         {%id%}
                 |  %nonReturnChar      {%id%}
                 |  %condition          {%id%}
                 |  %colon              {%id%}
                 |  %add                {%id%}
                 |  %sub                {%id%}
                 |  %exclamation        {%id%}


#anyChars is use as what is suppouse to be in a string.
anyChars  ->  anyChar:+                 {%(d)=> d[1]==null?d[0]:[...d[0],d[1]]%}#{%(d)=> [d[0]].concat(d[1])[0].join("")%} #
anyChar   ->  digsChars                 {%d=> d[0].value%}
           |  %ws                       {%d=>" "%}
        #    |  %escapes                  {%id%}
           |  NL                        {%id%}
           |  tab                       {%id%}
           |  gNL                       {%id%}#
        #    |  gTab                      {%id%}
           |  eGhNL                     {%id%}
           |  %dot                      {%d=>"."%}
           |  %comma                    {%d=>","%}
           |  %sub                      {%d=>"-"%}
           |  %add                      {%d=>"+"%}
           |  %openPrnth                {%d=>"("%}
           |  %closePrnth               {%d=>")"%}
           |  %quoteEsc                 {%d=>"'"%}
           |  %dquoteEsc                {%d=>'"'%}
        #    |  %colonEsc                 {%d=>':'%}
           |  %colon                    {%d=>':'%}
           |  %equalEsc                 {%d=>'='%}
           |  %ampersand                {%d=>ampReplace%}
           |  %semicolon                {%d=>';'%}
           |  %openBrEsc                {%d=>'['%}
           |  %closeBrEsc               {%d=>']'%}
           |  %escSlash                 {%d=>'/'%}
           |  %escBSlash                {%d=>'\\'%}
           |  %escQuestion              {%d=>'?'%}
           |  %exclamation              {%d=>'!'%}
           |  %b_moreThan               {%d=>moreTReplace%}
           |  %b_lessThan               {%d=>lessTReplace%}
digsChars ->  %chars                    {%id%}
           |  %digits                   {%id%}
realNum   ->  num                       {%id%}
           |  %sub num                  {%d=> -d[1]%}
num       ->  float                     {%id%}
           |  int                       {%id%}
float     ->  %digits %dot %digits      {%d=> parseFloat(d[0]+"."+d[2])%}
int       ->  %digits                   {%d=> parseInt(d[0])%}
eGhNL     ->  %nonReturnChar %ghostNL   {%d=>""%}  #%escapedNL
gNL       ->  %ghostNL                  {%d=>{return {classification:Classifications.NewLine}}%} #:±:
gTab      ->  %ghostTab                 {%d=>"\t"%}
NL        ->  %nl                       {%d=>"<br>"%}
tab       ->  %tab                      {%d=>"\t"%}
boolEqual ->  %ampersand %equal         {%id%}
_         ->  %ws:?                     {%(d)=> [d[0]].concat(d[1])[0]%}
__        ->  %ws:+                     {%d=>" "%}
