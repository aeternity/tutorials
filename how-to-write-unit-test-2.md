# TUTORIAL: How to write Unit tests for Sophia smart contracts - Part 2
## Tutorial Overview
There are two main testing strategies in software testing: positive testing and negative testing.

Positive testing determines that your application works as expected. If an error is encountered during positive testing, the test fails. This strategy is shown in the [first part](https://github.com/aeternity/tutorials/blob/master/how-to-write-unit-test-1.md) of the tutorial.

Negative testing ensures that your application can gracefully handle invalid input or unexpected user behavior. For example, if a user tries to execute a contract function with invalid parameters, the correct behavior in this case would be to throw an exception. The purpose of negative testing is to detect such situations and prevent the *aeproject* from crashing. Also, negative testing helps you improve the quality of your application and find its weak points.

## Prerequisites
Before we go any further, please make sure you have followed the [first part](https://github.com/aeternity/tutorials/blob/master/how-to-write-unit-test-1.md) of *How to write Unit tests for Sophia smart contracts*.

## Content
This tutorial, will show you how to write tests for the negative test cases for ```FungibleToken.aes``` and ```ExchangeContract.aes``` contracts.

## Fungible token contract - unit tests
We will add the negative tests to the ```fungibleToken.js``` created in the first part.
Below is the list of our negative test cases:
- trying to mint a fungible tokens to an invalid account;
- trying to burn an invalid amount of fungible tokens;
- trying to transfer a tokens between accounts without approval;

Please add the below code snippet in the ```fungibleToken.js``` as the last *describe* section:
```
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
				it('should not mint to invalid address', async () => {
					const invalidAddressPromise = deployedContract.call('mint', {
						args: `(#0, 123)`,
						options: {
							ttl: config.ttl
						}
					});

					await assert.isRejected(invalidAddressPromise, 'Invocation failed');
				});
			});

			describe('Burn', async () => {
				it('shouldn`t burn invalid amount of tokens', async () => {
					const burnAmount = 10000;

					const invalidAmountPromise = deployedContract.call('burn', {
						args: `(${burnAmount})`,
						options: {
							ttl: config.ttl
						}
					});

					await assert.isRejected(invalidAmountPromise, 'Invocation failed');
				});
			});

			describe('Transfer', async () => {
				it('shouldn`t transfer token without approve', async () => {
					//Arrange
					const expectedBalanceOfNotOwner = 0;
					const expectedBalanceOfOwner = 1000;
					const transferAmount = 123;

					const transferFromPromise = deployedContract.call('transfer_from', {
						args: `(${config.notOwnerPubKeyHex}, ${config.pubKeyHex}, ${transferAmount})`,
						options: {
							ttl: config.ttl
						}
					});

					await assert.isRejected(transferFromPromise, 'Invocation failed');

					const balanceOfNotOwnerPromise = deployedContract.call('balance_of', {
						args: `(${config.notOwnerPubKeyHex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(balanceOfNotOwnerPromise, 'Could not call balance_of');
					const balanceOfNotOwnerResult = await balanceOfNotOwnerPromise;

					const balanceOwnerPromise = deployedContract.call('balance_of', {
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
					assert.equal(decodedBalanceOfOwnerResult.value, expectedBalanceOfOwner);
				})
			});

		})
```
## Exchange contract - unit tests
The negative test will cover the case where one user is trying to call the ```exchange``` function without previously approved tokens(receivingToken) from caller to еxchange contract.
We will add two additional *describe* section in our ```exchangeContract.js```. The first one will execute the deployment procedure, but will skip the post deployment *approve* step. The other will try to execute exchange function and will check the balance of the two involved accounts. The balances should remain unchanged.
Here is the code described above:
```
	describe('Deploy contract - without approval', () => {

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
			assert.equal(decodedAllowanceOfResult.value, 0);
		})

	});

	describe('Exchange function - negative case', () => {
		it('shouldn\'t exchange receiving/sending tokens successfully', async () => {
			const receivingTokenExchangeAmount = 5;
			const receivingTokenExpectedAmount = 100;
			const sendingTokenExpectedAmount = 0;

			const exchangePromise = deployedExchangeContract.call('exchange', {
				args: `(${receivingTokenExchangeAmount})`,
				options: {
					gas: config.gas,
					ttl: config.ttl
				}
			});
			await assert.isRejected(exchangePromise, 'Invalid tx');

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
```

## Executing Tests
We added the negative tests, which improves the testing coverage of our contracts. The expected output should look like this:

```
===== Starting Tests =====

  Exchange contract
    Deploy contract
      ✓ deploying successfully (5774ms)
      ✓ post deployment steps (26446ms)
    Exchange function
      ✓ should exchange receiving/sending tokens successfully (10730ms)
    Deploy contract - without approval
      ✓ deploying successfully (10697ms)
      ✓ post deployment steps (21141ms)
    Exchange function - negative case
      ✓ shouldn't exchange receiving/sending tokens successfully (10548ms)

  Fungible token
    Deploy contract
      ✓ deploying successfully (5354ms)
    Interact with contract - positive cases
      Contract functionality
        Mint
          ✓ should mint 1000 token successfully (5228ms)
        Burn
          ✓ should burn token successfully (10482ms)
          ✓ should decrease total supply on burn (15614ms)
        Transfer
          ✓ should transfer token successfully (10694ms)
        Allowance
          ✓ should increase allowance successfully (5711ms)
          ✓ should decrease allowance successfully (15762ms)
    Interact with contract - negative cases
      Contract functionality
        Mint
          ✓ should not mint to invalid address (274ms)
        Burn
          ✓ shouldn`t burn invalid amount of tokens (209ms)
        Transfer
          ✓ shouldn`t transfer token without approve (5800ms)


  16 passing (4m) 
```

## Conclusion
Using the negative and positive testing approaches together allows us to test our applications with any possible scenarios and can help us make our application more stable and reliable.
 
The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
