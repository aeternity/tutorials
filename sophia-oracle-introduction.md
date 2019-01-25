# TUTORIAL: Writing a "Hello, World" Contract in Sophia Using Oracles - introduction

## Tutorial overview
This tutorial aims to provide an introduction to Sophia's syntax and some of its features with a "Hello, world"-esque (Greeter contract) smart contract featuring æternity oracles. Following this tutorial should give the reader an idea of the basic process of writing Sophia smart contracts. The contract that we will be create in this tutorial will enable its callers to send a greeting message to an oracle and reply to those messages on behalf of the oracle. Ideally, readers should have a basic understanding of how oracles work, if not, feel free to read [this document](https://github.com/aeternity/protocol/blob/master/oracles/oracles.md).

Related tutorials:
[Deploying a Smart Contract on æternity with "aeproject"](smart-contract-deployment-in-aeproject.md)
[Call a deployed contract using the CLI](smart-contract-calling-in-ae-cli.md)
[Sophia Basics - Owning a Smart Contract and Owner Privileges](owning-a-smart-contract.md)

## Contract state and initialization
While Sophia is a functional language, contracts (although optional) can hold mutable state. For our example, we will be storing a reference to the oracle that will handle messages and send out responses to all of the greeting messages that have been sent its way. Let's begin by defining our contract body, its state and the `init` function that will set the initial state of our contract when the `Create` transaction is executed.

```
contract Greeter =
  record state =
    {greeter_oracle : oracle(string, string),
     greets: list((string, oracle_query(string, string)))}

  public function init() : state =
    let greeter_oracle : oracle(string, string) = register_oracle()
    {greeter_oracle = greeter_oracle, greets = []}
```

**What we have so far:**
We started our contract definition and gave it an appropriate name. We have also defined what our state will look like - it will be a `record`, which is a key-value data structure with fixed key names and typed values. This record has two fields, `greeter_oracle` which will hold a reference to an oracle object and `greets` which is a list of tuples that will pair oracle queries (in our case greeting messages) with the string representation of the address that makes the query. Keep in mind that we also have to specify the type of queries and responses for the oracle and its queries.

The state structure has been decided, but we also *need* to set the initial state of our contract.
Every Sophia contract that intends to have some mutable state also has to implement an `init` function. In our case, we have to register the oracle and store it in the `greeter_oracle` field and also give the `greets` list some initial value - an empty list being the obvious choice (`[]`).

**The return value of functions in Sophia is the last expression of the function. The return value of the `init` function should be the state you want to set.**

The oracle registration happens when we call the `register_oracle` function, but we still haven't defined that, we'll do it in a moment. Notice, though, that we have specified what the return value of `init` is with the `:` syntax, and that we have defined a variable called `greeter_oracle` of type `oracle(string, string)`. When it comes to types in Sophia, they can also be left out and we can have the compiler work them out for itself. So, `let greeter_oracle : oracle(string, string) = register_oracle()` can be rewritten as `let greeter_oracle = register_oracle()` and still have the same effect (this applies to functions and their arguments as well), but for the sake of descriptiveness, we're going to be specifying the type of parameters, variables and functions where applicable.

Let's add the missing `register_oracle` function:
```
  private function register_oracle() : oracle(string, string) =
    let query_fee : int = 10
    Oracle.register(Contract.address, query_fee, RelativeTTL(200))
```

 **A few things to pay attention to here:**

* the function is `private`, meaning that it can be used only inside the contract, and that it can't be called by a `Call` transaction
* the return type of the function is `oracle(string, string)`, this way we are saying that the `Oracle.register` call in this function will return an oracle of that type.
Alternatively, `Oracle.register(Contract.address, 10, RelativeTTL(200)) : oracle(string, string)` could be used instead, if we wanted to avoid the use of a separate function for registering the oracle.
* the `Oracle.register` function normally takes 4 parameters, one of them being optional. The optional parameter is a signature that proves that the contract may register the provided address as an oracle operator, but since we are going to be registering the contract itself (having `Contract.address` as the first parameter), we don't need to provide that signature.
* the other two parameters are query fee which specifies the amount that should be paid to the oracle when querying and the TTL (time to live) of the oracle object. In this case, the TTL is relative, which means that the oracle will expire 200 generations after it has been registered.

