# A CRDT for Recursive teXt?

A major problem seems to be how to model the breaking up of a line.
Similarly, the breaking up of a box. Additionally, joining two lines/boxes.

Furthermore, what about moving around a box? 
It seems that moving a line is not that important,
because the line itself is not considered a semantic unit.

## Splitting A Line

A simple way to perform the splitting of a line at a given character is as follows:

* Create a new line after the current line.
* *Move* all characters after the given character into the new line.

The **move** operation consists of deleting all characters and then inserting
them in the new location.

The problem with this approach is as follows: If two users perform
the exact same line splitting concurrently, the newly created line will
appear twice in the synchronized result.

## Inserting A Line

Inserting a fresh line is in practice done as a special case of
splitting a line: At the end of a line, ENTER is pressed, and a new
line is created. Does this mean we have the same problem as when splitting a line?

Imagine two users concurrently hitting enter at the end of a line, 
and typing in different sentences. What result would you expect after
synchronization? I think you would expect two new lines at the end of the
document.

So the main problem doesn't seem to be the duplication of lines. Instead,
the main problem is that characters don't have their own identity. And 
so this is just the move (2*(delete+insert) = delete+2*insert) problem in disguise.

## Shallow Groups = Range?

Is that an alternative to left/right origin? The idea is to collect 
consecutive inserts as a group, such that it can be protected from
interleaving with concurrent inserts. In other words, a shallow group
is a *range*, but a static one that is part of the document.

## Combining Tree Hierarchy and Tree-based Indexing

There are two articles by Evan Wallace (of Figma and esbuild fame)
of interest here:

1. https://madebyevan.com/algos/crdt-tree-based-indexing/
2. https://madebyevan.com/algos/crdt-mutable-tree-hierarchy/

The first describes how to model an ordered sequence as a CRDT,
the second one how to model a mutable tree as a CRDT. In the second
one he also suggests that both approaches can be combined to obtain
trees where the children of a node form an ordered sequence. 

## Splitting and Joining

It seems splitting and joining are independent special operations which cannot
simply be reduced to tree operations. But let's try anyway. 

In the following, let *container* stand for a sequence, such as
a line, block, or document.

### Splitting

Splitting a container is done by specifying a position in the container
(via left/right origin), creating this new position in the container,
creating two new containers, and designating the split container as their 
origin.






