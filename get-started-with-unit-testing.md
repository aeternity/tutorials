# TUTORIAL: How to Get Started With Unit Testing Using forgae

## Tutorial Overview

Immutability of smart contracts is both the best and worst thing for the blockchain developer. On one hand, the applications are trustless and are always running as expected.

On the other hand, smart contracts don’t generally offer simple upgrade paths, especially when it comes to critical components, such as code that controls the value in a token contract. Once a smart contract is up and running, changing it becomes complicated, if not impossible, regardless if the user has a malicious or benevolent intent.

The only way to be confident that your smart contract is solid is to test it meticulously. That begins with smart contract unit testing. At its simplest, unit testing means testing the code at the lowest level — at the smallest unit of code — to identify problems early, before they affect the program.

This tutorial will show you how to test your æternity Sophia smart contract project created via **forgae**.

## Prerequisites

- Installed **forgae** framework (take a look at the [installing forgae](https://dev.aepps.com/tutorials/smart-contract-deployment-in-forgae.html) section)
- Some familiarity with the **forgae** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](https://dev.aepps.com/tutorials/README.html).
- Experience with the [Mocha](https://mochajs.org/) test framework.

## Getting started

**Forgae** is an æternity framework which helps with setting up a Sophia project. The framework makes the development of smart contracts on the æternity network very easy. It provides commands for compilation of smart contracts, running a local æternity node and unit testing the contracts. In the future, smart contract deployment will also be possible through **forgae**.

For convenience, here are the main **forgae** commands:

Note before running the bellow commands, Create a directory for the project

```
$ mkdir forgae-unit-testing
$ cd forgae-unit-testing
```

- **Command 1**: ```forgae init``` - creates an æternity project structure with a few folders that the developer can use to create the contracts, tests and deployment scripts. Docker configuration files are also created, for easy boot up of a local æternity blockchain network.
- **Command 2**: ```forgae node``` - helps developers run their docker-based local network. The local network contains 3 nodes. Spawning the network takes couple of minutes. At the end of this command you will be presented with AE accounts (key pairs) that you can use in your unit tests.
- **Command 3**: ```forgae compile``` - compiles a Sophia smart contract. It's recommended to use the .aes file extension. Default directory is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console.
- **Command 4**: ```forgae test``` - helps developers run their unit tests for æternity projects. The command executes the test scripts that are located in the `test` folder of your æternity project.

## Unit testing with forgae

In this tutorial we will focus on the ```forgae test``` command.

As rule of thumb, every smart contract should have unit tests covering it’s logic. It’s not a “nice to have” thing  —  it's a "must have" in the immutable blockchain world. Using **forgae** you get the well-known Mocha testing framework in place.

## Special global variables and modules available for unit tests

**forgae** exposes a number of global variables and functions that can be used in your unit tests.

### wallets

The global `wallets` array is available for the developer to use. `wallets` has 10 items, all representing the 10 forgae wallets created on the forgae node start. Every item has the structure of:

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
```
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

### utils

```utils``` is a package exposing helper functions, mainly for working with files. The most widely used one is ```readFileRelative(relativePath, fileEncoding)```. Here is how we can use it:

```
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
  gas: config.gas
})
```

### Note

Let replace our `ExampleContract.aes` with the below contract code before running command 3 and 4

```
contract ExampleContract =

  record state = { saved_string : string }

  entrypoint init() = { saved_string = "aeternity" }

  public entrypoint get_string() : string =
    state.saved_string

  public stateful entrypoint register_string(word : string) =
    put(state { saved_string = word})
```

and then our deploy.js code with the code snippet below

```
const Deployer = require('forgae-lib').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    let contract = await deployer.deploy("./contracts/ExampleContract.aes")

    // Getting savedString value in our ExampleContract
    let get_string = await contract.decode('get_string')
    console.log(get_string.value)

    // Writing new value ('hello world') to our saved_string
    await contract.call('register_string', 'hello world')

    // Getting new saved_string value in our ExampleContract
    let get_string2 = await contract.decode('get_string')
    console.log(get_string2.value)
};

module.exports = {
    deploy
};
```

## Check if you are on track

- Command 1 Output

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

- Command 2 Output

```
===== Starting node =====
.....Starting forgae-init-testing_node3_1 ...

Creating forgae-init-testing_proxy_1 ...

Starting forgae-init-testing_node3_1 ... done

Creating forgae-init-testing_node1_1 ...
Creating forgae-init-testing_proxy_1 ... done
........
...
Creating forgae-init-testing_node1_1 ... done

........................................................
===== Node was successfully started! =====
===== Funding default wallets! =====
```

- Command 3 Output

```
Contract '~\forgae-unit-testing\contracts\ExampleContract.aes has been successfully compiled'     
Contract bytecode: cb_+QP1RgKgP9ddDnECNFDZtun/Kvi5cOcQRqSHHZPubbCyqVqphpD5Avv5ASqgaPJnYzj/UIg5q6R3Se/6i+h+8oTyB/s9mZhwHNU4h8WEbWFpbrjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKD//////////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+QHLoLnJVvKLMUmp9Zh6pQXz2hsiCcxXOSNABiu2wb2fn5nqhGluaXS4YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////////////////////////////////////////7kBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA//////////////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////////////uMxiAABkYgAAhJGAgIBRf7nJVvKLMUmp9Zh6pQXz2hsiCcxXOSNABiu2wb2fn5nqFGIAAMBXUIBRf2jyZ2M4/1CIOaukd0nv+ovofvKE8gf7PZmYcBzVOIfFFGIAAK9XUGABGVEAW2AAGVlgIAGQgVJgIJADYAOBUpBZYABRWVJgAFJgAPNbYACAUmAA81tZWWAgAZCBUmAgkANgABlZYCABkIFSYCCQA2ADgVKBUpBWW2AgAVFRWVCAkVBQgJBQkFZbUFCCkVBQYgAAjFaFMi4xLjA5775X
```

- Command 4 Output

```
===== Starting Tests =====


  Example Contract
===== Contract: ExampleContract.aes has been deployed =====
    ✓ Deploying Example Contract (5242ms)


  1 passing (5s)

There is no sophia test to execute.
[]
```

## Conclusion

It’s very important to test your smart contract before deploying it on the main network in order to prevent (sometimes catastrophic) issues in the future. When you have written unit tests, they will give you confidence that there won’t be any discrepancies between your expectations and the actual smart contract execution. Look forward to our next tutorial showing how to create unit tests for a Sophia contract.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
