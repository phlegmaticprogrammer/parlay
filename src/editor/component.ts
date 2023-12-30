/* eslint-disable lit-plugin/no-invalid-tag-name */

// Maybe do it first without models!

export type Properties = { [key: string]: any } 

export interface PrimitiveComponent {

  isPrimitive : true
  
  name : string

  render(props : Properties) : Node

}

export interface CompoundComponent {

  isPrimitive : false

  name : string

  render(props : Properties, children : Render[]) : Render

}

export type Component = PrimitiveComponent | CompoundComponent

export type Render = { 
    name : string, 
    props : Properties,
    children : Render[] 
}

function isRender(r : any) : r is Render {
  return typeof r === "object" && typeof r.name === "string" && typeof r.props === "object" && Array.isArray(r.children);
}

let registeredComponents : Map<string, Component> = new Map();

export function registerComponent(component : Component) {
  const name = component.name;
  if (registeredComponents.has(name)) throw new Error("Component is already registered for '" + name + "'.");
  registeredComponents.set(name, component);
}

export function lookupComponent(name : string) : Component | undefined {
  return registeredComponents.get(name);
}

function text2Render(content : string) : Render {
  return { name: "compound-text", props : {"content": content}, children : [] }
}

export function compoundRender(tag : string, attrs?: { [key: string]: any },
    ...children: (Render | string)[]) : Render
{
  let rchildren : Render[] = [];
  function add(c : any) {
    if (typeof c === "string") {
      rchildren.push(text2Render(c));
    } else if (Array.isArray(c)) {
      for (const e of c) add(e);
    } else if (isRender(c)) {
      rchildren.push(c);
    } else throw new Error("Child is not a Render: " + c);
  }
  for (const child of children) add(child);

  //let rchildren = children.map(r => (typeof r === "string") ? text2Render(r) : r);
  return { name : tag, props : attrs ?? {}, children: rchildren };
}

export function printRender(r : Render, log : (s : string) => void = s => console.log(s)) {
    function pr(indent : string, r : Render) {
      let head = indent + "<" + r.name;
      for (const [key, value] of Object.entries(r.props)) {
        head += " " + key + "='" + value +"'";
      }
      head += ">";
      log(head);
      const childIndent = indent + "  ";
      for (const child of r.children) {
        pr(childIndent, child);
      }
      log(indent + "</" + r.name + ">");
    }
    pr("", r);
}

type baseType = {
  key? : string
}

type elementType = baseType & {
  class? : string,
  style? : string,
  editable? : boolean
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "compound-div": elementType,
      "compound-span": elementType,
      "compound-br": baseType,
      "compound-text" : { content? : string }
    }
  }
}

class TextComponent implements PrimitiveComponent {
  
  isPrimitive : true = true
  
  name: string = "compound-text";
  
  render({content} : {content? : string}): Node {
    return document.createTextNode(content ?? "");
  }

}
registerComponent(new TextComponent());

class BRComponent implements PrimitiveComponent {

  isPrimitive : true = true
  
  name: string = "compound-br";
  
  render({}: Properties): HTMLElement {
    const node = document.createElement("br");
    return node;
  }

}
registerComponent(new BRComponent());

class DivComponent implements PrimitiveComponent {

  isPrimitive : true = true
  
  name: string = "compound-div";
  
  render({class: className, style, editable} : 
    {class? : string, style? : string, editable? : boolean}): HTMLElement {
    const node = document.createElement("div");
    if (className) node.setAttribute("class", className);
    if (style) node.setAttribute("style", style);
    if (editable !== undefined) node.setAttribute("contenteditable", editable ? "true" : "false")
    return node;
  }

}
registerComponent(new DivComponent());

class SpanComponent implements PrimitiveComponent {

  isPrimitive : true = true
  
  name: string = "compound-span";
  
  render({class: className, style, editable} : 
    {class? : string, style? : string, editable? : boolean}): HTMLElement {
    const node = document.createElement("span");
    if (className) node.setAttribute("class", className);
    if (style) node.setAttribute("style", style);
    if (editable !== undefined) node.setAttribute("contenteditable", editable ? "true" : "false")
    return node;
  }

}
registerComponent(new SpanComponent());

