# TUTORIAL: Simple Fungible Token Exchange Smart Contract - Part 3
## Tutorial Overview
The third part of the tutorial will show you how to write a deployment procedure script, which will facilitate interaction with the contract.

## Prerequisites
- Created the two contract ```FungibleToken.aes``` and ```ExchangeContract.aes``` from the first part - [Simple Fungible Token Exchange Smart Contract - Part 1](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-1.md)
- Review the second part of the tutorial - [Part 2](https://github.com/aeternity/tutorials/blob/master/sophia-token-exchange-contract-2.md)

## Scripted approach

In the first part of the tutorial we have already created the contracts - ```FungibleToken.aes``` and ```ExchangeContract.aes```. They remain unchanged.

Current tutorial section will be focus on building a deploy script which will include:
- constants for:
    - path to the wallet file;
    - initial amount of a receiving tokens intended for the caller account;
    - initial amount of a sending tokens intended for the ExchangeContract;
    - exchange rate;
- reading public key from wallet file and decode it;
- deploying the receiving token contract and decode its deployed token contract address;
- deploying the sending token contract and decode its deployed token contract address;
- deploying the exchange contact with initial parameters - the both decoded token addresses and rate;
- calling mint function of the receiving token contract with beneficiary - the caller account address;
- checking receiving token balance of the caller account;
- calling mint function of the sending token contract with beneficiary - the ExchangeContract address;

Аfter successfully running the script described above, there will be left 3 things to be done:
- in order to be able to perform the transferFrom function of FungibleToken contract our Exchange contract has to have permission to spend some amount of the first token type(receiving). We will use the approve function;
- execution of the exchange function;
- checking the receiving and sending token balances of the caller account;

We will completely change the ```deploy.js``` file, located at ```exchangeContract/deployment/deploy.js```. 
*Please clear the file content and begin clean writing.*

We start with import of the ```Crypto``` module of the æternity javascript SDK will enable us to decode the base58 addresses. You can learn more about ```Crypto``` module [here](https://dev.aepps.com/aepp-sdk-js/docs/api/utils/crypto.html).

Here is the first lines and a well-known structure of the file:
```
const AeSDK = require('@aeternity/aepp-sdk');
const Crypto = AeSDK.Crypto;

const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey) => {

    ...
    ...

};

module.exports = {
	deploy
};

```

The body of deploy function starts with the three constants. I will use the same token amounts and rate as in the first approach. It is up to you whether to change them or not:
```
const callerAccountInitialReceivingTokens = 100;
const exchangeContractInitialSendingTokens = 1000;
const rate = 2;
```

Next step is to create a ```deployer``` instance: 

```
let deployer = new Deployer(network, privateKey);
```

Reading and decoding of the caller account public key is done by:

```
const callerPubKey = deployer.keypair.publicKey;
const myAeWalletPublicKeyDecoded = `0x${Crypto.decodeBase58Check(Crypto.assertedType(callerPubKey, 'ak')).toString('hex')}`;
```

After that, we will deploy our first(receiving) token contract, get the base58 address from the response and decode it:
```
console.log(`\n===== Receiving Token Contract =====`);
const receivingTokenWrapper = await deployer.deploy("./contracts/FungibleToken.aes");
const receivingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(receivingTokenWrapper.address, 'ct')).toString('hex')}`;
console.log(`-> Receiving token contract decoded address: ${receivingTokenAddress}`);
``` 

We will repeat the above step, but for the sending token contract:

```
console.log(`\n===== Sending Token Contract =====`);
const sendingTokenWrapper = await deployer.deploy("./contracts/FungibleToken.aes");
const sendingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(sendingTokenWrapper.address, 'ct')).toString('hex')}`;
console.log(`-> Sending token contract decoded address: ${sendingTokenAddress}`);
```

The deployment of ExchangeContract is slightly different, because of the init parameters. We have to pass them deploy function as [tuple](https://dev.aepps.com/aepp-sdk-docs/Sophia.html). 

```
console.log(`\n===== Exchange Contract =====`);
const exchangeContractWrapper = await deployer.deploy("./contracts/ExchangeContract.aes", undefined, `(${receivingTokenAddress}, ${sendingTokenAddress}, ${rate})`);
const exchangeContractAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(exchangeContractWrapper.address, 'ct')).toString('hex')}`;
console.log(`-> Exchange contract decoded address: ${exchangeContractAddress}`);
```

The result of each execution of the deploy function is ```wrapper``` object. It looks like this:
```
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_7ZAHtarTweeCzpx4dcDhWTk1CcJxTEBMhrd75Dmt7R4TsGKbq',
  address: 'ct_2n5p4duByTMqMayR3C7CakcS2RNSW5ih9NqHBXSdtFx9PfYds1',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-04T09:06:04.483Z }
