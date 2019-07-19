# TUTORIAL: Sophia basics - owning a smart contract and owner privileges

## Tutorial Overview
This tutorial will teach you how one can access restrict a method to the deployer of the smart contract itself. This is a useful tool for defining critical business logic.
## Prerequisites
- Installed forgae - For installation steps refer to [this tutorial](smart-contract-deployment-in-forgae.md).

## 1. Prepare your environment

Before we begin coding up we should start by initializing an æpp project.
`forgae` is a npm package and binary executable allowing you to easily setup your development environment, run local nodes, compile and run deploy and test scripts.

### 1.1 forgae init

Let's create a new empty folder and initialize an æpp project.

```
mkdir ownable-project
cd ownable-project
forgae init
```

### 1.2 forgae node
Another thing we would require is a local working environment to develop against. 
We are going to use the one provided by `forgae`.
Just type in the following command:

```
forgae node
```

You can later stop the local node by typing in:
```
forgae node --stop
```

## 2. Writing the contract without access restriction

The next thing that we will do is to write a simple Sophia smart contract. This smart contract will have two functions - public and access restricted. In this section, we will not apply an access restriction yet, but we will write unit tests proving that the soon to be access restricted method is still called successfully by anyone.

### 2.1 Write the smart contract

Let's first write our `Restricted.aes` smart contract.

First create the contract file under contracts folder
```
touch ./contracts/Restricted.aes
```

`touch` creates a new file. This file can be edited via your favorite editor.

The following code goes inside this file:

```javascript=
contract Restricted =
  // Non access restricted method. Should be callable by any user successfully
  public function nonRestrictedFunction(i : int) : int =
    i

  // Access restricted method. Should be callable only by the owner/deployer
  public function restrictedFunction(i : int) : int =
    i
```

***Note***: keep formatting intact or things will break badly

As you can see this contract exposes two functions - both returning the number it has received as an argument. Note that the restricted function is **not** actually restricted yet.

### 2.2 Write unit tests to call the methods

In order to show the functionality we want we should write some unit tests.

The main three unit tests needed are:
1. The smart contract is being compiled and deployed successfully
2. The non-restricted method is freely called by non-owner (more on owners soon)
3. The restricted method cannot be called by non-owner

Add the following code to your `test/exampleTest.js` file.

#### The code

```javascript=
const Deployer = require('forgae-lib').Deployer;
const RESTRICTED_CONTRACT_PATH = "./contracts/Restricted.aes";

describe('Restricted', () => {

  let owner;
  let ownerKeyPair = wallets[0];
  let nonOwnerKeyPair = wallets[1];
  let ownerDeployedContract;

  before(async () => {
  
    // Create client object
    owner = new Deployer('local', ownerKeyPair.secretKey);
    
  })

  it('deploying successfully', async () => {
  
    // Deploy it
    ownerDeployedContract = owner.deploy(RESTRICTED_CONTRACT_PATH);
    
    // See if it has deployed correctly
    await assert.isFulfilled(ownerDeployedContract, 'Could not deploy the Restricted Smart Contract');
    
  })

  describe('Calling functions', () => {
  
    it('Should successfully call the non restricted method', async () => {
    
      ownerDeployedContract = await owner.deploy(RESTRICTED_CONTRACT_PATH);
      
      // Call the non restricted method
      const callNotRestrictedMethod = ownerDeployedContract.nonRestrictedFunction(2);
      
      await assert.isFulfilled(callNotRestrictedMethod, 'Calling the non restricted function failed');
      
      const callResult = await callNotRestrictedMethod;
      
      await assert.equal(callResult, 2, 'The returned data was not correct')
      
    })

    it('Should successfully call the restricted method', async () => {
    
      const nonOwnerCalling = await ownerDeployedContract.from(nonOwnerKeyPair.secretKey);
      
      // Call the restricted method from non owner
      const callRestrictedMethod = nonOwnerCalling.restrictedFunction(2);
      
      // It should be rejected as it is restricted to owner only
      await assert.isRejected(callRestrictedMethod);
      
    })
    
  })
  
})
```

As we have not yet implemented the restriction functionality the third test naturally fails.
Run the following command in the terminal:

```
forgae test
```

Output of `forgae test`:

```cmake=
===== Starting Tests =====


  Restricted
===== Contract: Restricted.aes has been deployed =====
    ✓ deploying successfully (10572ms)
    Calling functions
===== Contract: Restricted.aes has been deployed =====
      ✓ Should successfully call the non restricted method (15273ms)
      1) Should successfully call the restricted method


  2 passing (33s)
  1 failing

  1) Restricted
       Calling functions
         Should successfully call the restricted method:
     AssertionError: expected promise to be rejected but it was fulfilled with 2
  



1
There is no sophia test to execute.
[]
```

## 3. Access restrict the smart contract

In order to restrict a method to be called only by the deployer of the smart contract we would need to modify the smart contract to know who is their deployer. Below is how to do that.

