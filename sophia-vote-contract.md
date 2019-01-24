IAL: How to create a Sophia fungible token contract?
====
## Tutorial Overview
This tutorial takes a look at a smart contract, written in Sophia ML for a voting aepp but also provides another fundamental and deeper understanding about general basics of the language itself.

## Prequisites
- Installed **docker** (take a look at [this site](https://docs.docker.com/compose/install/) in case you didn't)
- Installed **aecli** (take a look at [this tutorial](https://github.com/aeternity/tutorials/blob/master/account-creation-in-ae-cli.md#installing-aecli) to remind yourself on installing the javascript version of aecli)
- Installed **forgae** (take a look at [this section](https://github.com/aeternity/tutorials/blob/master/smart-contract-deployment-in-forgae.md#installing-forgae))


## Setting up project and development environment 
First we have to initialize our project where we will write the smart contract. In order to do that we will be using `forgae`.

## Smart contract
In Sophia ML we have a state which is the place where we store data on-chain, and it is the only thing in the smart contract that can be mutated (overwritten).

The first thing we do is to define our variables and types that we are going to use in the smart contract. And the `init()` function which is the constructor basically, if we compare this to a Solidity smart contract.

````
contract Vote =

   record candidates = {
      voters: list(address) }

   record state = {
      votes: map(address, candidates) }

   public stateful function init() : state = {
votes = { } }
`````
The `candidate` record will be storing its **voters** in a **list** of addresses. And the `state` record will store all the **votes** in a mapping (which is a key-value pair) of address to candidate record.

Starting with the first functionality for the aepp – adding candidates:

`````
 public stateful function add_candidate(candidate: address) : bool =
      is_candidate(candidate)
      true
``````
What this does is passing the candidate to the `is_candiate()` function – taking a candidate’s address as a parameter, checking if there is a candidate defined at with this address and saving it to the **votes** mapping in the state with the initial empty list of voters if not.

Here are the helper functions we are using for this:

`````
 private stateful function is_candidate(candidate: address) =
      let candidate_found = lookupByAddress(candidate, state.votes, { voters = [] })
      if (size(candidate_found.voters) == 0)
         put(state{
            votes[candidate] = { voters = [] } })

   private function lookupByAddress(k : address, m, v) =
      switch(Map.lookup(k,m))
         None => v
         Some(x) => x
``````
We are doing this because in Sophia ML we don’t have a default value of 0x0/false as in Solidity for example. So, in order for us to cast a vote, we need to first have added the candidates which we can vote for.


**If we don’t add the candidate first, before voting, we will hit out of gas error.**

Next we create the vote function which looks like this:
`````
public stateful function vote(candidate: address) : bool =       is_candidate(candidate)       let new_votes_state = Call.caller :: state.votes[candidate].voters       put(state{          votes[candidate].voters = new_votes_state }) true
``````

We access the transaction initiator’s address by the built in Call.caller and prepend it `::` to the current list of voters.

Last thing is the get votes count function.
`````
public function count_votes(candidate: address) : int =       size(state.votes[candidate].voters)
`````

Here we are using a `size` function which we define as a helper function below. Here is the code and below we can see the explanation.
`````
private function size(l : list('a)) : int = size'(l, 0)
`````

This is where things get a bit more complicated, so I will try to explain what is happening here.

Since in Sophia ML we don’t have `.count` or `.length` to get the list length, we need to make ourselves a helper function which will make a recursion and will iterate over the list while incrementing a counter.

The `size` function is defined to accept a list of `'a` which is the convention for a generic type, and a return type `int` . In the function’s body we are calling the `size'` function, while passing the list and an initial value for the counter.
``````
private function size'(l : list('a), x : int) : int =
      switch(l)
         [] => x
         _ :: l' => size'(l', x + 1)
``````
And here the magic happens, we use the `switch` statement with 2 cases  `[] => x` – which returns the value of the counter and breaks the recursion if the list is empty. And `_ :: l' => size'(l', x+1)` – means we are using a pattern matching and we are separating the first element from the list and the remainder and then recursively passing the list’s remainder to the same function, while incrementing the counter.

The whole smart contract code looks like this in the end:

```````
contract Vote =

   record candidates = {
      voters: list(address) }

   record state = {
      votes: map(address, candidates) }

   public stateful function init() : state = {
      votes = { } }

   public stateful function vote(candidate: address) : bool =
      is_candidate(candidate)
      let new_votes_state = Call.caller :: state.votes[candidate].voters
      put(state{
         votes[candidate].voters = new_votes_state })
      true

   public function count_votes(candidate : address) : int =
      size(state.votes[candidate].voters)  

   private function size(l : list('a)) : int = size'(l, 0)
   
   private function size'(l : list('a), x : int) : int =
      switch(l)
         [] => x
         _ :: l' => size'(l', x + 1)

   public stateful function add_candidate(candidate: address) : bool =
      is_candidate(candidate)
      true

   private stateful function is_candidate(candidate: address) =
      let candidate_found = lookupByAddress(candidate, state.votes, { voters = [] })
      if (size(candidate_found.voters) == 0)
         put(state{
            votes[candidate] = { voters = [] } })

   private function lookupByAddress(k : address, m, v) =
      switch(Map.lookup(k,m))
         None => v
         Some(x) => x
`````````

## Conclusion
It is fairly simple to create a basic aepp on æternity blockchain using Sophia ML. In our case with the ae-vote we stumbled upon some tricky parts like the recursive iteration, we had to make above, but when you familiarize yourself with the language it is easier.
         

