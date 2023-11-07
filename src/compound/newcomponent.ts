import { AnyModel } from "../model/index.js";
import { Cursor } from "./cursor.js";

// Maybe do it first without models!

export type Properties = { [key:string] : any } 

export interface Component<Config, State, Init, Update> {

    name : string
    
    render(
    
    initialRender(cursor : Cursor, config : Config, init : Init) : SRender<State>

    renderOnUpdate(cursor : Cursor, config : Config, state : State, update : Update) : SRender<State>

    renderOnCursorChange(cursor : Cursor, config : Config, state : State) : SRender<State>

}

export type AnyComponent = Component<any, any, any, any>

export type Render = { 
    name : string, 
    props : Properties, 
    children : Render[] 
}

export type SRender<State> = { state : State, render : Render }