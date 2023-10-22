There are three actors in the system from a UI point of view:
* The *model*: this is the entire world state, part of which the UI is displaying.
* The *UI*: this is the user interface component.
* The *DOM*: these are the DOM nodes currently representing the UI component.

So we need the following information:
* Which part of the model is the UI component displaying? This can be a key, or a set of keys, referencing parts/objects within the model. 
* Which version of the model is the UI component displaying? 