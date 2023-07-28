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
theorem(Modus-Ponens: B)
  premise: implies(A, B)
  premise: A

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
theorem Modus-Ponens: ?x !lambda 1 2 3 rgb: 255, _. 12, 25)
`;

export const example = example2.trim();

  