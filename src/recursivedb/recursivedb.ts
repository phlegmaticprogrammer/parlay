import { nat } from "things"

export class Key {
    #id : string
    constructor(id : string) {
        this.#id = id;
    }
    get id() : string {
        return this.#id;
    }
}

export type Value = string | number | boolean | null | Key 

export enum ContentType { map, list, set, value }

export type Content = MapContent | ListContent | ValueContent | SetContent

export type Update = MapUpdate | ListUpdate | SetUpdate | ValueUpdate

export type MapContent = {
    contentType : ContentType.map,
    content : [Value, Value][] 
}

export type MapUpdate = {
    contentType : ContentType.map,
    update : [Value, Value | undefined][] // later elements superseed earlier ones
}

export type SetContent = {
    contentType : ContentType.set,
    content : Value[] 
}

export type SetUpdate = {
    contentType : ContentType.set,
    remove : Value[],
    then_insert : Value[]
}

export type ListContent = {
    contentType : ContentType.list,
    content : Value[]
}

export type ListUpdate = {
    contentType : ContentType.list,
    deleteFromInclusive : nat,
    deleteToExclusive : nat,
    insert : Value[]
}

export type ValueContent = {
    contentType : ContentType.value,
    content : Value
}

export type ValueUpdate = {
    contentType : ContentType.value,
    update : Value
}

export interface Replica {

    /** The key of the document this replica replicates. */
    key : Key 
    
    /**
     * Creates a new object within the document. 
     * Returns the new replica and the key of the object.
     */ 
    create(c : Content) : Promise<[Replica, Key]>

    /**
     * Updates an object within the document.
     * 
     * Returns the new replica if successful. Returns undefined if no object with that key exists 
     * in the replica, or the object existing under this key is not compatible with the update.
     */
    update(k : Key, u : Update) : Promise<Replica | undefined>

    /**
     * Returns the content of the object associated with this key in this replica.
     * Returns undefined if no object with that key exists in the replica.
     */
    read(k : Key) : Promise<Content | undefined>

    /**
     * Removes the object associated with this key in the replica.
     * Returns undefined if no object is associated with this key in the replica.
     * Note that you cannot remove the replica itsself, so `r.remove(r.key)` will return undefined.
     */
    remove(k : Key) : Promise<Replica | undefined>

}

export interface Repository {
    
    /** 
     * Creates a new document, and returns its root replica. If no key is given,
     * a unique fresh one is created. If a key is given, it is used, 
     * if no such document exists in the repository. Returns undefined if the key is given,
     * but there exists already a document with this key in the repository.
     */
    create(c : Content, key? : Key) : Promise<Replica | undefined>

    /** 
     * Returns the (local) heads of the document associated with the key.
     * A head is a replica that isn't the parent of some other replica.
     * Returns undefined if no such document exists.
     */
    heads(key : Key) : Promise<Replica[] | undefined>

    /**
     * Merges all given replicas into a single one (which might be among the given ones).
     * All given replicas must belong to the same document.
     */
    merge(replicas : Replica[]) : Promise<Replica>

    /**
     * Returns the keys of all documents of this repository.
     */
    documents() : Promise<Key[]>

}

export async function sync(repo : Repository, document : Key) : Promise<Replica | undefined> {
    const heads = await repo.heads(document);
    if (heads === undefined) return undefined;
    return repo.merge(heads);
}