### 3.1 Modify the smart contract

Let's first add state variable for the owner and set it on deploy time. On the second line of Restricted.aes put the following:

```javascript=
  record state = 
	  { owner : address }

  public stateful function init() = 
    { owner = Call.caller } // Initializing the owner to the deployer
    
```

This snippet initializes the state variable owner to the deployer of the contract.

With this done let's create a function that checks the caller of an arbitrary transaction and throws if it is not the owner:

```javascript=
  // Method to throw an exception if the expression exp is falsey
  private function require(exp : bool, err : string) = 
      if(!exp)
        abort(err)

  public function onlyOwner() : bool =
    // Require that the caller of this method
    // is actually the deployer
    require(state.owner == Call.caller, "The caller is different than the owner") 
    true
```

The onlyOwner function checks who has called the current transaction and reverts if it is not the deployer. Let's use it inside our restricted function. Modify the `restrictedFunction` method like this:

```javascript=
  // Access restricted method. Should be callable only by the owner/deployer
  public function restrictedFunction(i: int) : int =
    onlyOwner()
    i
```

This will ensure that the deployer is the only one that can call this method. Let's prove this through the unit tests.

## 3. Run the unit tests

Let's run the unit tests again:

```
forgae test
```

Output of `forgae test`:

```cmake=
===== Starting Tests =====


  Restricted
===== Contract: Restricted.aes has been deployed =====
    ✓ deploying successfully (10191ms)
    Calling functions
===== Contract: Restricted.aes has been deployed =====
      ✓ Should successfully call the non restricted method (15540ms)
      ✓ Should successfully call the restricted method (7372ms)


  3 passing (33s)

There is no sophia test to execute.
[]
```

All three tests pass successfully now!

## When to use it - Philosophical dilemma 

Although this is a very cool practice, the main reason for blockchain technology is to allow for decentralization of systems. Having an access being restricted to a certain user is somewhat similar to having a central point, although it is very well known. Use this technique with caution and think about possible implications of this elevated access.

## Conclusion

It is pretty easy to add access-restriction to your contract methods. In a few simple steps you can have administrative layer functionality. What are some use-cases for you to use it? Feel free to get in touch with us with your ideas!

*The æternity team will keep this tutorial updated with news. If you encounter any problems please contact us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).*

## Full code

contracts/Restricted.aes
```javascript=
contract Restricted =

  record state = 
	  { owner : address }

  public stateful function init() = 
    { owner = Call.caller } // Initializing the owner to the deployer

  // Method to throw an exception if the expression exp is falsey
  private function require(exp : bool, err : string) = 
      if(!exp)
        abort(err)

  public function onlyOwner() : bool =
    // Require that the caller of this method
    // is actually the deployer
    require(state.owner == Call.caller, "The caller is different than the owner") 
    true

  // Non access restricted method. Should be callable by any user successfully
  public function nonRestrictedFunction(i: int) : int =
    i

  // Access restricted method. Should be callable only by the owner/deployer
  public function restrictedFunction(i: int) : int =
    onlyOwner()
    i

```

test/exampleTest.js
```javascript=
const Deployer = require('forgae-lib').Deployer;
const RESTRICTED_CONTRACT_PATH = "./contracts/Restricted.aes";

describe('Restricted', () => {

  let owner;
  let ownerKeyPair = wallets[0];
  let nonOwnerKeyPair = wallets[1];
  let ownerDeployedContract;

  before(async () => {
  
    // Create client object
    owner = new Deployer('local', ownerKeyPair.secretKey);
    
  })

  it('deploying successfully', async () => {
  
    // Deploy it
    ownerDeployedContract = owner.deploy(RESTRICTED_CONTRACT_PATH);
    
    // See if it has deployed correctly
    await assert.isFulfilled(ownerDeployedContract, 'Could not deploy the Restricted Smart Contract');
    
  })

  describe('Calling functions', () => {
  
    it('Should successfully call the non restricted method', async () => {
    
      ownerDeployedContract = await owner.deploy(RESTRICTED_CONTRACT_PATH);
      
      // Call the non restricted method
      const callNotRestrictedMethod = ownerDeployedContract.nonRestrictedFunction(2);
      
      await assert.isFulfilled(callNotRestrictedMethod, 'Calling the non restricted function failed');
      
      const callResult = await callNotRestrictedMethod;
      
      await assert.equal(callResult, 2, 'The returned data was not correct')
      
    })

    it('Should successfully call the restricted method', async () => {
    
      const nonOwnerCalling = await ownerDeployedContract.from(nonOwnerKeyPair.secretKey);
      
      // Call the restricted method from non owner
      const callRestrictedMethod = nonOwnerCalling.restrictedFunction(2);
      
      // It should be rejected as it is restricted to owner only
      await assert.isRejected(callRestrictedMethod);
      
    })
    
  })
  
})
```
