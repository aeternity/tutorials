# TUTORIAL: How to create a Sophia contract for a simple voting aepp

## Tutorial Overview

This tutorial takes a look at a smart contract, written in Sophia ML for a voting aepp but also provides another fundamental and deeper understanding about general basics of the language itself.

## Prequisites

- Installed **docker** (take a look at [this site](https://docs.docker.com/compose/install/) in case you didn't)
- Installed **aecli** (take a look at [this tutorial](https://github.com/aeternity/tutorials/blob/master/account-creation-in-ae-cli.md#installing-aecli) to remind yourself on installing the javascript version of aecli)
- Installed **aeproject** (take a look at [this section](https://github.com/aeternity/aepp-aeproject-js))

## Setting up project and development environment

First we have to initialize our project where we write our smart contract. In order to do this we are going to use `aeproject init`.

## Smart contract

In Sophia we have a state which is the place to store data on-chain - it is the only part in the smart contract that can be mutated (overwritten).

The first thing we are going to do is to define the state variables and types that we will use in the smart contract. Besides that we are going to define the `init()`function, which is a constructor.

```sophia
contract Vote =

   record candidates = {
      voters: list(address),
      exist: bool}

   record state = {
      votes: map(address, candidates) }

   entrypoint init() : state = {
      votes = { } }
```

The `candidate` record stores it's **voters** in a **list** of addresses. The `state` record stores all the **votes** in a mapping (which is basically a key-value pair) of address to candidate record. The candidate record has a field, exist, that will allow us to check the existence of a candidate in the state record.

We start with the first functionality for the aepp – adding candidates:

```sophia
stateful entrypoint add_candidate(candidate: address) =
   if (!(is_candidate'(candidate)))
      put(state{votes[candidate] = { voters = [], exist = true }})
```

What this function does is that it passes the new candidate's address to the `is_candiate` function. The `is_candidate` function then checks if there is a candidate defined with this address. If there isn't, `add_candidate` will save the new candidate's address it to the **votes** mapping in the state with an initial empty list of voters and exist field set to true.

Here are the helper functions we are going to use for this:

```sophia
entrypoint is_candidate(candidate: address) : bool =
   is_candidate'(candidate)

function is_candidate'(candidate: address) : bool =
   let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
   candidate_found.exist
```

Next we create the vote function which looks basically like this:

```sophia
stateful entrypoint vote(candidate: address) =
   if (is_candidate(candidate))
      let current_votes = state.votes[candidate].voters
      put(state{ votes[candidate].voters = Call.caller :: current_votes })
```

We access the transaction initiator’s address by the built in `Call.caller` and prepend it `::` to the current list of voters.

The last step is to create a `get votes count` function.

```sophia
entrypoint count_votes(candidate : address) : int =
   let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
   List.length(candidate_found.voters)
```

`Map.lookup_default` will either return the cadidate's record stored in the votes map of the state record if the candidate exist or a candidates's record with an empty list of voters and an exist field with a false value. We then use `List.length` to get the number of voters in the voters's list. You will need to include `List.aes` to use this standard library function.

The final smart contract code looks like this in the end:

```sophia
include "List.aes"

contract Vote =

   record candidates = {
      voters: list(address),
      exist: bool}

   record state = {
      votes: map(address, candidates) }

   entrypoint init() : state = {
      votes = { } }

   stateful entrypoint vote(candidate: address) =
      if (is_candidate(candidate))
        let current_votes = state.votes[candidate].voters
        put(state{ votes[candidate].voters = Call.caller :: current_votes })

   entrypoint count_votes(candidate : address) : int =
      let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
      List.length(candidate_found.voters)
  

   stateful entrypoint add_candidate(candidate: address) =
      if (!(is_candidate'(candidate)))
        put(state{votes[candidate] = { voters = [], exist = true }})

   entrypoint is_candidate(candidate: address) : bool =
      is_candidate'(candidate)

   function is_candidate'(candidate: address) : bool =
      let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
      candidate_found.exist

```

## Conclusion

It is fairly simple to create a basic aepp on æternity blockchain using Sophia ML. It even gets easier with time if you familiarize yourself with the language. In case  you encounter any problems feel free to contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
