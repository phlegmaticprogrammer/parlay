export const example1 = `
theorem Modus-Ponens: B
    Q
  premise: implies A B
    C D
  premise: A B

theorem Universal-Introduction: for-all (x. P[x])
  premise: x. P[x. w]

lambda cool: x. P[x]

for-all: x. P[x]

for-all : x. P[x]

for-all x. P[x]

 for-all x. P[x]

for-all x. P[x]

  for-all x. P[x]

`;

export const example2 = `
theorem(Modus-Ponens: B,
    w,
  q)  premise: implies(A, B)
    )
    premise: A(
        B)
          premise:
      Q

theorem(Universal-Introduction: 
  for-all(x. P[x]))
    premise: x. P[x]

lambda(domain: D, E body: u. B[u], x y. x)
lambda(domain: body:)

theorem(Truth-1: true)

theorem(Truth-2: implies(A, equals(A, true)))

theorem(Implication-1: implies(A, implies(B, A)))



theorem cool: P[lambda u. w[u]]
lambda : u. w[u] : x
sin(x. w[u], premise: y. y, 25, premise: 10, 20, why: 25):
lambda: x y z.
  great: 
`;

export const example3 = `
theorem(Modus-Ponens: B,
       (C
    cool: g
  ))
    premise: implies(A, B)
`;

export const example4 = `
lambda(domain: R)
      R
    B
   C
    hey: L(a, b,
      c)
        Q  
        D
            s:
    E
grunch
`;

export const example5 = `
lambda(domain: R,
  R  
    B
  C)
    next, e, o, ..x, ...y, q.y
    wow
    u v. P[x, y]
   were
`;

export const example6 = `
A

B

C


D
`;

export const example7 = `
lambda(domain: R,
  R  
    B
    premise: K

  C)
`;

export const example8 = `
lambda(domain: R,
  R  
    B
    premise: K
    4: w

  C)
    key: super
        great: box
        weird: show
    key: 
        great: box
        weird: show
`;

export const BaseTheory = `
theorem(Modus-Ponens: B)
    premise: implies(A, B)
    premise: A
theorem(Universal-Introduction: 
  for-all(x. A[x]))
    premise: x. A[x]
theorem(Truth-1: true)
theorem(Truth-2: implies(A, equals(A, true)))
theorem(Implication-1: implies(A, implies(B, A)))
theorem(Implication-2: implies
    implies(A, implies(B, C)) 
    implies
        implies(A, B) 
        implies(A, C)
  )
theorem(Universal-1: implies(for-all(x. A[x]), A[x]))
theorem(Universal-2: implies
    for-all(x. implies(A, B[x]))
    implies(A, for-all(x. B[x]))
  )  
theorem(Equality-1: equals(x, x))
theorem(Equality-2: implies(equals(x, y), implies(A[x], A[y])))
`;

export const BaseTheoryPretty = `
theorem Modus-Ponens: B
    premise: implies(A, B)
    premise: A
theorem Universal-Introduction: 
  for-all(x. A[x])
    premise: x. A[x]
theorem Truth-1: true
theorem Truth-2: implies(A, equals(A, true))
theorem Implication-1: implies(A, implies(B, A))
theorem Implication-2: implies
    implies(A, implies(B, C)) 
    implies
        implies(A, B) 
        implies(A, C)
theorem Universal-1: implies(for-all(x. A[x]), A[x])
theorem Universal-2: implies
    for-all(x. implies(A, B[x]))
    implies(A, for-all(x. B[x]))
theorem Equality-1: equals(x, x)
theorem Equality-2: implies(equals(x, y), 
  implies(A[x], A[y]))
`;

export const BaseTheoryPrettyFixed = `
theorem(Modus-Ponens: B)
    premise: implies(A, B)
    premise: A
theorem(Universal-Introduction: 
  for-all(x. A[x]))
    premise: x. A[x]
theorem(Truth-1: true)
theorem(Truth-2: implies(A, equals(A, true)))
theorem(Implication-1: implies(A, implies(B, A)))
theorem Implication-2: implies
    implies(A, implies(B, C)) 
    implies
        implies(A, B) 
        implies(A, C)
theorem Universal-1: implies(for-all(x. A[x]), A[x])
theorem Universal-2: implies
    for-all(x. implies(A, B[x]))
    implies(A, for-all(x. B[x]))
theorem Equality-1: equals(x, x)
theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))
`;

