# TUTORIAL: How to write Unit tests for Sophia smart contracts - Part 1
## Tutorial Overview
This tutorial series will walk you through the process of writing unit tests for Sophia smart contracts. To test a contract, we need to use a process where we send some input data, to some function of the contract. Then we assert a given result. 

This testing activity is carried out to find defects in the contract code ahead of the deployment. Logically, we can separate the unit tests in two cases, positive test cases and negative test cases.

The positive test cases or positive testing, is the type of testing that can be performed on the system by providing the valid, expect data as input. It checks whether a contract behaves as expected with correct inputs by correctly behaving callers. Simply put, this test is done to check the contract that does what it is supposed to do.

The negative test cases or negative testing, deals with extreme cases and access violations. It proves that your contract is secured against malicious attacks or unfortunate breaks.

## Prerequisites
Before we go any further, please make sure you have reviewed the following tutorials:
- [Simple Fungible Token Exchange Smart Contract - Part 1](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-1.md)
- [How to get started with unit testing via forgae](https://github.com/aeternity/tutorials/blob/master/get-started-with-unit-testing.md)

## Content
This tutorial, will show you how to write tests for the positive test cases for ```FungibleToken.aes``` and ```ExchangeContract.aes``` contracts. 
The [second part](https://github.com/aeternity/tutorials/blob/master/how-to-write-unit-test-2.md) will be focused on the negative test cases.

## Fungible token contract - unit tests
forgAE allows us to write unit tests using the well known Mocha testing framework and Chai assertion library. 
The ```forgae test``` command executes the tests scripts that are located in the test folder of our aeternity project.
Get into your test directory using the following command ```cd ~/exchangeContract/test``` and after that let's create a new test script file ```touch ./fungibleToken.js```. There we will write our new tests. 
We will create an additional ```config``` file in the ```test``` directory via the well-known command ```touch ./config.json```. The content of the newly created file is:
```
{
  "host": "http://localhost:3001/",
  "internalHost": "http://localhost:3001/internal/",
  "ownerKeyPair": {
    "secretKey": "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca",
    "publicKey": "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU"
  },
  "notOwnerKeyPair": {
    "secretKey": "e37484af730bc798ac10fdce7523dc24a64182dfe88ff139f739c1c7f3475434df473b854e8d78394c20abfcb8fda9d0ed5dff8703d8668dccda9be157a60b6d",
    "publicKey": "ak_2hLLun8mZQvbEhaDxaWtJBsXLnhyokynwfMDZJ67TbqGoSCtQ9"
  },
  "notOwnerPubKeyHex": "0xdf473b854e8d78394c20abfcb8fda9d0ed5dff8703d8668dccda9be157a60b6d",
  "pubKeyHex": "0xe9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca",
  "filesEncoding": "utf-8",
  "gas": 200000,
  "ttl": 55
}
```

The ```config``` file contains:
- as we will run our tests on a local development network spawned by ```forgae node``` command, so the host urls of the used network ```http://localhost:3001/``` and ```http://localhost:3001/internal/```;
- the details for two wallets - the one will be used as owner, the other as non owner;
- the additional constants as ```fileEncoding```,```gas``` and ```ttl```;

The next step is to get started writing tests.

The first lines of the ```fungibleToken.js``` file are:
```
const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const config = require("./config.json");
const sourceFile = "./contracts/FungibleToken.aes";
```
As you can see, we import the assertion library ```Chai```, installed in local node_modules by the forgae tool. We also import the æternity SDK. Finally, we define the path to the ```config.json``` and ```FungibleToken.aes``` files.

Remember, Mocha is a testing framework. That means it’s used to organize and execute tests. When writing a test, there are two basic functions you should be aware of: ```describe()``` and ```it()```.

- describe() is simply a way to group our tests in Mocha. We can nest our tests in groups as deep as we deem necessary. describe() takes two arguments, the first is the name of the test group, and the second is a callback function.
```
describe('string name', function(){
  // can nest more describe()'s here, or tests go here
});
```

- it() is used for an individual test case. it() should be written as if you were saying it out loud: “It should equal zero”, “It should log the user in”, etc. it() takes two arguments, a string explaining what the test should do, and a callback function which contains our actual test:
```
it('should blah blah blah', function(){
  // Test case goes here
});
```
Mocha provides the hooks ```before()```, ```after()```, ```beforeEach()```, and ```afterEach()```. These should be used to set up preconditions and clean up after your tests.

Let's start with the outermost ```describe()``` and the first ```before()``` hook:
```
describe('Fungible token', () => {

	let firstClient;
	let secondClient;
	let fungibleTokenSource;

	before(async () => {
		firstClient = await Universal({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: config.ownerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

		secondClient = await Universal({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: config.notOwnerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

		firstClient.setKeypair(config.ownerKeyPair);
		await firstClient.spend(1, config.notOwnerKeyPair.publicKey);

		fungibleTokenSource = utils.readFileRelative(sourceFile, config.filesEncoding);
	});
```

In the ```before``` hook we create two clients using the ```Universal``` development (include all SDK features) flavor. 

We continue with the first nested ```describe``` which will test the contract deployment:
```
	describe('Deploy contract', () => {

		it('deploying successfully', async () => {
			//Arrange
			const compiledContract = await firstClient.contractCompile(fungibleTokenSource, {});

			//Act
			const deployPromise = compiledContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(deployPromise, 'Could not deploy the erc20');


			//Assert
			const deployedContract = await deployPromise;
			console.log(deployedContract);
			assert.equal(config.ownerKeyPair.publicKey, deployedContract.owner)
		})

	});
```

We use the ```firstClient``` created earlier to compile the ```FungibleToken``` source code and after that we deploy the compiled contract to our local development network. Finally, we check if the owner of the deployed contract is the same as the public key of the wallet owner set up at the ```config.json```.

With the next tests we will cover the contract functionality - minting tokens, burning tokens, transfer tokens and increasing/decreasing token allowance.

Let's start with the tests for the ```mint``` function:

```
	describe('Interact with contract - positive cases', () => {
		let deployedContract;
		let compiledContract;

		beforeEach(async () => {
			compiledContract = await firstClient.contractCompile(fungibleTokenSource, {})
			deployedContract = await compiledContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
		});

		describe('Contract functionality', () => {
			beforeEach(async () => {
				const mintPromise = deployedContract.call('mint', {
					args: `(${config.pubKeyHex}, 1000)`,
					options: {
						ttl: config.ttl
					},
					abi: "sophia"
				});
				assert.isFulfilled(mintPromise, "Couldn't mint token");
				await mintPromise;
			});

			describe('Mint', () => {
				it('should mint 1000 token successfully', async () => {
					//Arrange
					const expectedBalance = 1000;

					//Act
					const balanceOfPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedBalance)
				});

			});
```
Before each test we deploy a new instance of the contact and mint a thousand tokens. 
We check if the balance of the owner is 1000, as much as we minted.

The next functionality which we will test is burning token.
```
			describe('Burn', () => {
				it('should burn token successfully', async () => {
					//Arrange
					const expectedBalance = 900;
					const burnAmount = 100;

					//Act
					const ownerOfPromise = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise, 'Could not call ownerOf');
					const ownerOfResult = await ownerOfPromise;

					const balanceOfPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedBalance)
				});

				it('should decrease total supply on burn', async () => {
					//Arrange
					const expectedTotalSupply = 900;
					const burnAmount = 50;

					//Act
					const ownerOfPromise1 = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise1, 'Could not call ownerOf');
					const ownerOfResult1 = await ownerOfPromise1;

					const ownerOfPromise2 = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise2, 'Could not call ownerOf');
					const ownerOfResult2 = await ownerOfPromise2;

					const balanceOfPromise = deployedContract.call('totalSupply', {
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedTotalSupply)
				})
			});
```
In the above case we burn an amount of tokens and check if the balance is as we expected.
The second test from the above snippet shows how to check the total token supply has decreased.

The scenario for the ```transfer``` function test includes the following steps:
- the owner approves an amount of tokens to non owner;
- the non owner transfers the approved amount on the behalf of the owner account;
- checking the balance of the two accounts;

```
			describe('Transfer', () => {
				it('should transfer token successfully', async () => {
					//Arrange
					const expectedBalanceOfNotOwner = 10;
					const expectedBalanceOfOwner = 990;
					const transferAmount = 10;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const transferFromPromise = secondClient.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "transferFrom", {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(transferFromPromise, 'Could not call transferFrom');

					const transferFromResult = await transferFromPromise;
					console.log(transferFromResult);

					const balanceOfNotOwnerPromise = deployedContract.call('balanceOf', {
						args: `(${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfNotOwnerPromise, 'Could not call balanceOf');
					const balanceOfNotOwnerResult = await balanceOfNotOwnerPromise;

					const balanceOwnerPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOwnerPromise, 'Could not call balanceOf');
					const balanceOfOwnerResult = await balanceOwnerPromise;

					//Assert
					const decodedBalanceOfNotOwnerResult = await balanceOfNotOwnerResult.decode("int");
					const decodedBalanceOfOwnerResult = await balanceOfOwnerResult.decode("int");

					assert.equal(decodedBalanceOfNotOwnerResult.value, expectedBalanceOfNotOwner);
					assert.equal(decodedBalanceOfOwnerResult.value, expectedBalanceOfOwner)
				});
			});
