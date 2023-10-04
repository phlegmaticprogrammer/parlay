import { nat } from "things"

export type Field = string
export type Key = unknown
export type Version = unknown

//export type DBValue = string | number | null | DBMap | DBList
//export type DBMap = Map<Field, DBValue>
//export type DBList = 

export type Primitive = string | number | boolean | null | Key


export enum DBOperationKind {
    CreateMap, 
    CreateList,
    CreateEntity
}

export type ContentType = "map" | "list"

export interface Content<V> {
    type : ContentType
}

export interface MapContent<V> extends Content<V> {
    type : "map"
}

export interface ListContent<V> extends Content<V> {
    type : "list"
}

export interface Document {
    version : Version
    version_before : Version | undefined

    root : Key

    typeOf(key : Key) : ContentType | undefined
    read(key : Key) : Content<Primitive> | undefined
    create(content : Content<Primitive>) : Key
    
    updateMap(key : Key, content : MapContent<Primitive | undefined>) : void
    updateList(key : Key, delete_from_inclusive : nat, delete_to_exclusive : nat, 
        new_content : ListContent<Primitive>) : void

    remove(key : Key) : void
}

export interface Repository {

    createDocument(content : Content<Primitive>) : Document

    openDocument(document_root : Key, version : Version | undefined) : Document | undefined

    // returns all versions that do not appear in any version_before
    documentHeads(document_root : Key) : Version[] | undefined

    listDocuments() : Key[]
    
}