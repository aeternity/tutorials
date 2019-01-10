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

We are ready to run our deploy script:
```
forgae deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```
Replaced with my secret key: 
```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

The result should look as follows: 
```
===== Receiving Token Contract =====
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_oth8waRBW5ytKCEUhsUFc42usyJTdGUdp432Cjza9Tu6Mg8o7',
  address: 'ct_2g67Zd8ucmphSPbZdBQ8qPC9ggrEjfBhFq7iuznCZbfASo8yTC',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-04T09:05:52.373Z }
-> Receiving token contract decoded address: 0xdc7356882cf3808c2bf3ca1996e4fd058b4c6cdabd289e23d531a2231750b8a6

===== Sending Token Contract =====
===== Contract: FungibleToken.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_2JKbK6sTbnYwVUWVfcPNREdbQ56iT8tuuNpZwpTG9KpQXSc6FN',
  address: 'ct_n6PevDfHJUK79jcywm6yUDxwZFVXiZcbC5tzzaVLQ6NPWrNAD',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-04T09:05:58.817Z }
-> Sending token contract decoded address: 0x666398102d926ac04be814a4a1039de761f9442cee130550314bfb32c1fbc60c

===== Exchange Contract =====
===== Contract: ExchangeContract.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_7ZAHtarTweeCzpx4dcDhWTk1CcJxTEBMhrd75Dmt7R4TsGKbq',
  address: 'ct_2n5p4duByTMqMayR3C7CakcS2RNSW5ih9NqHBXSdtFx9PfYds1',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-04T09:06:04.483Z }
-> Exchange contract decoded address: 0xea0ffd74acdad939f26d3ef1251a7131d2ac34830b0bac49a889187721a7c153

===== Minting receiving tokens to the caller account =====

The caller account has: 100 Receiving Tokens

===== Minting sending tokens to the ExchangeContract =====

The ExchangeContract has: 1000 Sending Tokens

Your deployment script finished successfully!
```
The output is verbose and gives us all we need to execute the final three steps of this tutorial.

Let's give permissions to ExchangeContract to spend form the caller's receiving tokens:
```
aecli contract call ./my-ae-wallet --password 12345 
approve bool 0xea0ffd74acdad939f26d3ef1251a7131d2ac34830b0bac49a889187721a7c153 
50  
--contractAddress ct_2g67Zd8ucmphSPbZdBQ8qPC9ggrEjfBhFq7iuznCZbfASo8yTC 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

The first parameter of the approve function is the decoded address of ExchangeContract. You can take it from the above output ```-> Exchange contract decoded address: 0xea0ffd74acdad939f26d3ef1251a7131d2ac34830b0bac49a889187721a7c153```. The ```contractAddress``` parameter is the receiving token contract address as base58 - ```ct_2g67Zd8ucmphSPbZdBQ8qPC9ggrEjfBhFq7iuznCZbfASo8yTC```, taken from the same output.

We will use the same exchange amount as used in the previous section - 5.

```
aecli contract call ./my-ae-wallet --password 12345 
exchange bool 5 
--contractAddress ct_2n5p4duByTMqMayR3C7CakcS2RNSW5ih9NqHBXSdtFx9PfYds1 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```

Here the address ```ct_2n5p4duByTMqMayR3C7CakcS2RNSW5ih9NqHBXSdtFx9PfYds1``` is our ExchangeContract deployed by newly created script.

Finally, let's check if the balances are as we expect them to be: 

Тhe *receiving* tokens balance:

```
aecli contract call ./my-ae-wallet --password 12345 
balanceOf int 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 
--contractAddress ct_2g67Zd8ucmphSPbZdBQ8qPC9ggrEjfBhFq7iuznCZbfASo8yTC 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
```
```
Return value (decoded)___ 95
```
So far so good, let's check our sending token balance:

```
aecli contract call ./my-ae-wallet --password 12345 
balanceOf int 0xa2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7 
--contractAddress ct_n6PevDfHJUK79jcywm6yUDxwZFVXiZcbC5tzzaVLQ6NPWrNAD 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com --networkId ae_devnet
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

