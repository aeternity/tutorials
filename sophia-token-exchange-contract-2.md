# TUTORIAL: Simple Fungible Token Exchange Smart Contract - Part 2
## Tutorial Overview
The second part of the tutorial will show you how to interact with our ExchangeContract created in the previous article using the step-by-step approach. It will teach you how to use the aecli commands and the forgae tool to decode a base58 addresses, deploy a contract with and without parameter and call a deployed contract functions.

## Prerequisites
- Created the two contract ```FungibleToken.aes``` and ```ExchangeContract.aes``` from the first part - [Simple Fungible Token Exchange Smart Contract - Part 1](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-1.md)

## Content

In this tutorial we will deploy two fungible token contracts on edgenet and will deploy a simple fungible token exchange contract created in the previous part. The ```ExchangeContract``` will store the addresses of the token contracts and their exchange rate. The exchange function will transfer the first token type(hereafter called receivingToken) from caller to exchange contract and after that will transfer the second token type(hereafter called sendingToken) from exchange contract to caller, based on the stated rate. 

## Execution plan

I will show you two ways how to interact with the ```ExchangeContract```.
The first approach(Manual) will be shown in this tutorial and will include:
- step-by-step commands which will let us know in details how to:
    - decode a base58 address to hex string via **aecli**;
    - deploy a contract with and without parameters;
    - call a deployed contract functions through **aecli**;
    
The second approach(Scripted) will be shown in [Simple Fungible Token Exchange Smart Contract - Part 3](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-3.md) and will include:
- building a script which will pack all of the above commands in one place;

*Please start with the first approach. This will help you understand the next one.*

## Manual approach

### Deploying two fungible token contracts on sdk-edgenet
Let’s refresh our memory on how to deploy contract to edgenet:
```
forgae deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```

In the previous tutorial we deployed a token contract via forgae. We will use the same approach here.Let's update our deployment script which is located at ```~/exchangeContract/deployment/deploy.js```.

We have to change the contract path  from```./contracts/ExampleContract.aes``` to ```./contracts/FungibleToken.aes```.  The **deploy.js** file should now look like this:

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

#### Deploying Receiving token

Next step is to run our deploy command with a secret parameter which is the private key of wallet with edgenet funds(see here - [how to get testnet funds](https://dev.aepps.com/tutorials/get-testnet-tokens.html)). The command for deploying on the edgenet is: 

```
forgae deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```

In order to get the secret(private) key of your account you can use the following command:

```
aecli account address <my-ae-wallet> --privateKey
```
 where:

- `my-ae-wallet` - path to the the æternity account file created via ```aecli account create <name> [options] ```
- `privateKey` - the optional parameter which instructs aecli to show the private(secret) key of the *my-ae-wallet* account

The above command gives the following output information for the account created by me:

```
Your address is: ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
Your private key is: 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

My **secretKey** is: 
```
195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```
and the execution of the deploy command for my account looks like this:

```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```
*Please replace the <secretKey> with the private(secret) key of your own account.*


```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```
The structure of the output you can expect looks something like this:

```
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_qdxNu9fNMoCRS2cfGV1PBwSrKSX8uB313jkN8b6gMS5EEDgj4',
  address: 'ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN',
  call: [Function],
  callStatic: [Function],
  createdAt: 2018-12-31T08:09:07.787Z }
Your deployment script finished successfully!
```
Аeternity command line interface accepts parameters of type address as hex string. So we have to decode the base58 contract address to hex string and add prefix ```0x``` - in my case **ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN** to this format **0x28931779943d8b1ba9799fc73f0805567599abf6a0958e2463db9aa14ccc9685**.

```
aecli crypto decode ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN
Decoded address (hex): 28931779943d8b1ba9799fc73f0805567599abf6a0958e2463db9aa14ccc9685
```
Prepending `0x` and we get:
```
0x28931779943d8b1ba9799fc73f0805567599abf6a0958e2463db9aa14ccc9685
```
The above address will be used as the contract address function parameter via **aecli**.
Interacting with the functions of the deployed first token contract will be done using the base58 format - in my case `ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN`. 

#### Deploying Sending token

Let's repeat the deployment procedure for our second fungible token type(sendingToken).
The deployment script remains the same.
```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```
*Please replace the <secretKey> with the private(secret) key of your account.*

```
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_23pm1dDgTXoRy1zPUWnMGcwEHkbjAvcPzhRc9Mju9JicQ2J7gE',
  address: 'ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP',
  call: [Function],
  callStatic: [Function],
  createdAt: 2018-12-31T08:36:39.525Z }
