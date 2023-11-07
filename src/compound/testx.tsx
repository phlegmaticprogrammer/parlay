/** @jsx dom */

console.log("testx ----- start");


declare global {
    namespace JSX {
        interface IntrinsicElements {
          "c-cool-another": {
            //id: string;
          };
        }
    }
}

function dom(tag : string, attrs?: { [key: string]: any },
    ...children: any[]) : any 
{
    console.log("dom called for <" + tag + ">" + ", number of children: " + children.length);
}

const great = 5;
const s = <c-cool ids = {great}><c-cool-another></c-cool-another></c-cool>;

console.log("testx ----- end");