# TUTORIAL: How to Get Started With Unit Testing Using aeproject

## Tutorial Overview

Immutability of smart contracts is both the best and worst thing for the blockchain developer. On one hand, the applications are trustless and are always running as expected.

On the other hand, smart contracts don’t generally offer simple upgrade paths, especially when it comes to critical components, such as code that controls the value in a token contract. Once a smart contract is up and running, changing it becomes complicated, if not impossible, regardless if the user has a malicious or benevolent intent.

The only way to be confident that your smart contract is solid is to test it meticulously. That begins with smart contract unit testing. At its simplest, unit testing means testing the code at the lowest level — at the smallest unit of code — to identify problems early, before they affect the program.

This tutorial will show you how to test your æternity Sophia smart contract project created via **aeproject**.

## Prerequisites

- Installed **aeproject** framework (take a look at the [quickstart](https://aeproject.gitbook.io/aeproject/developer-documentation/getting-started) section)
- Some familiarity with the **aeproject** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](https://github.com/aeternity/tutorials), and in particular [aeproject deployment with init parameters](deploy-with-init-params.md).
- Experience with the [Mocha](https://mochajs.org/) test framework.

**aeproject** is an æternity framework which helps with setting up a Sophia project. The framework makes the development of smart contracts on the æternity network very easy. It provides commands for compilation of smart contracts, running a local æternity node and unit testing the contracts.

Here are the **aeproject** commands we will be using for this particular tutorial:

`aeproject init` - creates an æternity project structure with a few folders that the developer can use to create the contracts, tests and deployment scripts. Docker configuration files are also created, for easy boot up of a local æternity blockchain network.

`aeproject node` - helps developers run their docker-based local network. The local network contains several nodes. Spawning the network takes couple of minutes. At the end of this command, you will be presented with AE accounts (key pairs) that you can use in your unit tests.

`aeproject compile` - compiles a Sophia smart contract. It's recommended to use the .aes file extension. Default directory is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console.

`aeproject test` - helps developers run their unit tests for æternity projects. The command executes the test scripts that are located in the `test` folder of your æternity project.

## Unit testing with aeproject

In this tutorial we will focus on the `aeproject test` command.

As rule of thumb, every smart contract should have unit tests covering its logic. It's not a "nice to have" thing, rather it's a "must have" in the immutable blockchain world. Using **aeproject** you get the well-known Mocha testing framework in place.

## Special global variables and modules available for unit tests

**aeproject** exposes a number of global variables and functions that can be used in your unit tests.

### wallets

The global `wallets` array is available for the developer to use. `wallets` has 10 items, all representing the 10 aeproject wallets created on the aeproject node start. Every item has the structure of:

```
{
  "publicKey": "ak_fUq2NesPXcYZe...",
  "secretKey": "7c6e602a94f30e4e..."
}
```

This structure makes it very convenient for the creation of SDK client instances:
```
// Create client objects
owner = await Ae({
	url: "http://localhost:3001/",
	internalUrl: "http://localhost:3001/internal/",
	keypair: wallets[0],
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080'
});

nonOwner = await Ae({
	url: "http://localhost:3001/",
	internalUrl: "http://localhost:3001/internal/",
	keypair: wallets[1],
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080'
});
```

### minerWallet

Similarly to ```wallets``` there is a global variable ```minerWallet``` representing the wallet of the node miner following the same structure. Let's look at an example:
```
// Create client objects
miner = await Ae({
	url: "http://localhost:3001/",
	internalUrl: "http://localhost:3001/internal/",
	keypair: minerWallet,
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080'
});
```

### aeproject-utils

`aeproject-utils` is a package giving helper functions mainly for working with files and æternity contracts. For more specifics, visit: [aeproject-utils](https://aeproject.gitbook.io/aeproject/developer-documentation/aeproject-utils/utils)

## Let's get testing!

First, create and initialize a sample æpp:

```
mkdir start-unit-testing
cd start-unit-testing
aeproject init
```

Let's replace our `ExampleContract.aes` with the below contract code:

```
contract ExampleContract =

  record state = { saved_string : string }

  entrypoint init() = { saved_string = "aeternity" }

  public entrypoint get_string() : string =
    state.saved_string

  public stateful entrypoint register_string(word : string) =
    put(state { saved_string = word})
```

and then modify our `test/exampleTest.js` code with the code snippet below:

```
const Deployer = require('aeproject-lib').Deployer;
const EXAMPLE_CONTRACT_PATH = "./contracts/ExampleContract.aes";

describe('Example Contract', () => {

    let deployer;
    let ownerKeyPair = wallets[0];

    before(async () => {
        deployer = new Deployer('local', ownerKeyPair.secretKey)
    })

    it('Deploying Example Contract', async () => {
        deployPromise = deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it

        await assert.isFulfilled(deployPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check whether it's deployed

    })

    describe('Calling functions', () => {

      it('Test get_string function', async () => {

        deployPromise = await deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it

        // Getting saved_string value in our ExampleContract
        const getString = deployPromise.get_string()
        await assert.isFulfilled(getString, 'Calling get_string function failed');
        const getStringResult = await getString
        await assert.equal(getStringResult.decodedResult, "aeternity", 'The returned data was not correct')

      })

      it('Updating saved_string with register_string function', async () => {

        deployPromise = await deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it

        // Writing new value "hello world" to our saved_string
        await deployPromise.register_string("hello world")

        // Getting updated saved_string value in our ExampleContract
        const getUpdatedString = deployPromise.get_string()
        await assert.isFulfilled(getUpdatedString, 'Calling get_string function failed');
        const getUpdatedStringResult = await getUpdatedString              
        await assert.equal(getUpdatedStringResult.decodedResult, "hello world", 'The returned data was not correct')

      })

    })

})

```

Now fire up our local node:

```
aeproject node
```

And finally let's run our tests:

```
aeproject test
```

If successful, you will see the test report below:

```
===== Starting Tests =====


  Example Contract
===== Contract: ExampleContract.aes has been deployed at [contract address] =====
    ✓ Deploying Example Contract (7049ms)
    Calling functions
===== Contract: ExampleContract.aes has been deployed at [contract address] =====
      ✓ Test get_string function (6606ms)
===== Contract: ExampleContract.aes has been deployed at [contract address] =====
      ✓ Updating saved_string with register_string function (11916ms)


  3 passing (26s)

There is no sophia test to execute.
[]
```


## Conclusion

It's very important to test your smart contract before deploying it on the main network in order to prevent (sometimes catastrophic) issues in the future. When you have written unit tests, they will give you confidence that there won't be any discrepancies between your expectations and the actual smart contract execution. Look forward to our next tutorial showing how to create unit tests for a Sophia contract.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
