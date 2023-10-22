# *Design By Numbers* as an Abstraction Logic

## Concepts in *Design By Numbers* 

The following concepts and commands are introduced in the book, 
in the same order as listed here:

* `Paper`
* `Pen`
* `Line`
* `//` introduces a comment
* `Set`
* `Repeat`
* `+`, `-`, `*`, `/`
* Drawing dots via `Set [x, y] color`
* Reading dots via `Set color [x, y]`
* Questions, such as `Same?`, and `NotSame?`, and `Smaller?`, and `NotSmaller?`.
* Introducing custom commands via `Command`.
* Loading libraries via `Load`.
* Animations via repeating `Paper`.
* Reading mouse input: 
  * $x$ via `<Mouse 1>`
  * $y$ via `<Mouse 2>`
  * `<Mouse 3>` is $100$ when mouse button is pressed, $0$ otherwise
* `Forever`
* Using pixels as state for vector drawing
* Keyboard input: `<Key 1>`, ..., `<Key 26>` for letters A to Z. 
  The value is $100$ for the key being pressed, and $0$ for not being pressed.
* Networking via `<Net 1>`, ..., `<Net 1000>`.
* Time: hours `<Time 1>`, minutes `<Time 2>`, and seconds `<Time 3>`.
* Custom numbers
* Random numbers

## Translating DBN Concepts to AL

The idea is to translate DBN to abstraction logic, for example
with a file ending `.dbn.rx`, or `.dbn.practal`.

There are basically two ways of how to do this, which can also be mixed:

1. One is to translate DBN commands 1-1 into AL "commands", and to execute
   these commands. Such an AL command would not have meaning on its own,
   but only gets this meaning through an additional execution abstraction.
2. The other one is to give each of the corresponding AL abstractions a meaning
   of their own. 

Here is an example DBN program, which we will translate in those two different
ways:
```
Paper 0
Pen 100
Repeat A 0 10
{
  Line (20+A*4) 0 (20 + A * 4) 100
}
```

### Way 1

```
Paper(0)
Pen(100)
Repeat(0, 10)
    A => Line(20 + A * 4, 0, 20 + A * 4, 100)
```

### Way 2

```
Paper(0)
    Pen(100)
        Repeat(0, 10)
            A => Line(20 + A * 4, 0, 20 + A * 4, 100)
```

### Comparison

Way 1 and Way 2 are not that different from each other! In fact,
as we can see, they look the same, if we allow for custom syntax to transform
```
Paper
    obj1
    obj2
    obj3
```
into 
```
Paper
obj1
obj2
obj3
```

So our decision is to see if we can make **Way 2** work well.

### Raster

Instead of `Paper`, we are going to use the term `Raster`. This ensures
that we can later use `Paper` for vector graphics, instead of pixel graphics.

A related question is how to label the pixels in a raster. It should be so that a switch can be easily made from vector graphics to raster graphics. So the lower left pixel should be (0, 0), not (1, 1). Furthermore, the upper right corner should be (100, 100), not (99, 99). Or is a raster from (1,1) to (100, 100) more sensible? It seems using real numbers, like $0.5$, and $1.2$, makes a lot of sense, too.

### Let 

How do we deal with `Set`? Instead of
```
Set A 50
Line 0 0 A A 
```
we could write:
```
Let(50)
    A => Line(0, 0, A, A)
```
Alternatively, using the same custom syntax trick as before, we could allow:
```
Let(50)
A => Line(0, 0, A, A)
```
Another option would be somehow to allow syntax such as
```
Let A = 50
Line(0, 0, A, A)
```
or maybe 
```
A := 50
Line(0, 0, A, A)
```

### Visual Clutter
It seems 
```
Line(0, 0, A, A)
```
contains much more visual clutter than
```
Line 0 0 A A
```
Should I do something about that, or just accept it? The second
notation is actually valid AL syntax, but likely involves a more 
complicated explanation, depending on what `f x` means.





