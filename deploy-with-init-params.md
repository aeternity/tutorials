# TUTORIAL: Deploying Sophia smart contracts with init parameters

## Overview

This tutorial will walk you through the deployment of smart contracts with init parameters through the use of aeproject.

## Prerequisites

You have completed [this tutorial](smart-contract-deployment-in-aeproject.md) that teaches you how to deploy a contract without init parameters.

## Create a project and run your aeproject environment

We will run a node and compiler locally. The easiest option is to spawn one from aeproject. Follow the below steps to create a project, initialize the project, and test the project using aeproject on your CLI:

```
mkdir aeproject-init
cd aeproject-init
aeproject init
aeproject env
```

#### Output of `aeproject init`:

```
===== Initializing AEproject =====
===== Installing aepp-sdk =====
===== Installing AEproject locally =====
===== Creating project file & dir structure =====
===== Creating contracts directory =====
===== Creating tests directory =====
===== Creating integrations directory =====
===== Creating deploy directory =====
===== Creating docker directory =====
==== Adding additional files ====
===== AEproject was successfully initialized! =====
```

#### Output of `aeproject env`:

```
===== Starting node and compiler =====
Creating network "aeproject-init_default" with the default driver

.Creating aeproject-init_node1_1 ... 
Creating aeproject-init_node1_1    ... done
Creating aeproject-init_compiler_1 ... 

Creating aeproject-init_proxy_1    ... done


..............
===== Node was successfully started! =====
===== Compiler was successfully started! =====
===== Funding default wallets! =====
[List of wallet public keys, private keys, and balances]
===== Default wallets were successfully funded! =====
```

Do not forget to stop it once you are done developing

```
aeproject env --stop
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

As you can see the contract now has a state variable `savedNumber` of type int. The initial value will be passed by the init function. We've also added a read function for this value.

Run aeproject compile to verify that your contract compiles successfully

```
aeproject compile
```

#### Output of `aeproject compile`:

```
===== Compiling contracts =====

Contract '[your directory path]/contracts/ExampleContract.aes has been successfully compiled'
Contract bytecode: "cb_+G1GA6DbtXpvFpQzcO1kecnHs/7Wuq9JXd665XxOzeYZtvRBocC4QJ7+RNZEHwA3AQc3ABoGggABAz/+4rdsAQA3AAcBAoKdLwIRRNZEHxFpbml0EeK3bAEtc2F2ZWROdW1iZXKCLwCFNC4yLjAAfJ0fFw=="
```

## Step 2: Update your deploy.js

Let's add some parameters to our example deploy script which can be found at **deployment/deploy.js**. The parameters of the init functions are always passed as an array. Here is how our new deploy script looks like:

```
const Deployer = require('aeproject-lib').Deployer;

const deploy = async (network, privateKey, compiler, networkId) => {
    let deployer = new Deployer(network, privateKey, compiler, networkId)

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
===== Contract: ExampleContract.aes has been deployed at ct_HVb6d4kirgqzY1rShmzRTRwukcsXobjHcpLVD2EggoHmn6wt2 =====
42
Your deployment script finished successfully!
```

## Conclusion

Smart contracts are frequently in need of init params. Keep in mind the specifics of arrays and you will be able to successfully initialize your awesome æternity smart contracts. The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
