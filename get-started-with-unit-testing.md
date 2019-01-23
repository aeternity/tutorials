# TUTORIAL: How to get started with unit testing via forgae
## Tutorial Overview
Immutability of smart contracts are both the best and worst thing for the blockchain developer. On one hand, the applications are trustless and are always running as expected. 

On the other hand, the smart contracts don’t generally offer simple upgrade paths, especially when it comes to critical components, such as code that controls the value in a token contract. Once a smart contract is up and running, changing it becomes complicated, if not impossible - changing it for bad (malicious) or good (bugfixing).

The only way to be confident your smart contract is solid, is to test it meticulously. That begins with smart contract unit testing. At its simplest, unit testing means testing the code at the earliest level — at the smallest unit of code — to identify problems early, before they affect the program.
This tutorial will show you how to test your aeternity project created via forgae.
## Prerequisites
- Installed the **forgae** framework (take a look over [installing forgae](https://dev.aepps.com/tutorials/smart-contract-deployment-in-forgae.html) section)
- Before reading this, you should have some familiarity with the forgae framework and developing Sophia smart contracts. If not, we recommend checking some of our [development tutorials](https://dev.aepps.com/tutorials/README.html)
- Experience with [Mocha](https://mochajs.org/) test framework

## Getting started

**Forgae** is an aeternity framework which helps with setting up a project. The framework makes the development of smart contracts in the aeternity network pretty easy. It provides commands for compilation of smart contracts, running a local Epoch and unit testing the contracts. In future deployment will also be available through forgae.

Let's recap the main forgae commands:
- ```forgae init``` - creates aeternity project structure with a few folders, that the developer can use to create the contracts, tests and deployment scripts. Docker configuration files are also created, for easy boot up of local the aeternity blockchain network;
- ```forgae node``` - helps developers run their docker-based local network. The local network contains 3 nodes. Spawning the network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests
- ```forgae compile``` - compiles Sophia contract. It's recommended to use .aes file extension. Default directory is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console
- ```forgae test``` - helps developers run their unit tests for aeternity projects. The command executes the test scripts that are located in the `test` folder of your aeternity project

## Unit testing with forgae

In this tutorial we will focus on ```forgae test``` command.
As rule of thumb, every smart contract should have unit tests covering it’s logic. It’s not a “nice to have” thing  —  it is a must in our immutable world. Using **forgae** you get the well known mocha testing framework in place. 

### Special global variables and modules available for unit tests

**forgae** exposes special convenience global variables and functions that can be used in your unit tests.
#### wallets
Global `wallets` array is available for the developer to use. `wallets` has 10 items, all representing the 10 forgae wallets created on the forgae node start. Every item has the structure of:
```
{
	"publicKey": "ak_fUq2NesPXcYZe...",
	"secretKey": "7c6e602a94f30e4e..."
}
```

This structure makes it very convenient for creation of SDK client instances:
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
```utils``` is a package exposing helper functions, mainly for working with files. Most widely used one is ```readFileRelative(relativePath, fileEncoding)```. Here is how we can use it:
```
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
	gas: config.gas
})
```

## Conclusion
It’s very important to test your smart contract before deploying it on the main network, in order to prevent issues in the future. When you have written unit tests, they will give you confidence that there won’t be any discrepancy between your idea and smart contract execution.

Look forward to our next tutorial showing how to create unit tests for a Sophia contract.
 
The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