Your deployment script finished successfully!
```
The second token type hex address representation in my case is:
```
aecli crypto decode ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP
Decoded address (hex): a732153f7ff0134e8632086ddcfc1b87cd9cc1e7f34c7a5968b1ae5d1dac353b
```
*Please replace ```ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP``` with the address of your deployed contract.*

```
0xa732153f7ff0134e8632086ddcfc1b87cd9cc1e7f34c7a5968b1ae5d1dac353b
```
The above address will be used for passing the contract address as function parameter via **aecli**.
Interacting with the functions of the deployed second token contract will be done using the base58 format - in my case ```ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP```.

#### Summary
Our two fungible token contracts have been deployed on sdk-edgenet. 

The hex addresses for the two deployed token contract in our case are:
```
Receiving token - 0x28931779943d8b1ba9799fc73f0805567599abf6a0958e2463db9aa14ccc9685
Sending token - 0xa732153f7ff0134e8632086ddcfc1b87cd9cc1e7f34c7a5968b1ae5d1dac353b
```

The base58 addresses:
```
Receiving token - ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN
Sending token - ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP
```

### Building simple fungible token exchange contract

Let's create a new file ```ExchangeContract.aes``` in the`contracts` folder.

```
touch ./contracts/ExchangeContract.aes
```

*Keep in mind that the Sophia indentation should be using two spaces.*

Firstly, we will create an interface for FungibleToken contract. It will allow us to perform the ```transfer``` and ```transferFrom``` functions. The interface contract includes the signatures of both functions:

```
contract FungibleToken =
  public function transfer : (address, int) => bool
  public function transferFrom : (address, address, int) => bool
``` 

Let's continue with ```ExchangeContract```. 
It will store:
- the addresses of the deployed fungible token contracts from the above section
- the exchange rate

At contract creation we will initialize the data.
```
contract FungibleToken =
  public function transfer : (address, int) => bool
  public function transferFrom : (address, address, int) => bool
  
contract ExchangeContract =
  record state = {
    receivingToken : FungibleToken,
    sendingToken   : FungibleToken,
    rate           : int}

  public stateful function init(receivingToken: FungibleToken, sendingToken: FungibleToken, rate: int) = {
    receivingToken = receivingToken,
    sendingToken   = sendingToken,
    rate           = rate}
```

The main function of our contracts is called ```exchange```. It accepts just one parameter - the amount of tokens which we want to exchange.
```
public function exchange(value: int) : bool =
  state.receivingToken.transferFrom(Call.caller, Contract.address, value)
  state.sendingToken.transfer(Call.caller, value * state._rate)
  true
```

There are two ways to send tokens from one address to another: 
- the transfer() function transfers a number of tokens directly from the message sender to another address;
- approve() and transferFrom() are two functions that allow the transfer to work using a two-step process. In the first step a token holder gives another address (usually of a contract) approval to transfer up to a certain number of tokens, known as an allowance. The token holder uses approve() to provide this information.

The first line of our ```exchange``` function transfers previously approved tokens(receivingToken) from caller to еxchange contract.
Next line transfers the second type tokens(sendingToken) from exchange contract to caller.

#### Sophia exchange contract code

The code shown here is our Sophia exchange contract:

```
contract FungibleToken =
  public function transfer : (address, int) => bool
  public function transferFrom : (address, address, int) => bool

