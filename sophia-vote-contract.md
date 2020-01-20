TUTORIAL: How to create a Sophia contract for a simple voting aepp?
====
## Tutorial Overview
This tutorial takes a look at a smart contract, written in Sophia ML for a voting aepp but also provides another fundamental and deeper understanding about general basics of the language itself.

## Prequisites
- Installed **docker** (take a look at [this site](https://docs.docker.com/compose/install/) in case you didn't)
- Installed **aecli** (take a look at [this tutorial](https://github.com/aeternity/tutorials/blob/master/account-creation-in-ae-cli.md#installing-aecli) to remind yourself on installing the javascript version of aecli)
- Installed **aeproject** (take a look at [this section](https://github.com/aeternity/aepp-aeproject-js))


## Setting up project and development environment 
First we have to initialize our project where we write our smart contract. In order to do this we are going to use `aeproject init`.

## Smart contract
In Sophia ML we have a state which is the place to store data on-chain - and it is the only part in the smart contract that can be mutated (overwritten).

The first thing we are going to do is to define our variables and types that we use in the smart contract. Besides that we are going to define the `init()`function, which is the constructor basically, if we would compare this to a Solidity smart contract.

````
contract Vote =

   record candidates = {
      voters: list(address) }

   record state = {
      votes: map(address, candidates) }

   stateful entrypoint init() : state = {
      votes = { } }
`````
The `candidate` record stores it's **voters** in a **list** of addresses. The `state` record stores all the **votes** in a mapping (which is basically a key-value pair) of address to candidate record.

We start with the first functionality for the aepp – adding candidates:

`````
stateful entrypoint add_candidate(candidate: address) : bool =
      is_candidate(candidate)
      true
``````
What this function does is passing the candidate to the `is_candiate()` function – taking a candidate’s address as a parameter. Then the function checks if there is a candidate defined with this address and saves it to the **votes** mapping in the state with the initial empty list of voters (in case if is not).

Here are the helper functions we are going to use for this:

`````
stateful function is_candidate(candidate: address) =
   let candidate_found = lookup_by_address(candidate, state.votes, { voters = [] })
   if (size(candidate_found.voters) == 0)
      put(state{
         votes[candidate] = { voters = [] } })

function lookup_by_address(k : address, m, v) =
   switch(Map.lookup(k,m))
      None => v
      Some(x) => x
``````
We need to do this because in Sophia ML we don not have a default value of 0x0/false as in Solidity for example. So to be able to cast a vote, we need to have add the candidates first whom we can vote for.


**If we do not add the candidate first before voting, we will hit out of gas error.**

Next we create the vote function which looks basically like this:
`````
stateful entrypoint vote(candidate: address) : bool =
   is_candidate(candidate)
   let new_votes_state = Call.caller :: state.votes[candidate].voters
   put(state{
      votes[candidate].voters = new_votes_state })
   true
``````

We access the transaction initiator’s address by the built in `Call.caller` and prepend it `::` to the current list of voters.

The last step is to create a `get votes count` function.
`````
entrypoint count_votes(candidate : address) : int =
   size(state.votes[candidate].voters)  
`````

We need to make use of a `size` function which we define as a helper function below. Here is the code:
`````
function size(l : list('a)) : int = size'(l, 0)
`````

This is where things get a bit more complicated, so I will try to explain what is happening here actually.

Since in Sophia ML we don not have `.count` or `.length` to get the length of a list, we need to make ourselves a helper function which makes a recursion and iterates over the list while incrementing a counter.

The `size` function is defined to accept a list of `'a` which is the convention for a generic type, and a return type `int` . In the function’s body we are calling the `size'` function while passing the list and an initial value for the counter.
``````
function size'(l : list('a), x : int) : int =
   switch(l)
      [] => x
      _ :: l' => size'(l', x + 1)
``````
And here the magic happens: We use the `switch` statement with 2 cases  `[] => x` – which returns the value of the counter and breaks the recursion in case the list is empty. The last part `_ :: l' => size'(l', x+1)` matches pattern and separates the first element from the list and the remainder. Then it passes recursively the list’s remainder to the same function, while incrementing the counter.

The final smart contract code looks like this in the end:

```````
contract Vote =

   record candidates = {
      voters: list(address) }

   record state = {
      votes: map(address, candidates) }

   stateful entrypoint init() : state = {
      votes = { } }

   stateful entrypoint vote(candidate: address) : bool =
      is_candidate(candidate)
      let new_votes_state = Call.caller :: state.votes[candidate].voters
      put(state{
         votes[candidate].voters = new_votes_state })
      true

   entrypoint count_votes(candidate : address) : int =
      size(state.votes[candidate].voters)  

   function size(l : list('a)) : int = size'(l, 0)
   
   function size'(l : list('a), x : int) : int =
      switch(l)
         [] => x
         _ :: l' => size'(l', x + 1)

   stateful entrypoint add_candidate(candidate: address) : bool =
      is_candidate(candidate)
      true

   stateful function is_candidate(candidate: address) =
      let candidate_found = lookup_by_address(candidate, state.votes, { voters = [] })
      if (size(candidate_found.voters) == 0)
         put(state{
            votes[candidate] = { voters = [] } })

   function lookup_by_address(k : address, m, v) =
      switch(Map.lookup(k,m))
         None => v
         Some(x) => x
`````````

## Conclusion
It is fairly simple to create a basic aepp on æternity blockchain using Sophia ML. In our case with the ae-vote we stumbled upon some tricky parts like the recursive iteration which we had to make above. But it gets easier with time if you familiarize yourself with the language. In case  you encounter any problems feel free to contact us through the [æternity Forum](https://forum.aeternity.com/c/development) please.
         



