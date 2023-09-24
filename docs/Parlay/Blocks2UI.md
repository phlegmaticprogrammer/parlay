Given content based on blocks, how do I convert this into an editor?

The document is a list of blocks. How do we decide what the document and these blocks mean? Each document is treated in a given context. This context can come from anywhere. For example, if the document came from a file ending with `.thy.practal`,
we might create a context for a theory of Abstraction Logic.

The context decides which UI component serves as an editor for the document.  The editor is either in view mode, or in edit mode.
A path in the document is a sequence of *indices*. An *index* is either a *key*, or a natural number, denoting the index in the array / string.