contract ExchangeContract =
  record state = {
    receivingToken : FungibleToken,
    sendingToken   : FungibleToken,
    rate           : int}

  public stateful function init(receivingToken: FungibleToken, sendingToken: FungibleToken, rate: int) = {
    receivingToken = receivingToken,
    sendingToken   = sendingToken,
    rate           = rate}

  public function exchange(value: int) : bool =
    state.receivingToken.transferFrom(Call.caller, Contract.address, value)
    state.sendingToken.transfer(Call.caller, value * state._rate)
    true

```

### Deploying the Exchange Sophia contract

The exchange contract accepts three parameters at deployment time:
- receivingToken;
- sendingToken;
- rate;

Let's change our deploy script to add parameters. The parameters of the init functions are always passed as tuple. Here is how our new deploy script deploy function looks like:
```
const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey) => {
	let deployer = new Deployer(network, privateKey);
	const receivingTokenAddress = "0x28931779943d8b1ba9799fc73f0805567599abf6a0958e2463db9aa14ccc9685";
	const sendingTokenAddress = "0xa732153f7ff0134e8632086ddcfc1b87cd9cc1e7f34c7a5968b1ae5d1dac353b";
	const rate = 2;

	await deployer.deploy("./contracts/ExchangeContract.aes", undefined, `(${receivingTokenAddress}, ${sendingTokenAddress}, ${rate})`);
};

module.exports = {
	deploy
};
```

*Please replace the token addresses with yours.*

As you can see, we passed the token addresses and the exchange rate. Let's set the exchange rate to 2, which means if we want to exchange 5 token of the first type, we will receive 10 of the second type.

Let's run our deploy script:
```
forgae deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```
In my case the command is:
```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

```
===== Contract: ExchangeContract.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_2Leci2HU99U3H2kQkjACypLW7cRvX3dpzB8azRzrYww6S2CGKH',
  address: 'ct_en6Wh7dnntXQ6LYi3BQyGMuw2Vr6Ln1kcAcswDkziM53qpKup',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-02T12:47:23.868Z }
Your deployment script finished successfully!
```

I will decode the deployed contract address ```ct_en6Wh7dnntXQ6LYi3BQyGMuw2Vr6Ln1kcAcswDkziM53qpKup```:
```
aecli crypto decode ct_en6Wh7dnntXQ6LYi3BQyGMuw2Vr6Ln1kcAcswDkziM53qpKup
Decoded address (hex): 55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b
```
The result is ```0x55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b```. Please do the same for your exchange contract address.

### Interacting with the exchange contract
The exchange mechanism is as follows - the exchange contract accepts *receiving* tokens and returns *sending* token multiplied by the rate.

Here is a reminder of how looks the exchange function of the ExchangeContract:
```
public function exchange(value: int) : bool =
  state.receivingToken.transferFrom(Call.caller, Contract.address, value)
  state.sendingToken.transfer(Call.caller, value * state.rate)
  true
```

In order to be able to achieve token exchange, we have to:
- mint *receiving* tokens to our caller account;
- mint *sending* tokens to our ExchangeContract;
- give permission to ExchangeContract to spend some amount of the *receiving* tokens owned by caller account;
- execute the exchange function of ExchangeContract;
- check the caller account balance of the receiving and sending tokens;

First of all, let's mint some receiving tokens to our caller account. In order to do that we would need hex representation of our account. Here are the commands for my account:
```
aecli account address ./my-ae-wallet --password 12345
Your address is: ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
```
```
aecli crypto decode ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
Decoded address (hex): a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

Interacting with a deployed contract is done using ```aecli contract call```. For instance, calling of the *mint* function of our first fungible token contract looks like this:

```
aecli contract call <wallet_file> --password <wallet_password> 
mint bool <account_address> <created_token_amount> 
--contractAddress <deployed_contract_address> 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```  
In my case the above command looks like this:
```
aecli contract call ./my-ae-wallet --password 12345 
mint bool 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 100 
--contractAddress ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

