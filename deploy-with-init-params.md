# TUTORIAL: Deploying Sophia smart contracts with init parameters

## Overview

This tutorial will walk you through the deployment of smart contracts with init parameters through the use of aeproject.

## Prerequisites

You have completed [this tutorial](smart-contract-deployment-in-aeproject.md) that teaches you how to deploy a contract without init parameters.

## Create a project and run your aeproject node

We would need a local node to compile and deploy on. The easiest option is to spawn one from aeproject. Follow the below steps to create a project, open your command line if you are on windows and your terminal if you are on  Mac or Linux, initialize the project, and test the project using aeproject on your CLI by using the following commands:

```
mkdir aeproject-init
cd aeproject-init
aeproject init
aeproject node
```

#### Output of `aeproject init`:

```
===== Initializing AEproject =====
===== Installing aepp-sdk =====
===== Installing AEproject locally =====
===== Installing yarn locally =====
===== Creating project file & dir structure =====
===== Creating contracts directory =====
===== Creating tests directory =====
===== Creating integrations directory =====
===== Creating deploy directory =====
===== Creating docker directory =====
==== Adding additional files ====
===== AEproject was successfully initialized! =====
```

#### Output of `aeproject node`:

```
===== Starting node =====
...............
===== Node was successfully started! =====
===== Funding default wallets! =====
[List of wallet public keys, private keys, and balances]
===== Default wallets was successfully funded! =====
```

Do not forget to stop it once you are done developing

```
aeproject node --stop
```

## Step 1: Update your ExampleContract.aes

Let's add some state and init parameters to our example contract which can be found at **contracts/ExampleContract.aes**

```
contract ExampleContract =
  record state =
    { savedNumber : int }

  stateful entrypoint init(num : int) =
    { savedNumber = num }

  entrypoint savedNumber() : int = state.savedNumber
```

As you can see the contract now has a state variable `savedNumber` of type int. We pass a variable called`num`of type int  to the init function so it can can be used to update the `savedNumber` state variable. We've also added a function called `savedNumber` to return the value of the state variable `savedNumber`.

Run aeproject compile in that same directory to verify that your contract compiles successfully

```
aeproject compile
```

#### Output of `aeproject compile`:

```
===== Compiling contracts =====

Contract '[your directory path]/aeproject-init/contracts/ExampleContract.aes has been successfully compiled'
Contract bytecode: "cb_+HRGA6DbtXpvFpQzcO1kecnHs/7Wuq9JXd665XxOzeYZtvRBocC4R6X+RNZEHwA3AQc3AAwBACcMAhoCggEDP/7it2wBADcABygsAIIAnS8CEUTWRB8RaW5pdBHit2wBLXNhdmVkTnVtYmVygi8AhTQuMC4wAN6kD9k="
```

## Step 2: Update your deploy.js

Let's add some parameters to our example deploy script which can be found at **deployment/deploy.js**. The parameters of the init functions are always passed as the second argument to the `deploy` function in form of an array . Here is how our new deploy script looks like:

```
const Deployer = require('aeproject-lib').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    let contract = await deployer.deploy("./contracts/ExampleContract.aes", [42])

    let encodedSavedNumber = await contract.savedNumber()
    console.log(encodedSavedNumber.decodedResult)
};

module.exports = {
    deploy
};
```

As you can see, we are now passing the initial value of `42` into the init parameters array. Note: If you are passing a parameter of type string, do not forget to add quotes `"` around the string too `"Some string"`. Multiple init parameters can be passed into the array, for example `[42, 24]`.

## Step 3. Run our deploy script

Running our deployment script with aeproject is trivial. Just run:
```
aeproject deploy
```

You will see the following output which includes our init parameter of `42`:

```
===== Contract: ExampleContract.aes has been deployed at [contract address] =====
42
Your deployment script finished successfully!
```

## Conclusion

Smart contracts are frequently in need of init params. Keep in mind the specifics of arrays and you will be able to successfully initialize your awesome æternity smart contracts. The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
