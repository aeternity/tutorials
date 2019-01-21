# TUTORIAL: How to create a Sophia fungible token contract?
## Tutorial Overview
This tutorial takes a look at tokens and explains the features and functions of fungible tokens, while provides an understanding of what they are and how developers can work with them.
## Prerequisites
- Installed **aecli** (take a look at [this tutorial](https://github.com/aeternity/tutorials/blob/master/account-creation-in-ae-cli.md#installing-aecli) to to remind yourself on installing the javascript version of aecli)
- Installed **forgae** (take a look at [this section](https://github.com/aeternity/tutorials/blob/master/smart-contract-deployment-in-forgae.md#installing-forgae))
## Fungible token contract
Any token contract is a smart contract that contains a map of account addresses and a number called balance. The balance represents a unit of value that is defined by the contract creator. One token contract might use balances to represent physical objects, while another might represent monetary value. Third one might even represent the holder’s reputation. The unit of this balance is commonly called a token.
Fungible tokens, are such tokens that have one and the same value regardless of which instance of the token is used. AE is a fungible token - meaning that if I give you 1 AE and you give me 1 AE, in essence no value was exchanged.
Fungible token contracts come with a number of functions to allow users to find out the balances of accounts, as well as to transfer them under varying conditions.

## Content
In this tutorial we will:
- create a project folder and initialize its structure via *forgae*;
- write a Sophia fungible token contract on a step-by-step approach;
- deploy a newly created contract to the local network via *forgae*;
- test the execution of our contract functions through *aecli*;

## Building Sophia fungible token contract

### Getting started

The first thing we need to do is create a project folder and initialize its structure.

Let's create a folder for our project:
```
mkdir ~/sophia-fungible-token
```

Go to a newly created folder ```cd ~/sophia-fungible-token``` and initialize the æpp with:
```
forgae init
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
  total_supply     : int,
  balances         : map(address, int),
  allowed          : map((address,address), int)}
```

- owner - the address which owns the funds;
- total_supply - total number of tokens in existence;
- balances - a map of account addresses and their balances;
- allowed - a map which holds the amount of tokens that an owner allowed to a spender

In the next step we are going to write our contract *init()* function.
The init function is pure and returns the initial state as its return value. At contract creation time, the init function is executed and its result is stored as the contract state. You can look at the init function as a constructor. 

```
public stateful function init() = {
  owner = Call.caller,
  total_supply = 0,
  balances = {},
  allowed = {}}
```

For now, our Sophia contract code looks like this: 
```
contract FungibleToken =
  record state = {
    owner            : address,
    total_supply     : int,
    balances         : map(address, int),
    allowed          : map((address,address), int)}

  public stateful function init() = {
    owner = Call.caller,
    total_supply = 0,
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

- **only_owner** - throws if called by any account other than the owner
```
private function only_owner() =
  require(Call.caller == state.owner, "Only owner can mint!")
```

- **lookup_by_address** - checks if a specific address (the first parameter) exists in second parameter of type map, if it doesn't the function returns the third parameter passed to it;
```
private function lookup_by_address(k : address, m, v) =
  switch(Map.lookup(k, m))
    None    => v
    Some(x) => x
```

### Implementation of the fungible token

We will write a number of functions which will allow us to find out the balances of accounts as well as to transfer them from one account to another under varying conditions. These functions are described below:

- **balance_of** - the function provides the number of tokens held by a given address. ***Note*** that anyone can query any address’ balance, as all data on the blockchain is public;

```
public function balance_of(who: address) : int = lookup_by_address(who, state.balances, 0)
```

- **total_supply** - the return value equals the sum of all balances;
```
public function total_supply() : int = state.total_supply
```

- **transfer** - the function transfers a number of tokens directly from the caller to another address;
```
public stateful function transfer(to: address, value: int) : bool =
  transfer'(Call.caller, to, value)
    
private stateful function transfer'(from: address, to: address, value: int) : bool =
  require(value > 0, "Value is sub zero")
  require(value =< balance_of(from), "Not enough balance")
  require(to != #0, "Invalid address") // prevents burning of tokens by sending to address 0. Technically is a valid request

  put(state{
    balances[from] = sub(balance_of(from), value),
    balances[to] = add(balance_of(to), value)})

  true
```
- **transfer_from** and **approve** - two functions that allow to transfer a number of tokens using a two-step process. In the first step a token holder gives another address approval to transfer up to a certain number of tokens from his balance to an address of their choice. This approved amount is known as an allowance. The token holder uses approve() to provide this information;
```
public stateful function approve(spender: address, value: int) : bool =
  require(value > 0, "Value is sub zero")
  require(spender != #0, "Invalid spender address")

  put(state{allowed[(Call.caller,spender)] = value})

  true
```

```
public stateful function transfer_from(from: address, to: address, value: int) : bool =
  require(state.allowed[(from, Call.caller)] >= value, "Value is bigger than allowed")

  put(state{allowed[(from, Call.caller)] = sub(state.allowed[(from, Call.caller)], value)})
  transfer'(from, to, value)

  true
```

- **allowance** - the function provides the number of tokens allowed to be transferred from a given address by another given address;

```
public function allowance(owner: address, spender: address) : int =
  switch(Map.lookup((owner, spender), state.allowed))
    None    => 0
    Some(x) => x
```

- **increase_allowance** - increases the amount of tokens that an owner allowed to a spender;
```
public stateful function increase_allowance(spender: address, added_value: int) : bool =
  require(spender != #0, "Invalid address")
  put(state{allowed[(Call.caller, spender)] = add(state.allowed[(Call.caller,spender)], added_value)})

  true
```

- **decrease_allowance** - decrease the amount of tokens that an owner allowed to a spender;

```
public stateful function decrease_allowance(spender: address, subtracted_value: int) : bool =
  require(spender != #0, "Invalid address")
  put(state{allowed[(Call.caller,spender)] = sub(state.allowed[(Call.caller,spender)], subtracted_value)})

  true
```

- **mint** - this function mints `value` number of the token and assigns them to `account`;

```
public stateful function mint(account: address, value: int) : bool =
  only_owner()
  require(account != #0, "Invalid address")

  put(state{total_supply = add(state.total_supply, value),
    balances[account] = add(balance_of(account), value)})

  true
```

- **burn** - this function removes(known as burning) some number of tokens from the balance of a given account;

```
public stateful function burn(value: int) : bool =
  require(balance_of(Call.caller) >= value, "Burned amount is less than account balance")

  put(state{total_supply = sub(state.total_supply, value),
    balances[Call.caller] = sub(balance_of(Call.caller), value)})

  true
```

### Sophia fungible token contract

Our Sophia fungible token is ready. The contract code:

```javascript=
contract FungibleToken =
  record state = {
    owner            : address,
    total_supply     : int,
    balances         : map(address, int),
    allowed          : map((address,address), int)}

  public stateful function init() = {
    owner = Call.caller,
    total_supply = 0,
    balances = {},
    allowed = {}}

  private function lookup_by_address(k : address, m, v) =
  	switch(Map.lookup(k, m))
	    None    => v
	    Some(x) => x

  public function total_supply() : int = state.total_supply

  public function balance_of(who: address) : int = lookup_by_address(who, state.balances, 0)

  public function allowance(owner: address, spender: address) : int =
    switch(Map.lookup((owner, spender), state.allowed))
	    None    => 0
	    Some(x) => x

  public stateful function transfer(to: address, value: int) : bool =
    transfer'(Call.caller, to, value)

  public stateful function approve(spender: address, value: int) : bool =
    require(value > 0, "Value is sub zero")
    require(spender != #0, "Invalid spender address")

    put(state{allowed[(Call.caller,spender)] = value})

    true

  private stateful function transfer'(from: address, to: address, value: int) : bool =
    require(value > 0, "Value is sub zero")
    require(value =< balance_of(from), "Not enough balance")
    require(to != #0, "Invalid address") // prevents burning of tokens by sending to address 0. Technically is a valid request

    put(state{
      balances[from] = sub(balance_of(from), value),
      balances[to] = add(balance_of(to), value)})

    true

  public stateful function transfer_from(from: address, to: address, value: int) : bool =
    require(state.allowed[(from, Call.caller)] >= value, "Value is bigger than allowed")

    put(state{allowed[(from, Call.caller)] = sub(state.allowed[(from, Call.caller)], value)})
    transfer'(from, to, value)

    true

  public stateful function increase_allowance(spender: address, added_value: int) : bool =
    require(spender != #0, "Invalid address")
    put(state{allowed[(Call.caller, spender)] = add(state.allowed[(Call.caller,spender)], added_value)})

    true

  public stateful function decrease_allowance(spender: address, subtracted_value: int) : bool =
    require(spender != #0, "Invalid address")
    put(state{allowed[(Call.caller,spender)] = sub(state.allowed[(Call.caller,spender)], subtracted_value)})

    true

  public stateful function mint(account: address, value: int) : bool =
    only_owner()
    require(account != #0, "Invalid address")

    put(state{total_supply = add(state.total_supply, value),
      balances[account] = add(balance_of(account), value)})

    true

  public stateful function burn(value: int) : bool =
    require(balance_of(Call.caller) >= value, "Burned amount is less than account balance")

    put(state{total_supply = sub(state.total_supply, value),
      balances[Call.caller] = sub(balance_of(Call.caller), value)})

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

  private function only_owner() =
    require(Call.caller == state.owner, "Only owner can mint!")

```

## Deploying and testing 

We will use forgae to deploy our token to the local network. The sample deployment script is scaffolded in deployment folder - deploy.js.
Let's configure our deployment script. We have to change the contract path from ```./contracts/ExampleContract.aes``` to ```./contracts/FungibleToken.aes```.  The **deploy.js** file should look like this:

```
const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey) => {
	let deployer = new Deployer(network, privateKey);

	await deployer.deploy("./contracts/FungibleToken.aes");
};

module.exports = {
	deploy
};
```
### Start your local development network
Next step is to run our local network with the following command: 

```
forgae node
```
At the end of this command we will be presented with accounts that we can use in our tests.
The result of the above command should be:
```
===== Starting node =====
.Starting fungible-token_proxy_1 ...
Starting fungible-token_node3_1 ...
Starting fungible-token_proxy_1 ... done
Starting fungible-token_node1_1 ... done
Starting fungible-token_node2_1 ... done
.

.............................
===== Node was successfully started! =====
===== Funding default wallets! =====
Miner ------------------------------------------------------------
public key: ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
private key: bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca
Wallet's balance is 7667346699999999999999994
#0 ------------------------------------------------------------
public key: ak_fUq2NesPXcYZ1CcqBcGC3StpdnQw3iVxMA3YSeCNAwfN4myQk
private key: 7c6e602a94f30e4ea7edabe4376314f69ba7eaa2f355ecedb339df847b6f0d80575f81ffb0a297b7725dc671da0b1769b1fc5cbe45385c7b5ad1fc2eaf1d609d
Wallet's balance is 40000000000000000
#1 ------------------------------------------------------------
public key: ak_tWZrf8ehmY7CyB1JAoBmWJEeThwWnDpU4NadUdzxVSbzDgKjP
private key: 7fa7934d142c8c1c944e1585ec700f671cbc71fb035dc9e54ee4fb880edfe8d974f58feba752ae0426ecbee3a31414d8e6b3335d64ec416f3e574e106c7e5412
Wallet's balance is 40000000000000000
#2 ------------------------------------------------------------
public key: ak_FHZrEbRmanKUe9ECPXVNTLLpRP2SeQCLCT6Vnvs9JuVu78J7V
private key: 1509d7d0e113528528b7ce4bf72c3a027bcc98656e46ceafcfa63e56597ec0d8206ff07f99ea517b7a028da8884fb399a2e3f85792fe418966991ba09b192c91
Wallet's balance is 40000000000000000
#3 ------------------------------------------------------------
public key: ak_RYkcTuYcyxQ6fWZsL2G3Kj3K5WCRUEXsi76bPUNkEsoHc52Wp
private key: 58bd39ded1e3907f0b9c1fbaa4456493519995d524d168e0b04e86400f4aa13937bcec56026494dcf9b19061559255d78deea3281ac649ca307ead34346fa621
Wallet's balance is 40000000000000000
#4 ------------------------------------------------------------
public key: ak_2VvB4fFu7BQHaSuW5EkQ7GCaM5qiA5BsFUHjJ7dYpAaBoeFCZi
private key: 50458d629ae7109a98e098c51c29ec39c9aea9444526692b1924660b5e2309c7c55aeddd5ebddbd4c6970e91f56e8aaa04eb52a1224c6c783196802e136b9459
Wallet's balance is 40000000000000000
#5 ------------------------------------------------------------
public key: ak_286tvbfP6xe4GY9sEbuN2ftx1LpavQwFVcPor9H4GxBtq5fXws
private key: 707881878eacacce4db463de9c7bf858b95c3144d52fafed4a41ffd666597d0393d23cf31fcd12324cd45d4784d08953e8df8283d129f357463e6795b40e88aa
Wallet's balance is 40000000000000000
#6 ------------------------------------------------------------
public key: ak_f9bmi44rdvUGKDsTLp3vMCMLMvvqsMQVWyc3XDAYECmCXEbzy
private key: 9262701814da8149615d025377e2a08b5f10a6d33d1acaf2f5e703e87fe19c83569ecc7803d297fde01758f1bdc9e0c2eb666865284dff8fa39edb2267de70db
Wallet's balance is 40000000000000000
#7 ------------------------------------------------------------
public key: ak_23p6pT7bajYMJRbnJ5BsbFUuYGX2PBoZAiiYcsrRHZ1BUY2zSF
private key: e15908673cda8a171ea31333538437460d9ca1d8ba2e61c31a9a3d01a8158c398a14cd12266e480f85cc1dc3239ed5cfa99f3d6955082446bebfe961449dc48b
Wallet's balance is 40000000000000000
#8 ------------------------------------------------------------
public key: ak_gLYH5tAexTCvvQA6NpXksrkPJKCkLnB9MTDFTVCBuHNDJ3uZv
private key: 6eb127925aa10d6d468630a0ca28ff5e1b8ad00db151fdcc4878362514d6ae865951b78cf5ef047cab42218e0d5a4020ad34821ca043c0f1febd27aaa87d5ed7
Wallet's balance is 40000000000000000
#9 ------------------------------------------------------------
public key: ak_zPoY7cSHy2wBKFsdWJGXM7LnSjVt6cn1TWBDdRBUMC7Tur2NQ
private key: 36595b50bf097cd19423c40ee66b117ed15fc5ec03d8676796bdf32bc8fe367d82517293a0f82362eb4f93d0de77af5724fba64cbcf55542328bc173dbe13d33
Wallet's balance is 40000000000000000
```

### Run deploy script
The ```deploy``` command uses the *miner* account if we do not specify additional parameters. The details for the miner account are printed after successful execution of the ```forgae node``` command.
```
Miner ------------------------------------------------------------
public key: ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
private key: bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca
Wallet's balance is 7667346699999999999999994
```
Let's run the deploy command:
```
forgae deploy
```

Here is the structure of the expected output: 
```
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
  transaction: 'th_6X1YbK2XyhJfWW9JhUS4iZHjsRZXxgxpyXZHVMujJmmD8aSLG',
  address: 'ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-21T10:58:12.534Z }
Your deployment script finished successfully!
```

The property *address* from the above output is the address of deployed fungible token contract. In my case - **ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ**.
We will reference this address later, when calling the contract *mint* and *total_supply* functions. 
As you can see the owner of the contract is the public key of the *miner* account.

### Fungible token interaction

As the token contract is deployed with the miner account, we have to create a wallet file for it. 
We will use the ```aecli account save``` command. It generates a keypair file from private key and encrypt it by password.
The whole command looks like this:
```
aecli account save owner-wallet bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca --password 12345
```

- owner-wallet - the name of the wallet file;
- private key of the miner account;
- encryption password;

The result should be similar to:
```
    Wallet saved
    Wallet address________________ ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
    Wallet path___________________ ~/sophia-fungible-token/owner-wallet
```

Mint takes 2 parameters - the account that will receive the created tokens and the amount that will be created.
Аeternity command line interface accepts parameters of type address as hex string. So we have to change the public key of the miner - in our case **ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU** to this format **0xe9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca**.

In order to reformat our public key we will use the following command:

```
aecli crypto decode publicKey
```
```
aecli crypto decode ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
Decoded address (hex): e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca
```

Note that we add the ```0x``` prefix to the new decoded address.

Interacting with a deployed contract is done using ```aecli contract call```. For instance, calling of the *mint* function of our fungible token contract looks like this:

```
aecli contract call <wallet_file> --password <wallet_password> 
mint bool <account_address> <created_token_amount> 
--contractAddress <deployed_contract_address> 
-u http://localhost:3001 
--internalUrl http://localhost:3001/internal --networkId ae_devnet
```  

So we want to mint 100 tokens to our address. In our case the above command looks like this:
```
aecli contract call ./owner-wallet --password 12345 
mint bool 0xe9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca 100 
--contractAddress ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ 
-u http://localhost:3001 --internalUrl http://localhost:3001/internal 
--networkId ae_devnet
```

*Please replace the wallet file and password with yours, the first parameter of mint function with your address and --contractAddress parameter with the address of your deployed contract.*

The result of the successful execution:

```
----------------------Transaction info-----------------------
Contract address________________________ ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ
Gas price_______________________________ 1
Gas used________________________________ 3632
Return value (encoded)__________________ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEyukdn
Return value (decoded)__________________ 1
Return remote type______________________ word
```

Finally let we check the total supply of our fungible token contract:

```
aecli contract call <wallet_file> --password <wallet_password> 
totalSupply int 
--contractAddress <deployed_contract_address> 
-u http://localhost:3001 --internalUrl http://localhost:3001/internal
--networkId ae_devnet
```

Here is the above command with our account and contract address details:

```
aecli contract call ./owner-wallet --password 12345 
total_supply int 
--contractAddress ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ 
-u http://localhost:3001 --internalUrl http://localhost:3001/internal 
--networkId ae_devnet
```

The result is: 
```
----------------------Transaction info-----------------------
Contract address________________________ ct_2WySoghJDfuVeXnaW94bYDyk7jYrG6sovSMi4FQob8ofimz5jZ
Gas price_______________________________ 1
Gas used________________________________ 977
Return value (encoded)__________________ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGTTfQZM
Return value (decoded)__________________ 100
Return remote type______________________ word
```

The decoded returned value is 100 - as much as we minted.

## Conclusion
The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).

