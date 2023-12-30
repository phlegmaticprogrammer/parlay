# A CRDT for Trees 

## Introduction

The goal is to construct a CRDT for RX, but this seems difficult.
So, as a first approach, let's try to develop a CRDT for trees,
supporting the following operations:

* Inserting a new node at a certain position in the tree.
* Deleting a node.
* Moving a node to another position within the tree.

Our strategy is to follow the ideas by Evan Wallace described here:

1. https://madebyevan.com/algos/crdt-tree-based-indexing/
2. https://madebyevan.com/algos/crdt-mutable-tree-hierarchy/

While these ideas make sense, it is not clear to me in detail how they work,
especially in combination with each other,
so the goal is also to develop a proof that this actually works.

## Representing CRDTs

The instances of each CRDT form a semilattice.  Therefore it makes sense
to try to represent the elements of a general CRDT in a way that 
joining/merging is straightforward, much like simple set union, together with 
an interpretation function which maps a representation to the intended meaning.

## Representing Trees

### Representation

Each node of the tree points to its *parent*, together with its *position* in the parent.
Each of these pointers may be *null*. If the parent is null, then this means that
the node is a child of the root of the tree. If the left sibling is null, then
this means that the node is the leftmost child of its parent, and if 
the right sibling is null, then the node is the rightmost child of its parent.

Each node has a unique identifier, and the parent pointer contains the
identifier of the node (or null). Furthermore, each node carries with it a 
list of *positions*. Each position has also a unique identifier,
and points to the positions to the left and right of it at the time of creation.

To facilitate updating a tree, we gather the parent and sibling pointers
of a node into an *anchor*. An anchor also has a *timestamp*. A node can have 
multiple anchors, and must have at least one. 

To summarize, a tree representation consists of a set of nodes, where each
node is associated with a set of positions, and a set of anchors.

Merging two trees is now done simply by merging all nodes, where we
merge the corresponding positions and anchors of each node as well.

### Interpretation

How do we interpret a tree representation actually as a tree? 