export const BaseTheoryNewlines = `
% Cool Theory!
theorem(Modus-Ponens: B)
    premise: implies(A, B)
    premise: A

theorem Universal-Introduction: 
  for-all(x. A[x])
    premise: x. A[x]

theorem Truth-1: true

theorem Truth-2: implies(A, equals(A, true))

theorem Implication-1: implies(A, implies(B, A))

theorem Implication-2: implies
    implies(A, implies(B, C)) 
    implies
        implies(A, B) 
        implies(A, C)

        
theorem Universal-1: implies(for-all(x. A[x]), A[x])


theorem Universal-2: implies
    for-all(x. implies(A, B[x]))
    implies(A, for-all(x. B[x]))

theorem Equality-1: equals(x, x)

theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))
`;

export const Implication2 = `
theorem Implication-2: implies
    implies(A cool: p, implies(B, C)) 
    implies
        implies(A, B) 
        implies(A, C) 
`;

export const BindersBlock = `
lambda body: x y z.
    do something: .
        great
        cool

`;

export const Brackets = `
()
(a, b)
(a)
A()
A[]
A[x]
A(x)
premise: conclusion: a
  b cool c
`

export const analyze = `
Math.sin(x, P[x], y. Q[x, y], t cool: e)
(..., .., p, _, x, ..x, ...x, u.v)
()
`

export const test = `
Modus-Ponens: B : u. P[u, v]
`

export const test2 = `
A: B: E K: u v w.
  C D
    
`;

export const BaseTheoryNew = `
% This is a comment.
  This is the second line of the comment.
  And here is the third one.

theorem Modus-Ponens: B
    premise: implies(A, B)
    premise: A

theorem Universal-Introduction: 
    for-all(x. A[x ()])
    premise: x. A[x]

theorem Truth-1: true

theorem Truth-2: implies(A, equals(A, true))

theorem Implication-1: implies(A, implies(B, A))

theorem Implication-2: 
    implies
        implies(A, implies(B, C))
        implies(implies(A, B), implies(B, C))

theorem Universal-1: implies(for-all(x. A[x]), A[x])

theorem Universal-2: 
    implies
        for-all(x. implies(A, B[x]))
        implies(A, for-all(x. B[x]))

theorem Equality-1: equals(x, x)

theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))
`;

export const example9 = `
theorem dummy: u v x.
    P[x, u]
    v u P[v]
    premise: A
`;

export const example10 = `
% hey
  there!
theorem A:
    premise: cool


theorem B:
    premise: now
`;

export const example11 = `
theorem(Universal-Introduction:
    cool: 
    for-all(x. A[x()]),
    premise: x. A[x])

now(well~
    done
    yeah
  , u)
    
weird ~
  
`;

export const ExampleForSimpleEditor = `
% This is a comment.
  This is the second line of the comment.
  And here is the third one.

What if I indent
 just by one?

theorem Modus-Ponens: B
    premise: implies(A, B)
    premise: A

theorem Universal-Introduction: 
  for-all(x. A[x ()])
    premise: x. A[x]
    premise: not really needed
  and we continue here

theorem Truth-1: true

theorem Truth-2: implies(A, equals(A, true))

theorem Implication-1: implies(A, implies(B, A))

theorem Implication-2: 
    implies
        implies(A, implies(B, C))
        implies(implies(A, B), implies(B, C))

theorem Universal-1: implies(for-all(x. A[x]), A[x])

theorem Universal-2: 
    implies
        for-all(x. implies(A, B[x]))
        implies(A, for-all(x. B[x]))

theorem Equality-1: equals(x, x)

theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))
`;

export const MarkdownVariant = `
Things like *bold
  style* work like before.

    First item
    Second item
    Third item
  
  Continue
`;



/*

theorem(great: u theorem, Imp: a)

*/

export const example = BaseTheoryPretty.trim(); //MarkdownVariant.trim();

  