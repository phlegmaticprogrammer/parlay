Recursive teXt (RX) itself is simple, but there are different levels
at which editing RX can be supported.

# Levels

## Level 0: Bare Bones
This level is most closely related to pure text editing. Everything
is just text, but spans and blocks are taken into account. 
Line numbers are shown, and blocks can be folded.

## Level 1: Syntax Highlighting
We allow for syntax highlighting. The same text is displayed as in Level 0,
but some of the text will be in a different font, color, underlined, etc.,
depending on its meaning according to a parse. 

## Level 2: Syntax Sections
We allow switching between view and edit modes depending on the cursor position.
For this, the text is subdivided into syntax sections which display themselves
nicely when just viewed, and which switch back to just text for editing.
The children do not switch back during editing, except if they are being edited
as well.

## Level 3: Syntax Objects
The syntax sections have full autonomy on how to display themselves for
either viewing and editing. They are responsible for managing a certain 
part of the document, but how they do that, is entirely up to them 
(and their parent syntax objects). Yet, these objects are tied to the document
model.

# Considerations

Implementing one level after the other one might be easiest, as the 
experience from successfully completing previous levels can inform
the design of the solution for the current level.

Jumping ahead directly to Level 3 could save time, and may even allow 
for a cleaner design, as the problem is attacked in full, without
having to go through simpler, but potentially misguided previous solutions.

# Imagining Level 3

How would Level 3 look like for *Design By Numbers*?

## Comments

Entering `//` at the beginning of a block will turn that block into a
comment section. From here on, only the comment text is visible and can
be edited, and the fact that this is a comment box may be indicated somehow,
for example a small label "comment". Deleting a comment block should 
work the same way as if this was just a text block, but in general, there
should be a way to move a block around. 

