import React, { useEffect, useState } from "react";
import { Replica, editReplica, syncReplicas } from "./replica.js";
import { LeftRightEnv, ReplicaId } from "./positions.js";
import { nat } from "things";

type R = Replica<any, string>
type Replicas = { replica : R, sync : boolean }[]
const replicas : Replicas = [];
function addReplica(label : ReplicaId) {
    let r = new Replica<any, string>(label, new LeftRightEnv(label));
    replicas.push({ replica : r, sync : false });
}
addReplica("A");
addReplica("B");
addReplica("C");
addReplica("D");

function merge() {
    const rs : R[] = [];
    for (const {replica, sync} of replicas) {
        if (sync) rs.push(replica);
    }
    syncReplicas(rs);
}


function range(startInclusive : number, stopExclusive : number, step : number = 1) : number[] {
    const r : number[] = [];
    for (let x = startInclusive; x < stopExclusive; x += step) r.push(x);
    return r;
}

export function Cards() {
    return <> { range(0, replicas.length).map(i => <Card key={i} replicaIndex={i}></Card>) }
    </>
}

function transformPosition(characters : string[], pos : number | null) : number | null {
    if (pos === null) return null;
    let p = 0;
    for (const [i, c] of characters.entries()) {
        p += c.length;
        if (pos < p) return i;
    }
    return characters.length;
}

export function Card({replicaIndex} : {replicaIndex: nat}) {
    const r = replicas[replicaIndex];
    const [value, setValue] = useState(r.replica.values().join(""));
    const [sync, setSync] = useState(r.sync);
    useEffect(() => {
        //console.log("install effect");
        const listener = () => {
            //console.log("listener at " + r.replica.id + " called");
            setValue(r.replica.values().join(""));
        };
        r.replica.onChange(listener);
        return () => {
            //console.log("uninstall effect");
            r.replica.onChange(undefined);
        };
    });
    function updateSync(checked : boolean) {
        setSync(checked);
        r.sync = checked;
        merge();
    }
    function updateValue(value : string, selectionStart : number | null, selectionEnd : number | null) {
        setValue(value);
        const characters = [...value];
        const cursor = transformPosition(characters, selectionStart);
        editReplica(r.replica, [...value], cursor);
        merge();
    }
    return <>
        <span>Card {r.replica.id}: </span>
        <input value={value} onChange={e => updateValue(e.target.value, 
            e.target.selectionStart, e.target.selectionEnd)} width="300px" height="200px"/>
        <span> sync:</span>
        <input type="checkbox" checked={sync} onChange={e => updateSync(e.target.checked)}/>
        <hr/>
        </>;
}

//export let CRDTDemo = <><Card label="A"/><Card label="B"/><Card label="C"/></>;

export let CRDTDemo = <Cards/>