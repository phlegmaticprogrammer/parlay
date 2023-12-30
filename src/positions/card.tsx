import React from "react";

export function Card({label} : {label:string}) {
    return <>
        <span>Card {label}: </span>
        <input defaultValue={label} width="300px" height="200px"/>
        <span> sync:</span>
        <input type="checkbox" checked={false}/>
        <hr/>
        </>;
}

export let CRDTDemo = <><Card label="A"/><Card label="B"/><Card label="C"/></>;