## Interacting with the contract
The code we have so far will register our oracle, but we still can't interact with it. For this reason, we're going to write a function that sends a message of our choice to the oracle in the form of a query:

```
  public stateful function greet_oracle(message : string) =
    let query : oracle_query(string, string) =
      Oracle.query(state.greeter_oracle, message, 10, RelativeTTL(50), RelativeTTL(50))
    let caller_address : string = Address.to_str(Call.caller)
    put(state{greets @ g = (caller_address, query) :: g})
```

First thing to notice is that besides being `public`, meaning that it can be called from the outside, the function is also `stateful`. Any function that modifies the contract's state **must** be declared as `stateful`. We're going to be passing our message as an argument of type `string`, as expected by the oracle. Now, there are a few important things to look at in the following lines. Firstly, we're going to be making a query to the oracle that we registered previously and store the reference to that query in a variable. The data of that query will of course be the message that we pass as an argument. We're also going to respect the fee required by our oracle. The two TTLs that are being passed respectively are for the time (in key blocks) during which our query object will be available for an answer and the time during which the response will be retrievable from the blockchain's state tree.

After that, we are calling the builtin function `put`, which modifies the state of the contract. Since our state is a `record`, we are going to use the update syntax for records and maps to update it. `state{greets @ g = (caller_address, query) :: g}` translates to: the field `greets` of the record `state` will now have a value of `(caller_address, query) :: g`. The odd thing here is the `@` syntax. This is a way of binding the current value of the field before the `@` to the name provided after it. It could also be written as `state{greets = (caller_address, query) :: state.greets}`. As for `(caller_address, query) :: g`, this is the syntax for prepending a new element to a list. If we look at the initial definition of our state, we said that it will keep track of queries and addresses that make them in a list. So, we take the `query`, pair it with the string `caller address` and add it to the current list that is in the state.

## Responding to the greetings
Now that we are able to query our oracle, we should also add logic to respond to those queries. We will have to work with a recursive function that iterates through all of the queries and responds to them. To make it a bit more complicated, we will make it so that the oracle responds only to certain greets, let's say "Hello", "Hi" and "Greetings".

Let's begin with the public function that will start the recursive calls:
```
public function respond_to_greets() =
    respond_to_greets'(state.greets)
```

Very straightforward. Calling this function will call `respond_to_greets'` (Sophia doesn't allow you to have multiple functions with the same name) and will pass the `greets` that are in the state. Now for the recursive function:

```
  private function respond_to_greets'(greets : list((string, oracle_query(string, string)))) =
    switch(greets)
      (caller_address, query) :: rest =>
        respond_to_greet(caller_address, query)
        respond_to_greets'(rest)
      [] =>
        0
```
We start off by checking what the current list is with `switch(greets`). A list can be matched on its head and tail with the `::` syntax, similar to the prepend syntax. In our case, we pattern match on the head of the list and "extract" the address and query from the tuple, we also name the tail `rest`. After that, we call `respond_to_greet` (not yet defined) and pass the `caller_address` and `query` from above as an argument. When we are done with responding to the query, the function calls itself in order to continue and the `rest` of the queries are passed. If the list is empty, that means that we are done with the responses and the recursion should come to an end - return `0` since we have to return something.

Finally, let's implement `respond_to_greet`:
```
  private function respond_to_greet(caller_address : string, query : oracle_query(string, string)) =
    let greet : string = Oracle.get_question(state.greeter_oracle, query)
    let greet_is_valid : bool = greet == "Hello" || greet == "Hi" || greet == "Greetings"
    if(greet_is_valid)
      let comma_space_address : string = String.concat(", ", caller_address)
      let response : string = String.concat(greet, comma_space_address)
      Oracle.respond(state.greeter_oracle, query, response)
```

