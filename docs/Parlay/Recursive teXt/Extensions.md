RX is a simple foundation and abstraction, on top of which other functionality can be layered. To make RX as simple and robust as possible, this other potential functionality is not included in RX itself.

Examples for such extensions are listed in the following.

## Elastic Tabstops
The basic idea of [elastic tabstops](https://nickgravgaard.com/elastic-tabstops/) is to not make a TAB equal a fixed number of spaces (for example 4), but instead to interpret it as a boundary between table columns. This idea could be adapted to RX, although a more general solution is to simply implement a table as a block of blocks.

## Spans
You could divide a line further into a sequence of characters and spans:
```
Line => (Character | Span)*
Span => (Character | Span)*
```
This corresponds to making *brackets* a built-in functionality of the file format. The above definition would restrict a bracket pair to a single line, so the closing bracket must be on the same line as the opening bracket it corresponds to. The advantage of such spans is not really clear.

## Contexts
RX is a pure text format that prescribes no meaning. A straightforward extension is to give each block a particular meaning. The meaning of a block can then also influence the meaning of the blocks (and lines) it consists of. 

This introduces important questions:
* Should there be "standard" meanings, such as tables?
* How do you designate the meaning of a block? For example, via starting it with "/table"?
* Depending on the meaning of something, it might make sense to offer a different view of it than just text, and a different way to edit it than just as text. In such cases, should the underlying representation as text be accessible at all?
* How does the meaning of a block change when you move a block? For example, similar to the macOS commands "Paste" and "Paste and Match Style", should there be commands such as "Paste"  and "Paste and Keep Meaning", or "Paste" and "Paste and Adjust Meaning"?

## Context: Abstraction Logic
The context that inspired RX is Abstraction Logic. 

In Abstraction Logic, a block usually stands for either a 
mathematical object, or a label, or for a label plus one or more mathematical objects.