```

Тhe last functionality we will test is token ```allowance```.
We will check if the allowance is increased and decreased successfully.
```
			describe('Allowance', () => {
				it('should increase allowance successfully', async () => {
					//Arrange
					const expectedAllowance = 20;
					const transferAmount = 10;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const increaseAllowancePromise = deployedContract.call('increaseAllowance', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(increaseAllowancePromise, 'Could not call approve');
					const increaseAllowanceResult = await increaseAllowancePromise;

					const allowancePromise = deployedContract.call('allowance', {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(allowancePromise, 'Could not call approve');
					const allowancePromiseResult = await allowancePromise;

					//Assert
					const allowanceResult = await allowancePromiseResult.decode("int");

					assert.equal(allowanceResult.value, expectedAllowance)
				});

				it('should decrease allowance successfully', async () => {
					//Arrange
					const expectedAllowance = 9;
					const transferAmount = 10;
					const decreaseAmount = 1;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const decreaseAllowancePromise = deployedContract.call('decreaseAllowance', {
						args: `(${config.notOwnerPubKeyHex}, ${decreaseAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(decreaseAllowancePromise, 'Could not call approve');
					const decreaseAllowanceResult = await decreaseAllowancePromise;

					const allowancePromise = deployedContract.call('allowance', {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(allowancePromise, 'Could not call approve');
					const allowancePromiseResult = await allowancePromise;

					//Assert
					const allowanceResult = await allowancePromiseResult.decode("int");

					assert.equal(allowanceResult.value, expectedAllowance)
				})
			})
```
The final content of the ```fungibleToken.js``` test script is: 
```javascript=
const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Chain = AeSDK.Chain;
const config = require("./config.json");
const sourceFile = "./contracts/FungibleToken.aes";

describe('Fungible token', () => {

	let firstClient;
	let secondClient;
	let fungibleTokenSource;

	before(async () => {
		firstClient = await Universal({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: config.ownerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

		secondClient = await Universal({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: config.notOwnerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

		firstClient.setKeypair(config.ownerKeyPair);
		await firstClient.spend(1, config.notOwnerKeyPair.publicKey);

		fungibleTokenSource = utils.readFileRelative(sourceFile, config.filesEncoding);
	});

	describe('Deploy contract', () => {

		it('deploying successfully', async () => {
			//Arrange
			const compiledContract = await firstClient.contractCompile(fungibleTokenSource, {});

			//Act
			const deployPromise = compiledContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(deployPromise, 'Could not deploy the erc20');


			//Assert
			const deployedContract = await deployPromise;
			console.log(deployedContract);
			assert.equal(config.ownerKeyPair.publicKey, deployedContract.owner)
		})

	});

	describe('Interact with contract - positive cases', () => {
		let deployedContract;
		let compiledContract;

		beforeEach(async () => {
			compiledContract = await firstClient.contractCompile(fungibleTokenSource, {})
			deployedContract = await compiledContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
		});

		describe('Contract functionality', () => {
			beforeEach(async () => {
				const mintPromise = deployedContract.call('mint', {
					args: `(${config.pubKeyHex}, 1000)`,
					options: {
						ttl: config.ttl
					},
					abi: "sophia"
				});
				assert.isFulfilled(mintPromise, "Couldn't mint token");
				await mintPromise;
			});

			describe('Mint', () => {
				it('should mint 1000 token successfully', async () => {
					//Arrange
					const expectedBalance = 1000;

					//Act
					const balanceOfPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedBalance)
				});

			});

			describe('Burn', () => {
				it('should burn token successfully', async () => {
					//Arrange
					const expectedBalance = 900;
					const burnAmount = 100;

					//Act
					const ownerOfPromise = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise, 'Could not call ownerOf');
					const ownerOfResult = await ownerOfPromise;

					const balanceOfPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedBalance)
				});

				it('should decrease total supply on burn', async () => {
					//Arrange
					const expectedTotalSupply = 900;
					const burnAmount = 50;

					//Act
					const ownerOfPromise1 = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise1, 'Could not call ownerOf');
					const ownerOfResult1 = await ownerOfPromise1;

					const ownerOfPromise2 = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(ownerOfPromise2, 'Could not call ownerOf');
					const ownerOfResult2 = await ownerOfPromise2;

					const balanceOfPromise = deployedContract.call('totalSupply', {
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfPromise, 'Could not call balanceOf');
					const balanceOfResult = await balanceOfPromise;

					//Assert
					const decodedBalanceOfResult = await balanceOfResult.decode("int");
					assert.equal(decodedBalanceOfResult.value, expectedTotalSupply)
				})
			});

			describe('Transfer', () => {
				it('should transfer token successfully', async () => {
					//Arrange
					const expectedBalanceOfNotOwner = 10;
					const expectedBalanceOfOwner = 990;
					const transferAmount = 10;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const transferFromPromise = secondClient.contractCall(compiledContract.bytecode, 'sophia', deployedContract.address, "transferFrom", {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(transferFromPromise, 'Could not call transferFrom');

					const transferFromResult = await transferFromPromise;
					console.log(transferFromResult);

					const balanceOfNotOwnerPromise = deployedContract.call('balanceOf', {
						args: `(${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfNotOwnerPromise, 'Could not call balanceOf');
					const balanceOfNotOwnerResult = await balanceOfNotOwnerPromise;

					const balanceOwnerPromise = deployedContract.call('balanceOf', {
						args: `(${config.pubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOwnerPromise, 'Could not call balanceOf');
					const balanceOfOwnerResult = await balanceOwnerPromise;

					//Assert
					const decodedBalanceOfNotOwnerResult = await balanceOfNotOwnerResult.decode("int");
					const decodedBalanceOfOwnerResult = await balanceOfOwnerResult.decode("int");

					assert.equal(decodedBalanceOfNotOwnerResult.value, expectedBalanceOfNotOwner);
					assert.equal(decodedBalanceOfOwnerResult.value, expectedBalanceOfOwner)
				});
			});

			describe('Allowance', () => {
				it('should increase allowance successfully', async () => {
					//Arrange
					const expectedAllowance = 20;
					const transferAmount = 10;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const increaseAllowancePromise = deployedContract.call('increaseAllowance', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(increaseAllowancePromise, 'Could not call approve');
					const increaseAllowanceResult = await increaseAllowancePromise;

					const allowancePromise = deployedContract.call('allowance', {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(allowancePromise, 'Could not call approve');
					const allowancePromiseResult = await allowancePromise;

					//Assert
					const allowanceResult = await allowancePromiseResult.decode("int");

					assert.equal(allowanceResult.value, expectedAllowance)
				});

				it('should decrease allowance successfully', async () => {
					//Arrange
					const expectedAllowance = 9;
					const transferAmount = 10;
					const decreaseAmount = 1;

					//Act
					const approvePromise = deployedContract.call('approve', {
						args: `(${config.notOwnerPubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(approvePromise, 'Could not call approve');
					const approveResult = await approvePromise;

					const decreaseAllowancePromise = deployedContract.call('decreaseAllowance', {
						args: `(${config.notOwnerPubKeyHex}, ${decreaseAmount})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(decreaseAllowancePromise, 'Could not call approve');
					const decreaseAllowanceResult = await decreaseAllowancePromise;

					const allowancePromise = deployedContract.call('allowance', {
						args: `(${config.pubKeyHex}, ${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(allowancePromise, 'Could not call approve');
					const allowancePromiseResult = await allowancePromise;

					//Assert
					const allowanceResult = await allowancePromiseResult.decode("int");

					assert.equal(allowanceResult.value, expectedAllowance)
				})
			})
		})
	});
});
```
## Exchange contract - unit tests
Let's create a new script file in the test folder:
```
touch ./fungibleToken.js
```

The file starts with the following lines:
```
const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Crypto = AeSDK.Crypto;
const config = require("./config.json");
const fungibleTokenPath = "./contracts/FungibleToken.aes";
const exchangeContractPath = "./contracts/ExchangeContract.aes";
```

There are two additions compared within the first lines of the ```fungibleToken.js```:
- the ```Crypto``` module of the æternity javascript SDK which will enable us to decode the base58 addresses. You can learn more about ```Crypto``` module [here](https://dev.aepps.com/aepp-sdk-js/docs/api/utils/crypto.html);
- the path to the ```ExchangeContract.aes```;

The ```ExchangeContract``` has one main function - the ```exchange```, there are a few steps we need to accomplish, before we are able to test it. 
The steps are:
- deploy the receiving token contract;
- deploy the sending token contract;
- deploy the exchange contract with the above deployed addresses and the rate, passed as arguments; 
- mint receiving tokens to the caller account;
- mint sending tokens to the exchange contract;
- give permission to spend some amount of the first token type(receiving) to the ```ExchangeContract```;

The code for all described above, you can see in the below section:
```javascript=
const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Crypto = AeSDK.Crypto;
const config = require("./config.json");
const fungibleTokenPath = "./contracts/FungibleToken.aes";
const exchangeContractPath = "./contracts/ExchangeContract.aes";

describe('Exchange contract', () => {
	const callerAccountInitialReceivingTokens = 100;
	const exchangeContractInitialSendingTokens = 1000;
	const rate = 2;
	const approvalAmount = 50;

	let firstClient;
	let fungibleTokenSource;
	let exchangeContractSource;

	let receivingTokenAddress;
	let sendingTokenAddress;
	let exchangeContractAddress;

	let deployedReceivingTokenContract;
	let deployedSendingTokenContract;
	let deployedExchangeContract;

	before(async () => {
		firstClient = await Universal({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: config.ownerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

		fungibleTokenSource = utils.readFileRelative(fungibleTokenPath, config.filesEncoding);
		exchangeContractSource = utils.readFileRelative(exchangeContractPath, config.filesEncoding);
	});

	describe('Deploy contract', () => {

		it('deploying successfully', async () => {
			//Arrange
			const compiledFungibleTokenContract = await firstClient.contractCompile(fungibleTokenSource, {});
			const compiledExchangeContract = await firstClient.contractCompile(exchangeContractSource, {});

			//Receiving token
			const receivingTokenPromise = compiledFungibleTokenContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(receivingTokenPromise, 'Could not deploy the receiving token');

			//Assert
			deployedReceivingTokenContract = await receivingTokenPromise;
			receivingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(deployedReceivingTokenContract.address, 'ct')).toString('hex')}`;
			assert.equal(config.ownerKeyPair.publicKey, deployedReceivingTokenContract.owner);

			//Sending token
			const sendingTokenPromise = compiledFungibleTokenContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(sendingTokenPromise, 'Could not deploy the receiving token');

			//Assert
			deployedSendingTokenContract = await sendingTokenPromise;
			sendingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(deployedSendingTokenContract.address, 'ct')).toString('hex')}`;
			assert.equal(config.ownerKeyPair.publicKey, deployedSendingTokenContract.owner);

			//Exchange contract
			const exchangeContractPromise = compiledExchangeContract.deploy({
				initState: `(${receivingTokenAddress}, ${sendingTokenAddress}, ${rate})`,
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(exchangeContractPromise, 'Could not deploy the receiving token');

			//Assert
			deployedExchangeContract = await exchangeContractPromise;
			exchangeContractAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(deployedExchangeContract.address, 'ct')).toString('hex')}`;
			assert.equal(config.ownerKeyPair.publicKey, deployedExchangeContract.owner);
		});

		it('post deployment steps', async () => {
			// mint receiving tokens to caller account
			const mintReceivingPromise = deployedReceivingTokenContract.call('mint', {
				args: `(${config.pubKeyHex}, ${callerAccountInitialReceivingTokens})`,
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(mintReceivingPromise, "Couldn't mint token");
			await mintReceivingPromise;

			// check caller account receiving token balance
			const balanceOfCallerPromise = deployedReceivingTokenContract.call('balanceOf', {
				args: `(${config.pubKeyHex})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(balanceOfCallerPromise, 'Could not call balanceOf');
			const balanceOfCallerResult = await balanceOfCallerPromise;

			//Assert
			const decodedBalanceOfCallerResult = await balanceOfCallerResult.decode("int");
			assert.equal(decodedBalanceOfCallerResult.value, callerAccountInitialReceivingTokens);

			// mint sending tokens to ExchangeContract
			const mintSendingPromise = deployedSendingTokenContract.call('mint', {
				args: `(${exchangeContractAddress}, ${exchangeContractInitialSendingTokens})`,
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(mintSendingPromise, "Couldn't mint token");
			await mintSendingPromise;

			// check caller account receiving token balance
			const balanceOfExchangeContractPromise = deployedSendingTokenContract.call('balanceOf', {
				args: `(${exchangeContractAddress})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(balanceOfExchangeContractPromise, 'Could not call balanceOf');
			const balanceOfResult = await balanceOfExchangeContractPromise;

			//Assert
			const decodedBalanceOfResult = await balanceOfResult.decode("int");
			assert.equal(decodedBalanceOfResult.value, exchangeContractInitialSendingTokens);

			// approve receiving tokens from caller account to ExchangeContract
			const approvePromise = deployedReceivingTokenContract.call('approve', {
				args: `(${exchangeContractAddress}, ${approvalAmount})`,
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
			assert.isFulfilled(approvePromise, "Couldn't approve token");
			await approvePromise;

			// check ExchangeContract receiving token allowance
			const allowanceOfExchangeContractPromise = deployedReceivingTokenContract.call('allowance', {
				args: `(${config.pubKeyHex}, ${exchangeContractAddress})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(allowanceOfExchangeContractPromise, 'Could not call balanceOf');
			const allowanceOfResult = await allowanceOfExchangeContractPromise;

			//Assert
			const decodedAllowanceOfResult = await allowanceOfResult.decode("int");
			assert.equal(decodedAllowanceOfResult.value, approvalAmount);
		})

	});

	describe('Exchange function', () => {
		it('should exchange receiving/sending tokens successfully', async () => {
			const receivingTokenExchangeAmount = 5;
			const receivingTokenExpectedAmount = 95;
			const sendingTokenExpectedAmount = 10;

			const exchangePromise = deployedExchangeContract.call('exchange', {
				args: `(${receivingTokenExchangeAmount})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(exchangePromise, 'Could not call exchange function');
			await exchangePromise;

			// check caller account receiving token balance
			const balanceOfReceivingPromise = deployedReceivingTokenContract.call('balanceOf', {
				args: `(${config.pubKeyHex})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(balanceOfReceivingPromise, 'Could not call balanceOf');
			const balanceOfReceivingResult = await balanceOfReceivingPromise;

			//Assert
			const decodedBalanceOfReceivingResult = await balanceOfReceivingResult.decode("int");
			assert.equal(decodedBalanceOfReceivingResult.value, receivingTokenExpectedAmount);

			// check caller account sending token balance
			const balanceOfSendingPromise = deployedSendingTokenContract.call('balanceOf', {
				args: `(${config.pubKeyHex})`,
				options: {
					ttl: config.ttl
				}
			});
			assert.isFulfilled(balanceOfSendingPromise, 'Could not call balanceOf');
			const balanceOfSendingResult = await balanceOfSendingPromise;

			//Assert
			const decodedBalanceOfSendingResult = await balanceOfSendingResult.decode("int");
			assert.equal(decodedBalanceOfSendingResult.value, sendingTokenExpectedAmount);
		});
	});

});
```

## Executing Tests

We finished the unit tests for our ```FungibleToken``` and ```ExchangeContract``` contracts positive test cases. Let's run the test with the ```forgae test``` command. The expected output should look like this:
```
===== Starting Tests =====

  Exchange contract
    Deploy contract
      ✓ deploying successfully (11142ms)
      ✓ post deployment steps (31810ms)
    Exchange function
      ✓ should exchange receiving/sending tokens successfully (15946ms)

  Fungible token
    Deploy contract
      ✓ deploying successfully (5342ms)
    Interact with contract - positive cases
      Contract functionality
        Mint
          ✓ should mint 1000 token successfully (5324ms)
        Burn
          ✓ should burn token successfully (10619ms)
          ✓ should decrease total supply on burn (15920ms)
        Transfer
          ✓ should transfer token successfully (16920ms)
        Allowance
          ✓ should increase allowance successfully (15907ms)
          ✓ should decrease allowance successfully (15880ms)

  11 passing (3m)  
```

## Conclusion
In this tutorials we've learnt how to deal with unit tests and writing their positive test cases. In the next part we will learn how to deal with negative test cases in order to secure our smart contract.
 
The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
