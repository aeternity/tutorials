# TUTORIAL: How to create a Sophia fungible token contract?
## Tutorial Overview
This tutorial takes a look at tokens and explains the features and functions of fungible tokens, while provides an understanding of what they are and how developers can work with them.
## Prerequisites
- Installed **aecli** (take a look at [this tutorial](https://github.com/aeternity/tutorials/blob/master/account-creation-in-ae-cli.md#installing-aecli) to to remind yourself on installing the javascript version of aecli)
- Installed **aeproject** (take a look at [this section](https://github.com/aeternity/tutorials/blob/master/smart-contract-deployment-in-aeproject.md#installing-aeproject))
- Account with testnet/edgenet funds ([How to Get Testnet Funds](https://github.com/aeternity/tutorials/blob/master/get-testnet-tokens.md) - referencing tutorial)
## Fungible token contract
Any token contract is a smart contract that contains a map of account addresses and a number called balance. The balance represents a unit of value that is defined by the contract creator. One token contract might use balances to represent physical objects, while another might represent monetary value. Third one might even represent the holder’s reputation. The unit of this balance is commonly called a token.
Fungible tokens, are such tokens that have one and the same value regardless of which instance of the token is used. AE is a fungible token - meaning that if I give you 1 AE and you give me 1 AE, in essence no value was exchanged.
Fungible token contracts come with a number of functions to allow users to find out the balances of accounts, as well as to transfer them under varying conditions.

## Content
In this tutorial we will:
- create a project folder and initialize its structure via *aeproject*;
- write a Sophia fungible token contract on a step-by-step approach;
- deploy a newly created contract to sdk-edgenet via *aeproject*;
- test the execution of our contract functions through *aecli*;

## Building Sophia fungible token contract

### Getting started

The first thing we need to do is create a project folder and initialize its structure.

Let's create a folder for our project:
```
mkdir ~/sophiaFungibleToken
```

Go to a newly created folder ```cd ~/sophiaFungibleToken``` and initialize the æpp with:
```
aeproject init
```

The init command creates an æpp structure with several folders and scripts. 
Let's create a new file **FungibleToken.aes** in *contracts* folder and start writing our fungible token contract code.

*Keep in mind that the Sophia indentation should be two spaces.*

The first contract line starts with the keyword ```contract```, followed by the name of the contract, in this case **FungibleToken**.

```
contract FungibleToken =
```

We need to indent the next code sections.

Let's define our contract mutable state:

```
record state = {
  owner            : address,
  totalSupply      : int,
  balances         : map(address, int),
  allowed          : map((address,address), int)}
```

- owner - the address which owns the funds;
- totalSupply - total number of tokens in existence;
- balances - a map of account addresses and their balances;
- allowed - a map which holds the amount of tokens that an owner allowed to a spender

In the next step we are going to write our contract *init()* function.
The init function is pure and returns the initial state as its return value. At contract creation time, the init function is executed and its result is stored as the contract state. You can look at the init function as a constructor. 

```
public stateful function init() = {
  owner = Call.caller,
  totalSupply = 0,
  balances = {},
  allowed = {}}
```

For now, our Sophia contract code looks like this: 
```
contract FungibleToken =
  record state = {
    owner            : address,
    totalSupply      : int,
    balances         : map(address, int),
    allowed          : map((address,address), int)}

  public stateful function init() = {
    owner = Call.caller,
    totalSupply = 0,
    balances = {},
    allowed = {}}
```

### Helper functions

We will add some private helper functions in order to make our contract easier to read:

- **require** - evaluates the condition passed as first parameter and throws with the value of second parameter on false;
```
private function require(b : bool, err : string) =
  if(!b)
    abort(err)
```

- **add** - returns the sum of two integers, throws on overflow;
```
private function add(a : int, b : int) : int =
  let c : int = a + b
  require(c >= a, "Error")
  c
```
- **sub** - subtracts two unsigned integers and return the result, throws on overflow (i.e. if subtrahend is greater than minuend);
```
private function sub(a : int, b : int) : int =
  require(b =< a, "Error")
  a - b
```

- **onlyOwner** - throws if called by any account other than the owner
```
private function onlyOwner() =
  require(Call.caller == state.owner, "Only owner can mint!")
```

- **lookupByAddress** - checks if a specific address (the first parameter) exists in second parameter of type map, if it doesn't the function returns the third parameter passed to it;
```
private function lookupByAddress(k : address, m, v) =
  switch(Map.lookup(k, m))
    None    => v
    Some(x) => x
```

### Implementation of the fungible token

We will write a number of functions which will allow us to find out the balances of accounts as well as to transfer them from one account to another under varying conditions. These functions are described below:

- **balanceOf** - the function provides the number of tokens held by a given address. ***Note*** that anyone can query any address’ balance, as all data on the blockchain is public;

```
public function balanceOf(who: address) : int = lookupByAddress(who, state.balances, 0)
```

- **totalSupply** - the return value equals the sum of all balances;
```
public function totalSupply() : int = state.totalSupply
```

- **transfer** - the function transfers a number of tokens directly from the caller to another address;
```
public stateful function transfer(to: address, value: int) : bool =
  _transfer(Call.caller, to, value)
    
private stateful function _transfer(from: address, to: address, value: int) : bool =
  require(value > 0, "Value is sub zero")
  require(value =< balanceOf(from), "Not enough balance")
  require(to != #0, "Invalid address")

  put(state{
    balances[from] = sub(balanceOf(from), value),
    balances[to] = add(balanceOf(to), value)})

  true
```
- **transferFrom** and **approve** - two functions that allow to transfer a number of tokens using a two-step process. In the first step a token holder gives another address approval to transfer up to a certain number of tokens from his balance to an address of their choice. This approved amount is known as an allowance. The token holder uses approve() to provide this information;
```
public stateful function approve(spender: address, value: int) : bool =
  require(value > 0, "Value is sub zero")
  require(spender != #0, "Invalid spender address")

  put(state{allowed[(Call.caller,spender)] = value})

  true
```

```
public stateful function transferFrom(from: address, to: address, value: int) : bool =
  require(state.allowed[(from, Call.caller)] >= value, "Value is bigger than allowed")

  put(state{allowed[(from, Call.caller)] = sub(state.allowed[(from, Call.caller)], value)})
  _transfer(from, to, value)

  true
```

- **allowance** - the function provides the number of tokens allowed to be transferred from a given address by another given address;

```
public function allowance(owner: address, spender: address) : int =
  switch(Map.lookup((owner, spender), state.allowed))
    None    => 0
    Some(x) => x
```

- **increaseAllowance** - increases the amount of tokens that an owner allowed to a spender;
```
public stateful function increaseAllowance(spender: address, addedValue: int) : bool =
  require(spender != #0, "Invalid address")
  put(state{allowed[(Call.caller, spender)] = add(state.allowed[(Call.caller,spender)], addedValue)})

  true
```

- **decreaseAllowance** - decrease the amount of tokens that an owner allowed to a spender;

```
public stateful function decreaseAllowance(spender: address, subtractedValue: int) : bool =
  require(spender != #0, "Invalid address")
  put(state{allowed[(Call.caller,spender)] = sub(state.allowed[(Call.caller,spender)], subtractedValue)})

  true
```

- **mint** - this function mints `value` number of the token and assigns them to `account`;

```
public stateful function mint(account: address, value: int) : bool =
  onlyOwner()
  require(account != #0, "Invalid address")

  put(state{totalSupply = add(state.totalSupply, value),
    balances[account] = add(balanceOf(account), value)})

  true
```

- **burn** - this function removes(known as burning) some number of tokens from the balance of a given account;

```
public stateful function burn(value: int) : bool =
  require(balanceOf(Call.caller) >= value, "Burned amount is less than account balance")

  put(state{totalSupply = sub(state.totalSupply, value),
    balances[Call.caller] = sub(balanceOf(Call.caller), value)})

  true
```

### Sophia fungible token contract

Our Sophia fungible token is ready. The contract code:

```javascript=
contract FungibleToken =
  record state = {
    owner            : address,
    totalSupply      : int,
    balances         : map(address, int),
    allowed          : map((address,address), int)}

  public stateful function init() = {
    owner = Call.caller,
    totalSupply = 0,
    balances = {},
    allowed = {}}

  private function lookupByAddress(k : address, m, v) =
  	switch(Map.lookup(k, m))
	  None    => v
	  Some(x) => x

  public function totalSupply() : int = state.totalSupply

  public function balanceOf(who: address) : int = lookupByAddress(who, state.balances, 0)

  public function allowance(owner: address, spender: address) : int =
    switch(Map.lookup((owner, spender), state.allowed))
	  None    => 0
	  Some(x) => x

  public stateful function transfer(to: address, value: int) : bool =
    _transfer(Call.caller, to, value)

  public stateful function approve(spender: address, value: int) : bool =
    require(value > 0, "Value is sub zero")
    require(spender != #0, "Invalid spender address")

    put(state{allowed[(Call.caller,spender)] = value})

    true

  private stateful function _transfer(from: address, to: address, value: int) : bool =
    require(value > 0, "Value is sub zero")
    require(value =< balanceOf(from), "Not enough balance")
    require(to != #0, "Invalid address")

    put(state{
      balances[from] = sub(balanceOf(from), value),
      balances[to] = add(balanceOf(to), value)})

    true

  public stateful function transferFrom(from: address, to: address, value: int) : bool =
    require(state.allowed[(from, Call.caller)] >= value, "Value is bigger than allowed")

    put(state{allowed[(from, Call.caller)] = sub(state.allowed[(from, Call.caller)], value)})
    _transfer(from, to, value)

    true

  public stateful function increaseAllowance(spender: address, addedValue: int) : bool =
    require(spender != #0, "Invalid address")
    put(state{allowed[(Call.caller, spender)] = add(state.allowed[(Call.caller,spender)], addedValue)})

    true

  public stateful function decreaseAllowance(spender: address, subtractedValue: int) : bool =
    require(spender != #0, "Invalid address")
    put(state{allowed[(Call.caller,spender)] = sub(state.allowed[(Call.caller,spender)], subtractedValue)})

    true

  public stateful function mint(account: address, value: int) : bool =
    onlyOwner()
    require(account != #0, "Invalid address")

    put(state{totalSupply = add(state.totalSupply, value),
      balances[account] = add(balanceOf(account), value)})

    true

  public stateful function burn(value: int) : bool =
    require(balanceOf(Call.caller) >= value, "Burned amount is less than account balance")

    put(state{totalSupply = sub(state.totalSupply, value),
      balances[Call.caller] = sub(balanceOf(Call.caller), value)})

    true

  private function add(a : int, b : int) : int =
    let c : int = a + b
    require(c >= a, "Error")
    c

  private function sub(a : int, b : int) : int =
    require(b =< a, "Error")
    a - b

  private function require(b : bool, err : string) =
    if(!b)
      abort(err)

  private function onlyOwner() =
    require(Call.caller == state.owner, "Only owner can mint!")

```

## Deploying and testing 

We will use aeproject to deploy our token to edgenet. The sample deployment script is scaffolded in deployment folder - deploy.js.
Let's configure our deployment script. We have to change the contract path from ```./contracts/ExampleContract.aes``` to ```./contracts/FungibleToken.aes```.  The **deploy.js** file should look like this:

```
const Deployer = require('aeproject').Deployer;

const deploy = async (network, privateKey) => {
	let deployer = new Deployer(network, privateKey);

	await deployer.deploy("./contracts/FungibleToken.aes");
};

module.exports = {
	deploy
};
```

Next step is to run our deploy command with a secret parameter which is the private key of wallet with edgenet funds(see here - [how to get testnet funds](https://dev.aepps.com/tutorials/get-testnet-tokens.html)). The command for depoying on the edgenet is: 

```
aeproject deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```

In order to get the secret(private) key of your account you can use the following command:

```
aecli account address my-ae-wallet --privateKey
```

- my-ae-wallet - the æternity account created via ```aecli account create <name> [options] ```
- privateKey - the optional parameter which shows a private(secret) key of the *my-ae-wallet* account;

The above command gives the following output information for the account created by me:

```
Your address is: ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
Your private key is: 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

Our *secretKey* is ```195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7``` and the execution of the deploy command for our account looks like this:

```
aeproject deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```
*Plese replace the <secretKey> with the private(secret) key of your account.*

And here is the structure of the expected output: 
```
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_2PnnRvuUSpAtkvdfn5tH1bqtu49WZcSbZc7j5LZPLemChTMx7Z',
  address: 'ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go',
  call: [Function],
  callStatic: [Function],
  createdAt: 2018-12-20T12:43:38.265Z }
Your deployment script finished successfully!
```

The property *address* from the above output is the address of deployed fungible token contract. In my case - **ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go**.
We will reference this address later, when calling the contract *mint* and *totalSupply* functions. 

Let's mint some tokens. As the token contract is deployed with our wallet, we can successfully call mint function using it. Mint takes 2 parameters - the account that will receive the created tokens and the amount that will be created.
Аeternity command line interface accepts parameters of type address as hex string. So we have to change our public key - in our case **ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx** to this format **0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7**.

In order to reformat our public key we will use the following command:

```
aecli crypto decode publicKey
```
*Please change the publicKey parameter with yours.*


```
aecli crypto decode ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
Decoded address (hex): a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

Note that we add the ```0x``` prefix to the new decoded address.

Interacting with a deployed contract is done using ```aecli contract call```. For instance, calling of the *mint* function of our fungible token contract looks like this:

```
aecli contract call <wallet_file> --password <wallet_password> 
mint bool <account_address> <created_token_amount> 
--contractAddress <deployed_contract_address> 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```  

So we want to mint 100 tokens to our address. In our case the above command looks like this:
```
aecli contract call ./my-ae-wallet --password 12345 
mint bool 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 100 
--contractAddress ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

*Please replace the wallet file and password with yours, the first parameter of mint function with your address and --contractAddress parameter with the address of your deployed contract.*

The result of the successful execution:

```
Contract address_________ ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go
Gas price________________ 1
Gas used_________________ 3703
Return value (encoded)___ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEyukdn
Return value (decoded)___ 1
Return remote type_______ word
```

Finally let we check the total supply of our fungible token contract:

```
aecli contract call <wallet_file> --password <wallet_password> 
totalSupply int 
--contractAddress <deployed_contract_address> 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

Here is the above command with our account and contract address details:

```
aecli contract call ./my-ae-wallet --password 12345 
totalSupply int 
--contractAddress ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

The result is: 
```
Contract address_________ ct_uMXpUDFsGiWst7ohxKznszC8W3vaxZc3DeeJGy5L9ERpcy6Go
Gas price________________ 1
Gas used_________________ 977
Return value (encoded)___ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGTTfQZM
Return value (decoded)___ 100
Return remote type_______ word
```

The decoded returned value is 100 - as much as we minted.

## Conclusion
The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).