Here we define a `string` variable `greet` that will store the greet from each query after getting it with the `Oracle.get_question` function. We will also use a variable called `greet_valid` which is the result of a boolean expression that tells us is if the greet is one of the predefined messages we mentioned before. For the final lines of our contract, we check if the message is valid by using the well known `if` construct. If the greet was indeed valid, we will respond to it by using the oracle that is in the contract state. The response itself will use the same greet but it will also include the address of the sender which will make it a bit more personal. We will be using the `String.concat` function to build the response string using two variables. As an end result, a user that greets the oracle with "Hi" and has address of "nhVtEXk8hrGAE6v6jn9mQKSau1PacAAJWfumAjWwGsrY" will receive "Hi, nhVtEXk8hrGAE6v6jn9mQKSau1PacAAJWfumAjWwGsrY" as a response.

To inspect the queries of an oracle and their responses use the following node endpoints:
 * https://sdk-testnet.aepps.com/v2/oracles/{oracle_address}/queries for contracts deployed in the `testnet`
 * https://sdk-mainnet.aepps.com/v2/oracles/{oracle_address}/queries for contracts deployed in the `mainnet`
 * https://localhost:3013/v2/oracles/{oracle_address}/queries for locally deployed contracts

 In this example we used the contract account as the oracle owner, this means that the oracle address of a contract with an address of `ct_2LfyxMmZvShtED9MmKhLUUyBo3Y5AQNDr5MVmnuwUNaqxQ8sNS` will be `ok_2LfyxMmZvShtED9MmKhLUUyBo3Y5AQNDr5MVmnuwUNaqxQ8sNS` (only the prefix is different).

 Keep in mind that queries and responses are `base64` encoded.

Here is what the complete contract looks like:

```
contract Greeter =
  record state =
    {greeter_oracle : oracle(string, string),
     greets: list((string, oracle_query(string, string)))}

  public function init() : state =
    let greeter_oracle : oracle(string, string) = register_oracle()
    {greeter_oracle = greeter_oracle, greets = []}

  public stateful function greet_oracle(message : string) =
    let query : oracle_query(string, string) =
      Oracle.query(state.greeter_oracle, message, 10, RelativeTTL(50), RelativeTTL(50))
    let caller_address : string = Address.to_str(Call.caller)
    put(state{greets @ g = (caller_address, query) :: g})

  public function respond_to_greets() =
    respond_to_greets'(state.greets)

  private function respond_to_greets'(greets : list((string, oracle_query(string, string)))) =
    switch(greets)
      (caller_address, query) :: rest =>
        respond_to_greet(caller_address, query)
        respond_to_greets'(rest)
      [] =>
        0

  private function respond_to_greet(caller_address : string, query : oracle_query(string, string)) =
    let greet : string = Oracle.get_question(state.greeter_oracle, query)
    let greet_is_valid : bool = greet == "Hello" || greet == "Hi" || greet == "Greetings"
    if(greet_is_valid)
      let comma_space_address : string = String.concat(", ", caller_address)
      let response : string = String.concat(greet, comma_space_address)
      Oracle.respond(state.greeter_oracle, query, response)

  private function register_oracle() : oracle(string, string) =
    Oracle.register(Contract.address, 10, RelativeTTL(200))
```

## Conclusion
We've written a contract that covers some of the basic and not so basic features of Sophia. There is definitely room for improvement so feel free to play around with it. For example, maybe we want to protect the contract and only enable the person who deployed it to respond to queries. Another thing that comes to mind is that our state can grow without any limitation - try implementing some sort of cleanup mechanism that will clear the greet list after a certain amount of blocks.

For more tutorials click [here](https://dev.aepps.com/tutorials/README.html)

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development)