``` 
and allows us to call functions of the deployed contract.

Let's call mint function of the receiving token with beneficiary - the caller account.

```
// mint receiving tokens to caller account
console.log('\n===== Minting receiving tokens to the caller account =====');
await receivingTokenWrapper.call('mint', {
    args: `(${myAeWalletPublicKeyDecoded}, ${callerAccountInitialReceivingTokens})`,
    options: {
        ttl: 55
    },
    abi: "sophia"
});
```

Let's get the receiving token balance of the caller account and print it to console:

```
// check receiving token balance of caller account
const callerBalance = await receivingTokenWrapper.call('balanceOf', {
    args: `(${myAeWalletPublicKeyDecoded})`,
    options: {
        ttl: 55
    }
});

const callerReceivingTokenBalance = await callerBalance.decode('int');

console.log(`\nThe caller account has: ${callerReceivingTokenBalance.value} Receiving Tokens`);
```

Finally, let's mint sending tokens to the ExchangeContract address and check its balance:

```
// mint sending tokens to ExchangeContract
console.log('\n===== Minting sending tokens to the ExchangeContract =====');
await sendingTokenWrapper.call('mint', {
    args: `(${exchangeContractAddress}, ${exchangeContractInitialSendingTokens})`,
    options: {
        ttl: 55
    },
    abi: "sophia"
});

// check sending token balance of ExchangeContract
const exchangeContractBalance = await sendingTokenWrapper.call('balanceOf', {
    args: `(${exchangeContractAddress})`,
    options: {
        ttl: 55
    }
});

const exchangeContractSendingTokenBalance = await exchangeContractBalance.decode('int');

console.log(`\nThe ExchangeContract has: ${exchangeContractSendingTokenBalance.value} Sending Tokens\n`);
```

The completed ```deploy.js``` file you can see here:
```javascript=
const AeSDK = require('@aeternity/aepp-sdk');
const Crypto = AeSDK.Crypto;

const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey) => {
	const callerAccountInitialReceivingTokens = 100;
	const exchangeContractInitialSendingTokens = 1000;
	const rate = 2;

	let deployer = new Deployer(network, privateKey);

	const callerPubKey = deployer.keypair.publicKey;
	const myAeWalletPublicKeyDecoded = `0x${Crypto.decodeBase58Check(Crypto.assertedType(callerPubKey, 'ak')).toString('hex')}`;

	console.log(`\n===== Receiving Token Contract =====`);
	const receivingTokenWrapper = await deployer.deploy("./contracts/FungibleToken.aes");
	const receivingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(receivingTokenWrapper.address, 'ct')).toString('hex')}`;
	console.log(`-> Receiving token contract decoded address: ${receivingTokenAddress}`);

	console.log(`\n===== Sending Token Contract =====`);
	const sendingTokenWrapper = await deployer.deploy("./contracts/FungibleToken.aes");
	const sendingTokenAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(sendingTokenWrapper.address, 'ct')).toString('hex')}`;
	console.log(`-> Sending token contract decoded address: ${sendingTokenAddress}`);

	console.log(`\n===== Exchange Contract =====`);
	const exchangeContractWrapper = await deployer.deploy("./contracts/ExchangeContract.aes", undefined, `(${receivingTokenAddress}, ${sendingTokenAddress}, ${rate})`);
	const exchangeContractAddress = `0x${Crypto.decodeBase58Check(Crypto.assertedType(exchangeContractWrapper.address, 'ct')).toString('hex')}`;
	console.log(`-> Exchange contract decoded address: ${exchangeContractAddress}`);

	// mint receiving tokens to caller account
	console.log('\n===== Minting receiving tokens to the caller account =====');
	await receivingTokenWrapper.call('mint', {
		args: `(${myAeWalletPublicKeyDecoded}, ${callerAccountInitialReceivingTokens})`,
		options: {
			ttl: 55
		},
		abi: "sophia"
	});

	// check receiving token balance of caller account
	const callerBalance = await receivingTokenWrapper.call('balanceOf', {
		args: `(${myAeWalletPublicKeyDecoded})`,
		options: {
			ttl: 55
		}
	});

	const callerReceivingTokenBalance = await callerBalance.decode('int');

	console.log(`\nThe caller account has: ${callerReceivingTokenBalance.value} Receiving Tokens`);

	// mint sending tokens to ExchangeContract
	console.log('\n===== Minting sending tokens to the ExchangeContract =====');
	await sendingTokenWrapper.call('mint', {
		args: `(${exchangeContractAddress}, ${exchangeContractInitialSendingTokens})`,
		options: {
			ttl: 55
		},
		abi: "sophia"
	});

	// check sending token balance of ExchangeContract
	const exchangeContractBalance = await sendingTokenWrapper.call('balanceOf', {
		args: `(${exchangeContractAddress})`,
		options: {
			ttl: 55
		}
	});

	const exchangeContractSendingTokenBalance = await exchangeContractBalance.decode('int');

	console.log(`\nThe ExchangeContract has: ${exchangeContractSendingTokenBalance.value} Sending Tokens\n`);
};

