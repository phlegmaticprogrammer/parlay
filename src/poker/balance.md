Let's assume an experiment yields heads H times and tails T times.
Assume we are running that experiment many times, in particular N times.
How many heads and tails will I have? 
h(N) = H / (H + T) * N



Assume the following game:

The pot is P dollars. I am betting D dollars. If in this situation, I make
V value bets balanced with B bluffs, how many times should
my opponent call?

Let's assume my opponent calls C times and folds F times. 

Assume a very large number of repeats of this experiment, N times.
What is my expected value of winnings?

Probability that my opponent calls: 
C / (C + F)

Probability that my opponent folds:
F / (C + F)

On each call, with probability V / (V + B), I am value betting.
In this case, I win P + D dollars.
With probability B / (V + B), I am bluffing.
In this case, I loose D dollars.

On each fold, I win P dollars. 

That means:

* C / (C + F) * ((V / (V + B)) * (P + D) - B / (V + B) * D)
* F / (C + F) * P

Out of N bets, how many are value bets?




