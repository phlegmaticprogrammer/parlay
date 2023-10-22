A *document* is an entity with a name/key. A document is really just an identity, given by the name/key.

A *version* is a version of a document. The contents of different versions of the same document may be completely different.

A *replica* is a branch along which the version of a document evolves in a linear fashion. Each replica has its own logical clock. Different replica of the same document may be merged, and there needs to be an existing target replica into which the other replicas are merged. New versions are always created through a replica. 

A *repository* hosts multiple documents, their replicas, and their versions.

Each repository has for each of its documents a *main* replica, and the goal is to sync all changes to the document eventually back into this main replica. So replicas can have names, or they can be anonymous. 

Ok, but how do I combine this with the UI? Each UI component is supposed to display/manipulate a certain part of the database. How does this part correspond with the above?

A UI component tracks a replica, together with a set of keys that signify which part(s) of the document in particular it displays. 
Therefore, a replica must sent notifications whenever it changes, so that the component can update. On the other hand, the component tracks changes made directly to it, and needs to interpret those changes in terms of changes made to the document.

## Transformations
So, how do transformations work? The idea is that an object can be mapped to another object via a bidirectional mapping. Each time the object changes, the other object changes, too, via the mapping. Ideally, these changes happen within the same version, although that can of course introduce latency issues. A transformation is introduced by specifying a key, and a bidirectional transformation. 

I don't like that I have all this infrastructure for concurrent modification, but transformations introduce latency nevertheless. Rather, you would think it works as follows:

* A change is made, this change results immediately in a new version without regards for any transformations.
* A new temporary replica is created, which executes the necessary transformations. 
* When all transformations have finished, the changes are merged back into the current replica, and the temporary replica can be deleted. 

This is interesting, but what if I would not want to risk inconsistent behaviour? Then I would have to wait until the successful merge back has happened. 

## Are Replicas Overkill?
Are replicas overkill? Locally, for each document the *main* replica is the one of interest. So, we could have just this replica, and all other version edits feed back into this replica. 

Of course, this gives rise to the problem of needing to keep track of which freewheeling versions are out there. With replicas, these could be gathered into a cause (like, "propagate transformations") and organised this way. There could be special kinds of replicas which do not keep past versions to optimise performance and storage usage.  

Replicas also give the change process an identity, and that can be important for CRDT purposes. Each operation has its own replica id, and that's what can be used for a replica id in a CRDT datatype. 

## Keep UI Layer and Database Layer Separate
It seems not much coordination is needed between UI Layer and database layer. The main reason I cannot use React is that React likes control over the DOM, and that clashes with content-editable components. So my UI layer needs to respond to various sources: a) database changes a), and b) content-editable changes, which are translated to database changes.

## UI Layer / Database Interface
The UI component registers its interest in various entities of the database. At the same time, it can make changes to (not necessarily the same) entities of the database. 

## Database aka World aka Source of Truth
Let's do this in a new document.
