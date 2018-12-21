# TUTORIAL: Sophia basics - owning a smart contract and owner privileges

## Tutorial Overview
This tutorial will walk teach you how one can access restrict a method to the deployer of the smart contract itself. This is a useful tool for defining critical business logic.
## Prerequisites
- Installed Aeproject - For installation steps reffer to [this tutorial](https://hackmd.aepps.com/MwMwrATA7AhjAsBaADARgGwkfKAOApogEYAm4xAnMlBBCTOsiCUA?view)

## 1. Prepare your environment

Before we begin coding up we should start by initializing an aepp project.
### 1.1 aeproject init

Let's create a new empty folder and initialise an aepp project.

```
mkdir ownable-project
cd ownable-project
aeproject init
```

### 1.2 aeproject epoch
Another thing we would require is a local working environment to develop against. Luckily `aeproject` gives us that out of the box. Just type in the following command

```
aeproject epoch
```

You can later stop the local node by typing in 
```
aeproject epoch --stop
```

## 2. Writing the contract without access restriction

The next thing that we will do, is to write a simple Sophia smart contract. This smart contract will have two functions - public and access restricted. In this section, we will not apply an access restriction yet and will write unit tests proving that the soon to be access restricted method is still called successfully by anyone

### 2.1 Write the smart contract
Lets first write our `Restricted.aes` smart contract.

First create the contract file under contracts folder
```
touch ./contracts/Restricted.aes
```

The following code goes inside this file:

```javascript=
contract Restricted =
	// Non access restricted method. Should be callable by any user successfully
	public function nonRestrictedFunction(i: int) : int =
		i

	// Access restricted method. Should be callable only by the owner/deployer
	public function restrictedFunction(i: int) : int =
		i
```

***Note***: keep formatting intact or things will break badly

As you can see this contract exposes two functions - both returning the number it has received as argument. Note that the restricted function is **not** actually restricted yet.
### Write unit tests to call the methods
In order to show the functionality we want we should write some unit tests.

The main three unit tests needed are:
1. The smart contract is being compiled and deployed successfully
2. The non-restricted method is freely called by non-owner (more on owners soon)
3. The restricted method cannot be called by non-owner

#### The code

```javascript=
const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
  host: "http://localhost:3001/",
  internalHost: "http://localhost:3001/internal/",
  contractSourceFile: './contracts/Restricted.aes',
  gas: 200000,
  ttl: 55
}

describe('Restricted', () => {

  let owner;
  let nonOwner;
  let contractSource;

  before(async () => {

    // Create client objects
    owner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[0],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    nonOwner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[1],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    // Read the source file
    contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");

  })

  it('deploying successfully', async () => {
    // Compile the contract
    const compiledContract = await owner.contractCompile(contractSource, {
      gas: config.gas
    })

    // Deploy the contract
    const deployPromise = compiledContract.deploy({
      options: {
        ttl: config.ttl,
      },
      abi: "sophia"
    });
    // See if it has deployed correctly
    assert.isFulfilled(deployPromise, 'Could not deploy the Restricted Smart Contract');
  })

  describe('Calling functions', () => {
    let compiledContract;
    let deployedContract;

    before(async () => {
      compiledContract = await owner.contractCompile(contractSource, {
        gas: config.gas
      })

      deployedContract = await compiledContract.deploy({
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      });
    })

    it('Should successfully call the non restricted method', async () => {
      // Call the non restricted method
      const callNotRestrictedMethod = nonOwner.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "nonRestrictedFunction", {
        args: `(2)`,
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      })

      await assert.isFulfilled(callNotRestrictedMethod, 'Calling the non restricted function failed');
      const callResult = await callNotRestrictedMethod;
      const decodedData = await callResult.decode('int') // get and decode the result

      assert.equal(decodedData.value, 2, 'The returned data was not correct')
    })

    it('Should successfully call the restricted method', async () => {
      // Call the restricted method from non owner
      const callRestrictedMethod = nonOwner.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "restrictedFunction", {
        args: `(2)`,
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      })

      // It should be rejected as it is restricted to owner only
      await assert.isRejected(callRestrictedMethod);
    })
  })
})
```

As we have not yet implemented the restriction functionality the third test naturally fails.
Run the following command in the terminal:
```
aeproject test
```

```cmake=
===== Starting Tests =====


  Restricted
    ✓ deploying successfully (69ms)
    Calling functions
      ✓ Should successfully call the non restricted method (5411ms)
      1) Should successfully call the non restricted method


  2 passing (14s)
  1 failing

  1) Restricted
       Calling functions
         Should successfully call the non restricted method:
     AssertionError: expected promise to be rejected with an error including 'bad_call_data' but it was fulfilled with { Object (result, decode) }
  
```

## Access restrict the smart contract

In order to restrict a method to be called only by the deployer of the smart contract we would need to modify the smart contract to know who is their deployer. Here is how to do that

### Modify the smart contract

Let's first add state variable for the owner and set it on deploy time. On the second line of Restricted.aes put the following:

```javascript=
	record state = {
		owner : address}

	public stateful function init() = {
		owner = Call.caller // Initializing the owner to the deployer
		}
```

This snippet initializes the state variable owner to the deployer of the contract.

With this done lets create a function that checks the caller of arbitrary transaction and throws if it is not the owner

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

This will ensure that the deployer is the only one that can call this method. Lets prove this through the unit tests

### Run the unit tests
Lets run again the unit tests
```
aeproject test
```

```cmake=
===== Starting Tests =====


  Restricted
    ✓ deploying successfully (40ms)
    Calling functions
      ✓ Should successfully call the non restricted method (5424ms)
      ✓ Should successfully call the restricted method (5507ms)


  3 passing (19s)
```

All three tests pass successfully now

## When to use it - Philosophical dilemma 

Although this is a very cool practice, the main reason for the Blockchain technology is to allow for decentralization of systems. Having an access being restricted to a certain user is somewhat similar to having a central point, although it is a very well known. Use this technique with caution and think about possible implications of this elevated access.

## Conclusion
It is pretty easy to add access-restriction to your contract methods. In few simple steps you can have administrative layer functionality. What are some use-cases for you to use it? Tell us in the comment section below.

*The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).*

