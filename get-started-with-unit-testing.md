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
- ```forgae init``` - creates an æternity project structure with a few folders that the developer can use to create the contracts, tests and deployment scripts. Docker configuration files are also created, for easy boot up of a local æternity blockchain network.
- ```forgae node``` - helps developers run their docker-based local network. The local network contains 3 nodes. Spawning the network takes couple of minutes. At the end of this command you will be presented with AE accounts (key pairs) that you can use in your unit tests.
- ```forgae compile``` - compiles a Sophia smart contract. It's recommended to use the .aes file extension. Default directory is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console.
- ```forgae test``` - helps developers run their unit tests for æternity projects. The command executes the test scripts that are located in the `test` folder of your æternity project.

## Unit testing with forgae

In this tutorial we will focus on the ```forgae test``` command.

As rule of thumb, every smart contract should have unit tests covering it’s logic. It’s not a “nice to have” thing  —  it's a "must have" in the immutable blockchain world. Using **forgae** you get the well-known Mocha testing framework in place.

### Special global variables and modules available for unit tests

**forgae** exposes a number of global variables and functions that can be used in your unit tests.

#### wallets
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
	networkId: 'ae_devnet'
});

nonOwner = await Ae({
	url: config.host,
	internalUrl: config.internalHost,
	keypair: wallets[1],
	nativeMode: true,
	networkId: 'ae_devnet'
});
```
#### minerWallet
Similarly to ```wallets``` there is a global variable ```minerWallet``` representing the wallet of the node miner following the same structure. Let's look at an example:
```
// Create client objects
miner = await Ae({
	url: config.host,
	internalUrl: config.internalHost,
	keypair: minerWallet,
	nativeMode: true,
	networkId: 'ae_devnet'
});
```

#### utils
```utils``` is a package exposing helper functions, mainly for working with files. The most widely used one is ```readFileRelative(relativePath, fileEncoding)```. Here is how we can use it:

```
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
	gas: config.gas
})
```

## Conclusion
It’s very important to test your smart contract before deploying it on the main network in order to prevent (sometimes catastrophic) issues in the future. When you have written unit tests, they will give you confidence that there won’t be any discrepancies between your expectations and the actual smart contract execution.

Look forward to our next tutorial showing how to create unit tests for a Sophia contract.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