We are calling the mint function of the first deployed fungible token with address - ```ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN```. We want to mint 100 tokens of the *receiving* type.

Our caller account has **100** tokens of type *receiving*.

Next step is to mint tokens of the *sending* type to ExchangeContract. We will call the mint function of the token contract with *sending* type(contract address - ```ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP```). The minted tokens will be assigned to the address of ExchangeContract, in my case - ```0x55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b```.
I will apple my addresses to the structure of mint function described above: 

```
aecli contract call ./my-ae-wallet --password 12345 
mint bool 0x55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b 
1000 
--contractAddress ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

*Please replace the address of your deployed ExchangeContract  as hex string and the address of deployed second token type(sending) as base58.*

The above command shows how to mint 1000 tokens of the second(sendingToken) type.

Our exchange contract has **1000** sending tokens now.

In order to be able to perform the transferFrom function of FungibleToken contract our Exchange contract has to have permission to spend some amount of the first token type(receiving).

```
aecli contract call ./my-ae-wallet --password 12345 
approve bool 0x55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b 
50  
--contractAddress ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

The above command shows how we as caller with address ```0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7``` and as owner of **100** *receiving* tokens give permission to the ExchangeContract with address ```0x55c7479d0f0bf85b102c38cfd0a4551dad532bad4e4b3cc9bd761d0f7ba9924b``` to spend **50** of our *receiving* tokens.

Our account is the owner of **100** *receiving* tokens. Our goal is to call the exchange function of the Exchange contract and to receive tokens of the *sending* type based on our passed amount and the exchange rate.

The execution of the exchange function is as follows: 
```
aecli contract call ./my-ae-wallet --password 12345 
exchange bool 5 
--contractAddress ct_en6Wh7dnntXQ6LYi3BQyGMuw2Vr6Ln1kcAcswDkziM53qpKup 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

We want to exchange **5** of our *receiving* tokens for *sending* ones.
So let's check the balance of our account.
First the *receiving* tokens balance:

```
aecli contract call ./my-ae-wallet --password 12345 
balanceOf int 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 
--contractAddress ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

```--contractAddress ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN ``` is the address of our *receiving* token contract.

The result of the above command is: 
```
Contract address_________ ct_JsRYM6WogCTyi7vMmKPR6K821JpT69bfxTpWUXCEUk9S7W8AN
Gas price________________ 1
Gas used_________________ 1920
Return value (encoded)___ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF+2YqXM
Return value (decoded)___ 95
Return remote type_______ word
```
The returned value is **95** *receiving* tokens. 5 of our previous amount of 100 tokens are transferred from caller to exchange contract with the first line of our ```exchange``` function - ```state._receivingToken.transferFrom(Call.caller, Contract.address, value)```. So let's check the balance of the second token type.

```
aecli contract call ./my-ae-wallet --password 12345 
balanceOf int 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 
--contractAddress ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

The result is:
```
Contract address_________ ct_2GdniJWzbmXqGsbodswki6eeqPHzb7evVkbPWSBWEdQWrkpapP
Gas price________________ 1
Gas used_________________ 1920
Return value (encoded)___ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABX4y1tk
Return value (decoded)___ 10
Return remote type_______ word
```
As you can see the returned value is **10** tokens of our second type(sendingToken).

Our account balance before exchange: 
- **100** *receiving* tokens;
- **0** *sending* tokens;

The balance after exchange:
- **95** *receiving* tokens;
- **10** *sending* tokens;


## What is next?
As you can see, this approach requires some degree of manual work. In the next [Part 3](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-3.md), we automate decoding and deployment through the use of forgae deployment scripts.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).

