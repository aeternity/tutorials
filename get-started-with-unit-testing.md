# TUTORIAL: How to Get Started With Unit Testing Using aeproject

## Tutorial Overview

Immutability of smart contracts is both the best and worst thing for the blockchain developer. On one hand, the applications are trustless and are always running as expected.

On the other hand, smart contracts don’t generally offer simple upgrade paths, especially when it comes to critical components, such as code that controls the value in a token contract. Once a smart contract is up and running, changing it becomes complicated, if not impossible, regardless if the user has a malicious or benevolent intent.

The only way to be confident that your smart contract is solid is to test it meticulously. That begins with smart contract unit testing. At its simplest, unit testing means testing the code at the lowest level — at the smallest unit of code — to identify problems early, before they affect the program.

This tutorial will show you how to test your æternity Sophia smart contract project created via **aeproject**.

## Prerequisites

- Installed **aeproject** framework (take a look at the [installing aeproject](http://aeternity.com/documentation-hub/developer-tools/%C3%A6ternity-frameworks/aepp-aeproject-js/) section)
- Some familiarity with the **aeproject** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](https://dev.aepps.com/tutorials/README.html).
- Experience with the [Mocha](https://mochajs.org/) test framework.

## Getting started

**AEproject** is an aeternity framework which helps with setting up a project. The framework makes the development of smart contracts in the aeternity network pretty easy. It provides commands for compilation, deployment of smart contracts, running a local node, local compiler and unit testing the contracts.

For convenience, here are the main **aeproject** commands:

```bash
Usage: aeproject [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  init [options]           Initialize AEproject
  compile [options]        Compile contracts
  test [options]           Running the tests
  node [options]           Running a local node. Without any argument node will be runned with --start argument
  deploy [options]         Run deploy script
  history [options]        Show deployment history info
  contracts [options]      Running a Contract web aepp locally and connect it to the spawned aeproject node.
  shape <type> [type]      Initialize a web Vue project.
  export-config [options]  Export miner account, few funded accounts  and default node configuration.

```

Note before running the bellow commands, Create a directory for the project

``` bash
mkdir aeproject-unit-testing
cd aeproject-unit-testing
```

- **Command 1**: ```aeproject init``` - creates an æternity project structure with a few folders that the developer can use to create the contracts, tests and deployment scripts. Docker configuration files are also created, for easy boot up of a local æternity blockchain network.
- **Command 2**: ```aeproject node``` - helps developers run their docker-based local network. The local network contains 3 nodes. Spawning the network takes couple of minutes. At the end of this command you will be presented with AE accounts (key pairs) that you can use in your unit tests.
- **Command 3**: ```aeproject compile``` - compiles a Sophia smart contract. It's recommended to use the .aes file extension. Default directory is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console.
- **Command 4**: ```aeproject test``` - helps developers run their unit tests for æternity projects. The command executes the test scripts that are located in the `test` folder of your æternity project.

## Unit testing with aeproject

In this tutorial we will focus on the ```aeproject test``` command.

As rule of thumb, every smart contract should have unit tests covering it’s logic. It’s not a “nice to have” thing  —  it's a "must have" in the immutable blockchain world. Using **aeproject** you get the well-known Mocha testing framework in place.

## Special global variables and modules available for unit tests

**aeproject** exposes a number of global variables and functions that can be used in your unit tests.

### wallets

The global `wallets` array is available for the developer to use. `wallets` has 10 items, all representing the 10 forgae wallets created on the forgae node start. Every item has the structure of:

```bash
{
  "publicKey": "ak_2mwRmUeYmfuW93ti...",
  "secretKey": "bb9f0b01c8c9553cfbaf7..."
}
```

This structure makes it very convenient for the creation of SDK client instances:

```bash
// Create client objects
owner = await Ae({
  url: config.host,
  internalUrl: config.internalHost,
  keypair: wallets[0],
  nativeMode: true,
  networkId: 'ae_uat',
  compilerUrl: 'http://localhost:3080',
});

nonOwner = await Ae({
  url: config.host,
  internalUrl: config.internalHost,
  keypair: wallets[1],
  nativeMode: true,
  networkId: 'ae_uat',
  compilerUrl: 'http://localhost:3080',
});
```

### minerWallet

Similarly to ```wallets``` there is a global variable ```minerWallet``` representing the wallet of the node miner following the same structure. Let's look at an example:

```bash
// Create client objects
miner = await Ae({
  url: config.host,
  internalUrl: config.internalHost,
  keypair: minerWallet,
  nativeMode: true,
  networkId: 'ae_uat',
  compilerUrl: 'http://localhost:3080',
});
```

### aeproject-utils

```aeproject-utils``` is a package giving helper functions mainly for working with files and AEternity contracts. The most widely used one is ```readFileRelative(relativePath, encoding, error)```. Here is how we can use it:

```bash
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
  gas: config.gas
})
```

### Test Code

Let replace our `ExampleContract.aes` with the below contract code before then run command 5 and 6 below

```aes
contract ExampleContract =

  public entrypoint say_hello(name : string) : string =
    String.concat("Hello, ", name)
```

and then our deploy.js code with the code snippet below

```js
const Deployer = require('aeproject-lib').Deployer;

const deploy = async (network, privateKey, compiler, networkId) => {
    let deployer = new Deployer(network, privateKey, compiler, networkId);
    let deployedContract = await deployer.deploy("./contracts/ExampleContract.aes");

    let result = await deployedContract.say_hello('World'); // result would be: "Hello, World"

    console.log(result)
};

module.exports = {
    deploy
};
```

- **Command 5**: ```aeproject compile```
- **Command 6**: ```aeproject deploy``` - helps developers execute the deployment file created from the aeproject init command.

## Check if you are on track

- Command 1 Output

```bash
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

- Command 2 Output

```bash
===== Starting node =====
.........
===== Node was successfully started! =====
===== Funding default wallets! =====
Miner ------------------------------------------------------------
public key: ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
private key: bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca
Wallet's balance is 214949000000000000000
...
===== Default wallets was successfully funded! =====
```

- Command 3 Output

```bash
===== Compiling contracts =====

Contract '~/aeproject-unit-testing/contracts/ExampleContract.aes has been successfully compiled'
Contract bytecode: "cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8"
```

- Command 4 Output

```bash
===== Starting Tests =====

  Example Contract
===== Contract: ExampleContract.aes has been deployed at ct_2Z42iQBz7Bc7uEawLJC5xzAiAvxGZzhKkjDK3HLo5f3vhTskbU =====
    ✓ Deploying Example Contract (6548ms)


  1 passing (7s)

There is no sophia test to execute.
[]
```

- Command 5 Output

```bash
===== Compiling contracts =====

Contract '~/aeproject-unit-testing/contracts/ExampleContract.aes has been successfully compiled'
Contract bytecode: "cb_+HRGA6D6VLm64/2nS1WKpDa0O9rS2khtVPXVsgYwfPfaxJyr4sC4R6f+HFKJvAA3AXd3OhwdSGVsbG8sIAAA/kTWRB8ANwA3ABoOgj8BAz+bLwIRHFKJvCVzYXlfaGVsbG8RRNZEHxFpbml0gi8AhTQuMC4wAHzBJm8="
```

- Command 6 Output

```bash
===== Contract: ExampleContract.aes has been deployed at ct_2Ker9cb12skKWR2UZLxuT63MZRStC34KkUA9QMAiQFN6DNe5vC =====
{
  result: {
    callerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
    callerNonce: 13,
    contractId: 'ct_2Ker9cb12skKWR2UZLxuT63MZRStC34KkUA9QMAiQFN6DNe5vC',
    gasPrice: 1000000000,
    gasUsed: 23,
    height: 647,
    log: [],
    returnType: 'ok',
    returnValue: 'cb_MUhlbGxvLCBXb3JsZK8ldag='
  },
  decode: [Function: decode],
  decodedResult: 'Hello, World'
}
Your deployment script finished successfully!
```

## Conclusion

It’s very important to test your smart contract before deploying it on the main network in order to prevent (sometimes catastrophic) issues in the future. When you have written unit tests, they will give you confidence that there won’t be any discrepancies between your expectations and the actual smart contract execution. Look forward to our next tutorial showing how to create unit tests for a Sophia contract.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
