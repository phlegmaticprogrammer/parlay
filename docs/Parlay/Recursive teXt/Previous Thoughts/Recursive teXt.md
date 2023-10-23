That's what I am calling the basic file format. A recursive text file has suffix `.rx`. 
Furthermore, to distinguish between different types of files, another suffix can be prepended to 
this, as in `.thy.rx`, which could for example be a theory file in recursive text format. 
Each such different type can be handled by a different *plugin*.

## Source of Truth
The document is the source of truth. Each time the document is changed, a (partial) copy is created. Different copies can, and actually mostly should, share keys, but within one document copy, all keys must be different. 


## How does it work?

There is a document store. All viewing / changing of the document goes through this document store. The document store itself does not validate, though, that is what the Components are for.

### Example: Text Input
* The user inserts in a certain position an emoji 😊.
* The browser changes the character data of a text node, and issues an event.
* The framework routes this event to the component responsible for the text node. This results in either a rejection, or a document change request. 
* In case of a change request, the request is performed on the document store.
* A rerender is triggered in either case, based on the possibly changed document store. 

### Example: Copy Paste

* I am copying one region of the editor, and pasting this into the editor at another position.
* The copied region is converted into a document fragment, which is then inserted at the given position.
* But what a document fragment means, is dependent on the component in which the document fragment was before. Shouldn't that meaning survive the copy paste? 
* This is a lot like "Paste and Match Style" vs. "Paste". Should the pasted content derive its meaning from the new context ("Paste and Match Style"), or should it carry over its meaning from the old context ("Paste"). 
* It seems like a bad idea to make the meaning of a block context-dependent.

### Use Cases (that need to be doable)

* Changing something in one component can trigger changes in many other components, such as highlighting of syntax errors after a definition was changed or deleted.
* Editing of a comment: Here the leading `%` is not part of the editing, and may not be shown at all. Instead, the fact that these lines correspond to a comment may be shown in a different way, for example via a property `kind=comment`.
* Selecting multiple components and applying the same change (for example rotating them all by 90 degrees).
* Viewing and editing tables.



