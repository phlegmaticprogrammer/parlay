Notion, Word-Press and other software revolving around text editing have introduced the explicit and user-facing notion of *blocks*.

Parlay is also based on blocks. We postulate the following properties:

* A block $b$ can be converted into a purely textual representation $T(b)$. 
* A textual representation $t$ can be converted into a block representation $B(t)$.
* Converting a text into a block is lossless, i.e. $T(B(t)) = t$.
* In general, conversion from a block to text can lose certain *ephemeral properties* of the block, so in general $B(T(b)) \neq b$. Such an ephemeral property can for example be if the block is collapsed or not, or which of several possible ways of representing a block has been chosen.
* Blocks are *recursive*, i.e. they can contain other blocks. The assumption is generally that changes of the content of a child block are *local*, i.e. they do not influence the structure and content of anything upwards, although there may be side effects. 

What is important is that there is an abstract block-based representation, and editing operations happen on this abstract representation (a block represented as text is a special case of this). The abstract representation is then converted to a HTML/CSS representation. Editing moves on the HTML level are then translated back to editing moves on the abstract representation.