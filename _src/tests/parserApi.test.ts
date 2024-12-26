import { ToParser } from "../parsing/parserApi"

type TestObject  = {in:string, out:string, description:string};
type TestObjects = TestObject[];
const parsingTests:TestObjects = [];

parsingTests.push({
    description : `Simple test.`,
    in : `a`,
    out : `a`,
})

parsingTests.push({
    description : `Simple add test.`,
    in : `[b#=1+2]`,
    out : `3`,
})

parsingTests.push({
    description : `Advanced math test.`,
    in : 
`/[var1#=240]/
/[var2#=260]/
/[var3#=[var1]*[var2]/2]/
[var5#=[var4#=[var3]/2+3]-15539]/
`,
    out : `64`,
})

//Lockr is giving some issues here:
/*parsingTests.push({
    description : `Some attributes test.`,
    in :
`[date(sys.date)]
[btn(sys.btn)=123]
[cb(sys.cb)=checkbox]`,
    out : `true<br>yes`,
})*/

parsingTests.push({
    description : `Misc text format test.`,
    in :
`[(tf.h[=[level=2]])=title]/
[=regular text]
[(tf.b)=bolded text.]
[(tf.i)=italic text.]
[(tf.s)=striked text.]
[(tf.u)=underlined text.]

'Code: '[(tf.code)='i+1:3']
'Quote: '[(tf.quote)='Be yourself, everyone else is already taken.']/

[myList::tf.list]/
'List:'[myList=
[=First]/
[=Second]/
Third]/
[/<--List needs to be improved.]

[hl::tf.hl]
[(tf.hl)= ][/<--Fix this]
[(tf.link[=[link='http://thevgv.com/']])=thevgv.com][/<--Fix this]
[hl]
[l::tf.img[im=[source='https://picsum.photos/250/160']]]/
[l]/
`,
    // eslint-disable-next-line no-useless-escape
    out : `<h2>title</h2>regular text<br><b>bolded text.</b><br><i>italic text.</i><br><s>striked text.</s><br><u>underlined text.</u><br><br>Code: <pre><code>i+1:3</code></pre><br>Quote: <blockquote>Be yourself, everyone else is already taken.</blockquote><br>List:<ul><li><br></li><li>First</li><li>Second</li><li>Third</li></ul><br><br><br><hr> <br><a href=\"http://thevgv.com/\">thevgv.com</a><br><hr><br><img src=https://picsum.photos/250/160>`,
})

parsingTests.push({
    description : `Types test.`,
    in :
`[simpleText=asdf123...]
[number#=23.343+3]
[boolean&=1||false]`,
    out : `asdf123...<br>26.343<br>true`,
})

parsingTests.push({
    description : `Condition test.`,
    in :
`[condition&=true]
[[condition]?yes:no]`,
    out : `true<br>yes`,
})

parsingTests.push({
    description : `Cloning test.`,
    in :
`[original=[a=1][b=2][c=3]]
[clone*=[original]]
[original.a]
[clone.a]'-'[clone.b]'-'[clone.c]`,
    out :`123<br>123<br>1<br>1-2-3`,
})

parsingTests.push({
    description : `Array test.`,
    in :
`'Original data: '[array=1[a=2][b=3][c=4][b=5]6]
'id: '[getNodesData=[id=b]]
'Result: '[result(sys.nodes[getNodesData]):=[array]]
'Test: '[result.1]`,
    out : `Original data: 123456<br>id: b<br>Result: 35<br>Test: 3`,
})

parsingTests.push({
    description : `Loop test.`,
    in :
`/[addLoop=[loops#:=[loops]-1]]/
/[*loops#=5]/
/[condition &=[loops]>0]/
[outLoop=[[condition]?'Count :'[addLoop]
[outLoop]/
]]`,
    out : `Count :4<br>Count :3<br>Count :2<br>Count :1<br>Count :0<br>`,
})

parsingTests.push({
    description : `Wrapping test.`,
    in :
`/[var1#=400]/
/[var2#=20]/
/[nonWrap#=[var1]+[var2]]/
/[wrap#:=[var1]+[var2]]/
/[var1#=1]/
/[var2#=2]/
[nonWrap]'/'[wrap]`,
    out : '3/420',
})

parsingTests.push({
    description : `9 bottles test.`,
    in :
`[(tf.h)=99 bottles of beer]/
/[startValue#=0]/
/[add1=[startValue#:=[startValue]-1]]/
/[loop=[[startValue]>[endValue]?[do]/[add1] [loop]:[onEnd]]]/
/
/[do=[startValue] bottles of beer on the wall, [startValue] bottles of beer.
Take one down and pass it around, [temp#=[startValue]-1] bottles of beer on the wall.\n
]/
/[startValue=9]/
/[endValue#=1]/
/[onEnd=1 bottle of beer on the wall, 1 bottle of beer.
Take one down and pass it around, no more bottles of beer on the wall.

No more bottles of beer on the wall, no more bottles of beer.
Go to the store and buy some more, 99 bottles of beer on the wall.]/
[loop]`,
    out :
`<h1>99 bottles of beer</h1>9 bottles of beer on the wall, 9 bottles of beer.<br>Take one down and pass it around, 8 bottles of beer on the wall.<br><br> 8 bottles of beer on the wall, 8 bottles of beer.<br>Take one down and pass it around, 7 bottles of beer on the wall.<br><br> 7 bottles of beer on the wall, 7 bottles of beer.<br>Take one down and pass it around, 6 bottles of beer on the wall.<br><br> 6 bottles of beer on the wall, 6 bottles of beer.<br>Take one down and pass it around, 5 bottles of beer on the wall.<br><br> 5 bottles of beer on the wall, 5 bottles of beer.<br>Take one down and pass it around, 4 bottles of beer on the wall.<br><br> 4 bottles of beer on the wall, 4 bottles of beer.<br>Take one down and pass it around, 3 bottles of beer on the wall.<br><br> 3 bottles of beer on the wall, 3 bottles of beer.<br>Take one down and pass it around, 2 bottles of beer on the wall.<br><br> 2 bottles of beer on the wall, 2 bottles of beer.<br>Take one down and pass it around, 1 bottles of beer on the wall.<br><br> 1 bottle of beer on the wall, 1 bottle of beer.<br>Take one down and pass it around, no more bottles of beer on the wall.<br><br>No more bottles of beer on the wall, no more bottles of beer.<br>Go to the store and buy some more, 99 bottles of beer on the wall.`,
})


function parse(value=''){
    const parserApi = new ToParser(value);
    parserApi.compile(false);
    return parserApi.run.result;
}

parsingTests.forEach(t => {
    test(t.description, () => {
        expect(parse(t.in)).toBe(t.out);
    });
});