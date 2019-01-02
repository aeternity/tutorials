# TUTORIAL: Smart Contract usage with the Javascript SDK

This tutorial explains how to use the æternity javascript SDK to create smart contracts and interact with them in the æternity network.

## Prerequisites

 - up to date npm and nodejs installed
 - private and public key for an account with some balance ([create an account](account-creation-in-ae-cli.md); [get testnet tokens](get-testnet-tokens.md))

## Setup

Create a project directory

```
mkdir aepp-smart-contract-usage-tutorial
cd aepp-smart-contract-usage-tutorial
```

## Define Example Contract

We define an example contract which features functions for reserving something if a minimum price is payed to the contract. The contract creator can later withdraw the payed tokens. Each line is commented with what it does. Sophia language definition can be found in [the protocol repository](https://github.com/aeternity/protocol/blob/master/contracts/sophia.md).

Save this as `ExampleContract.aes`.

```
// contract definition
contract ExampleContract =


  // state definition, with available count, set minimum price and the owner
  record state = { available_count : int, min_price : int, owner : address }


  // defining the require function later used to check calling constraints
  private function require(b : bool, err : string) =
    if(!b) abort(err)


  // function to initialize the contract, setting the available count, minimum price and the owner
  public function init(available_count' : int, min_price' : int) : state =
    { available_count = available_count', min_price = min_price', owner = Call.caller }


  // function for anyone to reserve some count requiring available count and the minimum price payed
  public stateful function reserve(count: int) =
  
    // requiring the price payed per item to be above or equal the set minimum price
    require(Call.value >= state.min_price * count, "Payed price is less than minimum required")
    let remaining_count = state.available_count - count
    
    // requiring count to be available
    require(remaining_count >= 0, "Less available then to be reserved")
    
    // applying remaining count to the state
    put(state{ available_count = remaining_count })


  // function to get the remaining count, can be statically called as it doesn't change state
  public function available_count() : int =
    state.available_count


  // function only to be called by the owner to withdraw all balance that was sent to the contract
  public stateful function owner_withdraw() : int=
  
    // requiring contract caller to be the registered owner
    require(Call.caller == state.owner, "Only owner can withdraw")
    let withdrawed_balance = Contract.balance
    
    // creating spend of the balance to the registered owner
    Chain.spend(state.owner, Contract.balance)
    
    // returning the balance that was withdrawed
    withdrawed_balance
```

## Nodejs Environment

1. Create a directory for the project and initialize it with npm `npm init -y`
this
2. Install the aepp-sdk dependency `npm install --save @aeternity/aepp-sdk`
this
3. Create an example entrypoint file `index.js`this in the directory. We will use this file later to run our code.

4. Setup example code structure in `index.js`, this does require the SDK dependency and setup an async function in which we can build the naming workflow
```
const fs = require('fs');
const {Universal} = require('@aeternity/aepp-sdk');

// function to hold all our example code
const main = async (name) => {
    // insert all the following here
};
```

5. Defining helper functions to later catch possible errors in a developer friendly was, add after the `const main = async (name) => {` line:

```
// function to log any errors
const logError = (error) => console.error(error);

// function to decode errors from contract calling
const decodeError = async (error) => {

    // results from the node need to be decoded to be human readable
    const decodedError = await client.contractDecodeData('string', error.returnValue).catch(logError);
    console.error('error:', decodedError.value);
};
```


## SDK Contracts Workflow


### 1. Initialize SDK client

Inside the main function, to create the SDK client referencing the æternity network node and the needed public and private keys, add after the previously added lines:

```
// initialize aeternity sdk client
const client = await Universal({
    url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    keypair: {
        publicKey: 'REPLACE_WITH_PUBLIC_KEY',
        secretKey: 'REPLACE_WITH_PRIVATE_KEY'
    },
    networkId: 'ae_uat', //replace with ae_mainnet for mainnet
    nativeMode: true
});
```

### 2. Reading the ExampleContract

To read the contract code, add after the previously added lines:

```
// read the ExampleContract.aes from same directory
const contract = fs.readFileSync('./ExampleContract.aes', 'utf-8');
```

### 3. Compiling the contract code

To compile the contract code, add after the previously added lines:

```
// use the client to compile the contract code, catching eventual errors
const compiled = await client.contractCompile(contract).catch(logError);

// logging the bytecode output to the console to see the code work
console.log('contract bytecode:', compiled.bytecode);
```

### 4. Deploying the contract bytecode to the blockchain

Having the compiled bytecode we can deploy the contract bytecode by adding this after the previously added lines:

```
// use the client to deploy the contract bytecode to the blockchain, catching eventual errors
// we have to pass the initState where we choose 10000 as the number of available count and 15 as minimum price per item
const deployed = await client.contractDeploy(compiled.bytecode, 'sophia', {initState: '(10000, 15)'}).catch(logError);

// logging the contract address to the console, this is later used to call function of the contract
console.log('deployed contract address:', deployed.address);
```


### 5. Calling the contract functions

To reserve an item in our contract we call the `reserve` function of the deployed contract. It can be called by anyone using the blockchain. Add after the previously added lines:

```
// call the contract 'reserve' function using the deployed address, 'sophia-address' is used to indicate we are calling using the address
// then we pass the arguments '(200)' as count that we want to reserve and as option the amount of tokens that should be added to the contract call
// in our case 200 (the count) times 15 (the minimum price set)
const calledReserve = await client.contractCall(deployed.address, 'sophia-address', deployed.address, 'reserve', {
    args: '(200)',
    options: {amount: 200 * 15}
}).catch(decodeError);

// we log if the contract call was successful, in this case if the success response is defined
console.log('reservation successful:', !!calledReserve);
```

Static calls are executed on the connected node directly and don't require a transaction or any fee, but can only be used for functions that won't manipulate state. It can be called by anyone using the blockchain. To static call the `available_count` function of the deployed contract, add after the previously added lines:

```
// call the 'available_count' function without any arguments, so '()' is used
const calledAvailableCount = await client.contractCallStatic(deployed.address, 'sophia-address', 'available_count', {args: '()'}).catch(logError);

// log the bytecode result to the console
console.log('available count bytecode:', calledAvailableCount.result);

// decode the result as 'int' datatype
const decodedAvailableCount = await client.contractDecodeData('int', calledAvailableCount.result).catch(logError);

// show the available_count output on the console as int
console.log('available count decoded:', decodedAvailableCount.value);
```

Unlike `available_count`, `owner_withdraw` modifies the state and requires a normal call, which consumes fee. This function is restricted to only be called by the original deployer. Add this code after the previously added lines:

```
// call the 'owner_withdraw' function without any arguments, so '()' is used, catch any possible errors
const calledWithdraw = await client.contractCall(deployed.address, 'sophia-address', deployed.address, 'owner_withdraw', {args: '()'}).catch(decodeError);

// log the bytecode result to the console
console.log('withdraw amount bytecode:', calledAvailableCount.result);

// decode the result as 'int' datatype
const decodedWithdraw = await client.contractDecodeData('int', calledWithdraw.result.returnValue).catch(logError);

// show the withdraw amount output on the console as int
console.log('withdraw amount decoded:', decodedWithdraw.value);
```

## Execution

Add `main();` in the end of the file, then run `node index.js` to compile, deploy and call the contract. It will show output similar to:

```
$ node index.js

contract bytecode: cb_+QosRgGgG4p7vWE9bVj27lWt6TtQ+a9tdJ2Cea6W6drj+mZ...
deployed contract address: ct_ParUEE4NVFWfnjvuWCq3gZ11PEDA6xXM6CVh1dx9vn147BbT9
reservation successful: true
available count bytecode: cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJkig/bmH
available count decoded: 9800
withdraw amount bytecode: cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJkig/bmH
withdraw amount decoded: 3002
```


## Final Example Project File

```
const fs = require('fs');
const {Universal} = require('@aeternity/aepp-sdk');

// function to hold all our example code
const main = async (name) => {
    // insert all the following here

    // function to log any errors
    const logError = (error) => console.error(error);

    // function to decode errors from contract calling
    const decodeError = async (error) => {

    // results from the node need to be decoded to be human readable
    const decodedError = await client.contractDecodeData('string', error.returnValue).catch(logError);
        console.error('error:', decodedError.value);
    };

    // initialize aeternity sdk client
    const client = await Universal({
        url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
        internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
        keypair: {
            publicKey: 'REPLACE_WITH_PUBLIC_KEY',
            secretKey: 'REPLACE_WITH_PRIVATE_KEY'
        },
        networkId: 'ae_uat', //replace with ae_mainnet for mainnet
        nativeMode: true
    });

    // read the ExampleContract.aes from same directory
    const contract = fs.readFileSync('./ExampleContract.aes', 'utf-8');

    // use the client to compile the contract code, catching eventual errors
    const compiled = await client.contractCompile(contract).catch(logError);

    // logging the bytecode output to the console to see the code work
    console.log('contract bytecode:', compiled.bytecode);


    // use the client to deploy the contract bytecode to the blockchain, catching eventual errors
    // we have to pass the initState where we choose 10000 as the number of available count and 15 as minimum price per item
    const deployed = await client.contractDeploy(compiled.bytecode, 'sophia', {initState: '(10000, 15)'}).catch(logError);

    // logging the contract address to the console, this is later used to call function of the contract
    console.log('deployed contract address:', deployed.address);


    // call the contract 'reserve' function using the deployed address, 'sophia-address' is used to indicate we are calling using the address
    // then we pass the arguments '(200)' as count that we want to reserve and as option the amount of tokens that should be added to the contract call
    // in our case 200 (the count) times 15 (the minimum price set)
    const calledReserve = await client.contractCall(deployed.address, 'sophia-address', deployed.address, 'reserve', {
        args: '(200)',
        options: {amount: 200 * 15}
    }).catch(decodeError);

    // we log if the contract call was successful, in this case if the success response is defined
    console.log('reservation successful:', !!calledReserve);


    // call the 'available_count' function without any arguments, so '()' is used
    const calledAvailableCount = await client.contractCallStatic(deployed.address, 'sophia-address', 'available_count', {args: '()'}).catch(logError);

    // log the bytecode result to the console
    console.log('available count bytecode:', calledAvailableCount.result);

    // decode the result as 'int' datatype
    const decodedAvailableCount = await client.contractDecodeData('int', calledAvailableCount.result).catch(logError);

    // show the available_count output on the console as int
    console.log('available count decoded:', decodedAvailableCount.value);


    // call the 'owner_withdraw' function without any arguments, so '()' is used, catch any possible errors
    const calledWithdraw = await client.contractCall(deployed.address, 'sophia-address', deployed.address, 'owner_withdraw', {args: '()'}).catch(decodeError);

    // log the bytecode result to the console
    console.log('withdraw amount bytecode:', calledAvailableCount.result);

    // decode the result as 'int' datatype
    const decodedWithdraw = await client.contractDecodeData('int',     calledWithdraw.result.returnValue).catch(logError);

    // show the withdraw amount output on the console as int
    console.log('withdraw amount decoded:', decodedWithdraw.value);

};

main();

```

## Further Documentation

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development). 
