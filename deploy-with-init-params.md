# TUTORIAL: Deploying Sophia smart contracts with init parameters

## Tutorial Overview

This tutorial will walk you through the deployment of smart contracts with init parameters through the use of forgae.

## Prerequisites

You have completed [this tutorial](smart-contract-deployment-in-forgae.md) that teaches you how to deploy a contract without init parameters.

## Step 0: Create a project and run your forgae node

We would need a local node to compile and deploy on. The easiest option is to spawn one from forgae. Follow the below steps to create a project, initialize the project, and test the project using forgae on your CLI:

```
Step 1: $ mkdir forgae-init
Step 2: $ cd forgae-init
Step 3: $ forgae init
Step 4: $ forgae node or docker-compose for docker toolbox users
mkdir forgae-init
cd forgae-init
forgae init
forgae node
```

#### Output of `forgae init`:

```
===== Initializing ForgAE =====
===== Installing aepp-sdk =====
===== Installing ForgAE locally =====
===== Installing yarn locally =====
===== Creating project file & dir structure =====
===== Creating contracts directory =====
===== Creating tests directory =====
===== Creating integrations directory =====
===== Creating deploy directory =====
===== Creating docker directory =====
===== ForgAE was successfully initialized! =====
```

#### Output of `forgae node`:

```
===== Starting node =====
....Creating network "forgae-init_default" with the default driver
Creating volume "forgae-init_node1_db" with default driver
Creating volume "forgae-init_node1_keys" with default driver
Creating volume "forgae-init_node2_db" with default driver
Creating volume "forgae-init_node2_keys" with default driver
Creating volume "forgae-init_node3_db" with default driver
Creating volume "forgae-init_node3_keys" with default driver

.Creating forgae-init_proxy_1 ... 
Creating forgae-init_node2_1 ... 
Creating forgae-init_node2_1 ... done
Creating forgae-init_proxy_1 ... done
Creating forgae-init_node1_1 ... done
Creating forgae-init_node3_1 ... done
.
.
.........................
===== Node was successfully started! =====
===== Funding default wallets! =====
[List of wallet public keys, private keys, and balances]
===== Default wallets was successfully funded! =====
```

#### Do not forget to stop it later once you are done developing

```
forgae node --stop
```

## Step 1: Update your ExampleContract.aes

Let's add some state and init parameters to our example contract which can be found at **contracts/ExampleContract.aes**

```
contract ExampleContract =
  record state =
    { savedNumber : int }

  public stateful function init(num : int) =
    { savedNumber = num }

  public function savedNumber() : int = state.savedNumber
```

As you can see the contract now has a state variable `savedNumber` of type int. The initial value will be passed by the init function. We've also added a read function for this value.

Run forgae compile to verify that your contract compiles successfully

```
forgae compile
```

#### Output of `forgae compile`:

```
===== Compiling contracts =====

Contract '/home/justin/forgae-init/contracts/ExampleContract.aes has been successfully compiled'
Contract bytecode: [contract bytecode]
```

## Step 2: Update your deploy.js

Let's add some parameters to our example deploy script which can be found at **deployment/deploy.js**. The parameters of the init functions are always passed as an array. Here is how our new deploy script looks like:

```
const Deployer = require('forgae-lib').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

	let contract = await deployer.deploy("./contracts/ExampleContract.aes", [42])

	let encodedSavedNumber = await contract.call('savedNumber')
	let decodedSavedNumber = await encodedSavedNumber.decode("int")
	console.log(decodedSavedNumber) // 42
};

module.exports = {
	deploy
};

```

As you can see, we are now passing the initial value of `42` into the init parameters array. Note: If you are passing a parameter of type string, do not forget to add quotes `"` around the string too `"Some string"`. Multiple init parameters can be passed into the array, for example `[42, 24]`.

## Step 3: Run our deploy script

Running our deployment script with forgae is trivial. Just run:
```
forgae deploy
```

You will see the following output which includes our init parameter of `42`:

```
===== Contract: ExampleContract.aes has been deployed =====
42
Your deployment script finished successfully!
```

## Conclusion

Smart contracts are frequently in need of init params. Keep in mind the specifics of arrays and you will be able to successfully initialize your awesome æternity smart contracts. The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