## Full code
Restricted.aes
```javascript=
contract Restricted =

	record state = {
		owner : address}

	public stateful function init() = {
		owner = Call.caller // Initializing the owner to the deployer
		}

	private function require(exp : bool, err : string) = // Method to throw an exception if the expression exp is invalid
  		if(!exp)
		   abort(err)

	public function onlyOwner() : bool =
		// Require that the caller of this method is actually the deployer
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

exampleTest.js
```javascript=
const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
  host: "http://localhost:3001/",
  internalHost: "http://localhost:3001/internal/",
  contractSourceFile: './contracts/Restricted.aes',
  gas: 200000,
  ttl: 55
}

describe('Restricted', () => {

  let owner;
  let nonOwner;
  let contractSource;

  before(async () => {

    // Create client objects
    owner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[0],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    nonOwner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[1],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    // Read the source file
    contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");

  })

  it('deploying successfully', async () => {
    // Compile the contract
    const compiledContract = await owner.contractCompile(contractSource, {
      gas: config.gas
    })

    // Deploy the contract
    const deployPromise = compiledContract.deploy({
      options: {
        ttl: config.ttl,
      },
      abi: "sophia"
    });
    // See if it has deployed correctly
    assert.isFulfilled(deployPromise, 'Could not deploy the Restricted Smart Contract');
  })

  describe('Calling functions', () => {
    let compiledContract;
    let deployedContract;

    before(async () => {
      compiledContract = await owner.contractCompile(contractSource, {
        gas: config.gas
      })

      deployedContract = await compiledContract.deploy({
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      });
    })

    it('Should successfully call the non restricted method', async () => {
      // Call the non restricted method
      const callNotRestrictedMethod = nonOwner.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "nonRestrictedFunction", {
        args: `(2)`,
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      })

      await assert.isFulfilled(callNotRestrictedMethod, 'Calling the non restricted function failed');
      const callResult = await callNotRestrictedMethod;
      const decodedData = await callResult.decode('int') // get and decode the result

      assert.equal(decodedData.value, 2, 'The returned data was not correct')
    })

    it('Should successfully call the restricted method', async () => {
      // Call the restricted method from non owner
      const callRestrictedMethod = nonOwner.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "restrictedFunction", {
        args: `(2)`,
        options: {
          ttl: config.ttl
        },
        abi: "sophia"
      })

      // It should be rejected as it is restricted to owner only
      await assert.isRejected(callRestrictedMethod);
    })
  })
})
```