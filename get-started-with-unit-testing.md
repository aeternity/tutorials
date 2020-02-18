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

For more information on the **aeproject** commands used in this tutorial, please check out this section in the [aeproject documentation](https://aeproject.gitbook.io/aeproject/developer-documentation/aeproject-cli).

## Unit testing with aeproject

In this tutorial we will focus on the `aeproject test` command.

As rule of thumb, every smart contract should have unit tests covering its logic. It's not a "nice to have" thing, rather it's a "must have" in the immutable blockchain world. Using **aeproject** you get the well-known Mocha testing framework in place.

Check out the [aeproject documentation](https://aeproject.gitbook.io/aeproject/developer-documentation/aeproject-cli/testing#special-global-variables-and-modules-available-for-unit-tests) on special global variables and modules available for unit tests. **aeproject** exposes a number of global variables and functions that can be used in your unit tests.

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

Now fire up our local environment:

```
aeproject env
```

And finally let's run our tests:

```
aeproject test
```

If successful, you will see the test report below:

```
===== Starting Tests =====


  Example Contract
===== Contract: ExampleContract.aes has been deployed at ct_2Z42iQBz7Bc7uEawLJC5xzAiAvxGZzhKkjDK3HLo5f3vhTskbU =====
    ✓ Deploying Example Contract (6869ms)
    Calling functions
===== Contract: ExampleContract.aes has been deployed at ct_fKhQBiNQkDfoZcVF1ZzPzY7Lig6FnHDCLyFYBY33ZjfzGYPps =====
      ✓ Test get_string function (6626ms)
===== Contract: ExampleContract.aes has been deployed at ct_2JVfaVS61gCcMEWfstZRuj6yAnVTRyvSbVsfFAsvGrxm24b5fd =====
      ✓ Updating saved_string with register_string function (11744ms)


  3 passing (26s)

There is no sophia test to execute.
[]
```


## Conclusion

It's very important to test your smart contract before deploying it on the main network in order to prevent (sometimes catastrophic) issues in the future. When you have written unit tests, they will give you confidence that there won't be any discrepancies between your expectations and the actual smart contract execution. Look forward to our next tutorial showing how to create unit tests for a Sophia contract.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
