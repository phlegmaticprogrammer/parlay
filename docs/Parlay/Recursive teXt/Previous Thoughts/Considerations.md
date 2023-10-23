# Important Considerations for Recursive teXt

## Context

Should the meaning of a block depend on its context?

The basic idea is *that Recursive teXt is just text, but recursive.
So the text will describe something*, usually some mathematical object.
Now when copying a block of text that describes a mathematical object,
that text might take on a new meaning when pasted into a different
context, if the meaning of text is context dependent.
That might not be desirable. Also, the text might have been transformed
into something different, and acquired certain ephemeral properties,
which would now be lost due to copying. 

## Inline Blocks

A span is an inline element, it can only contain characters and other 
spans. But what if I want to insert something inline that
can only be represented as a block? How do I go about this?
Well, don't. 

## Abstraction Logic

In Abstraction Logic, a block usually stands for either a 
mathematical object, or a label, or for a label plus one or more mathematical objects.

