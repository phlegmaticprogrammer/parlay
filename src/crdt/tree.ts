import { RedBlackMap, RedBlackSet } from "things"

export type NodeId = string
export type PositionId = string

export type Node = {
    id : NodeId,
    positions : Position[],
    connections : Connection[],
    data : any
}

export type Position = {
    id : PositionId,
    left : PositionId | null,
    right : PositionId | null
}

export type Connection = {
    timestamp : number,
    parent : NodeId,
    position : PositionId
}

export type Tree = RedBlackMap<NodeId, Node>