module.exports = {
	deploy
};
```

Let's run our local network:
```
forgae node
```

We are ready to run our deploy script:
```
forgae deploy
```

The result should look as follows: 
```
===== Receiving Token Contract =====
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
  transaction: 'th_zXYbgU5NVMHif4LEKqHUbe1Yw4s72mqXGeYt1LSq3awDGQRhs',
  address: 'ct_CF7R6Q8VSirY2MguEi8ukGWMStUFGiNXzpbo1KST4gNNvCiD5',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-21T12:46:58.361Z }
-> Receiving token contract decoded address: 0x19877d65b8e253d10e7b0319a45191b7ef8919b6d73551d4dbdb3b1a59f4eb3c

===== Sending Token Contract =====
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
  transaction: 'th_2E61F7Xbho25x8sGWinn2mRjPMMu5o3uysWt3vbKmahnpCwgUH',
  address: 'ct_q1cKXEbgxJ6WmUTQwrSdsCZsbB8ygUV6Pk8TpFwBsujkNSRme',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-21T12:46:59.614Z }
-> Sending token contract decoded address: 0x6d03829c7c61f395ab39aa0200e6849ff5916384d195ef4a77b0c597ba7ea245

===== Exchange Contract =====
===== Contract: ExchangeContract.aes has been deployed =====
{ owner: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
  transaction: 'th_rscBoiBkPyfYKAAU5e6Bby1MLVyxSMc5y1Ub4FKEhnbQ26zXK',
  address: 'ct_Lu9XYdtkDbTSJuadtMXkJHe2ybrF5dPAK973AMEURyZkMUEZw',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-21T12:47:00.804Z }
-> Exchange contract decoded address: 0x2d2eed67337a96e2f0819cf6cdf754947dbd6ac95659a84e656b0fb856170478

===== Minting receiving tokens to the caller account =====

The caller account has: 100 Receiving Tokens

===== Minting sending tokens to the ExchangeContract =====

The ExchangeContract has: 1000 Sending Tokens
```
The output is verbose and gives us all we need to execute the final three steps of this tutorial.

Let's give permissions to ExchangeContract to spend form the caller's receiving tokens:
```
aecli contract call ./owner-wallet --password 12345 
approve bool 0x2d2eed67337a96e2f0819cf6cdf754947dbd6ac95659a84e656b0fb856170478 
50  
--contractAddress ct_CF7R6Q8VSirY2MguEi8ukGWMStUFGiNXzpbo1KST4gNNvCiD5 
-u http://localhost:3001 
--internalUrl http://localhost:3001/internal --networkId ae_devnet
```

The first parameter of the approve function is the decoded address of ExchangeContract. You can take it from the above output ```-> Exchange contract decoded address: 0x2d2eed67337a96e2f0819cf6cdf754947dbd6ac95659a84e656b0fb856170478```. The ```contractAddress``` parameter is the receiving token contract address as base58 - ```ct_CF7R6Q8VSirY2MguEi8ukGWMStUFGiNXzpbo1KST4gNNvCiD5```, taken from the same output.

We will use the same exchange amount as used in the previous section - 5.

```
aecli contract call ./owner-wallet --password 12345 
exchange bool 5 
--contractAddress ct_Lu9XYdtkDbTSJuadtMXkJHe2ybrF5dPAK973AMEURyZkMUEZw 
-u http://localhost:3001 
--internalUrl http://localhost:3001/internal --networkId ae_devnet
```

Here the address ```ct_Lu9XYdtkDbTSJuadtMXkJHe2ybrF5dPAK973AMEURyZkMUEZw``` is our ExchangeContract deployed by newly created script.

Finally, let's check if the balances are as we expect them to be: 

Тhe *receiving* tokens balance:

```
aecli contract call ./owner-wallet --password 12345 
balance_of int 0xe9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca 
--contractAddress ct_CF7R6Q8VSirY2MguEi8ukGWMStUFGiNXzpbo1KST4gNNvCiD5 
-u http://localhost:3001 
--internalUrl http://localhost:3001/internal --networkId ae_devnet
```
```
Return value (decoded)___ 95
```
So far so good, let's check our sending token balance:

```
aecli contract call ./owner-wallet --password 12345 
balance_of int 0xe9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca 
--contractAddress ct_q1cKXEbgxJ6WmUTQwrSdsCZsbB8ygUV6Pk8TpFwBsujkNSRme 
-u http://localhost:3001 
--internalUrl http://localhost:3001/internal --networkId ae_devnet
```
```
Return value (decoded)___ 10
```
Our account balance before exchange: 
- **100** *receiving* tokens;
- **0** *sending* tokens;

The balance after exchange:
- **95** *receiving* tokens;
- **10** *sending* tokens;

Both approaches have their advantages and disadvantages. It is up to you to decide which one to use.

## Conclusion
Exchange contracts and the mechanics bellow them are valuable blockchain development skill. The applications are endless and, as you saw, it is extremely easy to reap the benefits. Stay tuned for the upcoming Oracle Based Exchange Smart contracts tutorial.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).

