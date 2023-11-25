# Case Study: Recursive teXt

Coming up with the right concepts for ***Compound*** is quite difficult,
given its generality. In this case study I will focus on the special
case of editing plain RX.

## Model

RX has a simple model: 

* A **document** is a non-empty sequence of *blocks*.
* A **block** starts with a *line*, followed by a sequence of 
  *lines* and *blocks*.
* A **line** is a sequence of *characters*. Characters `\r` and `\n` are not
  allowed, and a line cannot start with character `\xA0`. When encountered, they
  are replaced by a simple space. 

## Model Cursor and Selection

A **cursor** is a *pointer* to a line, together with an **index**
denoting after how many characters of the line the position is situated.

A **pointer** can be a sequence of indices that describe how to navigate through
the document to arrive at the line. It could also be just the unique id of the 
line. 

A **selection** is a pair of cursors, whereas the first cursor is less or
equal to the second cursor.

## Init and Update



