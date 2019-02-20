# TUTORIAL: How to Register and Update a Name with the SDK in Javascript


This tutorial explains how to use the æternity javascript SDK to register and update name using the æternity naming system.

In the current state the æternity protocol only allows for names to end in ".test", later in development more namespaces will be added. This tutorial should be run on the live æternity network, registering persistent names, but the ".test" limitation applies.

## Prerequisites

 - up to date npm and nodejs installed
 - private and public key for an account with some balance ([create an account](account-creation-in-ae-cli.md); [get testnet tokens](get-testnet-tokens.md))

## Setup

1. Create a directory for the project and initialize it with npm:

```
mkdir aepp-name-registration-tutorial
cd aepp-name-registration-tutorial
npm init -y
```

2. Install the aepp-sdk dependency `npm install --save @aeternity/aepp-sdk`

3. Create a example project file `index.js` in this directory

4. Setup example code structure in `index.js`, this does require the SDK dependency and setup a sync function in which we can build the naming workflow

```
const {Universal} = require('@aeternity/aepp-sdk');

const main = async (name) => {

};
```

## SDK Naming Workflow

A name registration is done in three steps for security reasons: 
1. The name is pre-claim is a hidden commitment to register some name. 
2. The name can be claimed and made public without anyone being able to steal it, as it has been pre-claimed before. 
3. Now the name can be updated to attach some data to it and make it usable.

### 1. Initialize SDK client

To create the SDK client referencing a live æternity network node and the needed public and private keys, add following source code snippet inside the main function:

```
const publicKey = 'REPLACE_WITH_PUBLIC_KEY';

const client = await Universal({
    url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    keypair: {
        publicKey: publicKey,
        secretKey: 'REPLACE_WITH_PRIVATE_KEY'
    },
    networkId: 'ae_uat', //replace with ae_mainnet for mainnet
    nativeMode: true
});
```


### 2. Pre-claim Name

Pre-claiming requires to create a "commitment" to register the name. It uses a secret salt and the name, which are hashed together. This is done automatically, whenthe SDK function is used as described. At the end of the defined main function, add following:

```
const preclaim = await client.aensPreclaim(name);
console.log(preclaim);
```

We're going to use the `console.log()` output later to visualize if all the steps worked as intended.


### 3. Claim Name

After pre-claiming a name we need to make the name and chosen salt public to prove that our account is the owner of the name inside the main function at the end. This is done automatically, when the SDK function is used as described. Add following source code snippet at the end of the defined main function:

```
const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
console.log(claim);
```

### 4. Update Name

The name should be registered to the account now and can be updated to provide functionalities like pointing to an oracle, contract or account (wallet). We demonstrated in this tutorial how to point the name to the original account. This means that any transaction can be sent to this account, refering to its name, instead of the public key (which is much more user-friendly) now. At the end of the defined main function, add following:

```
const update = await client.aensUpdate(claim.id, publicKey);
console.log(update);
```

## Execution

Add `main('YOUR_NAME_TO_REGISTER.test');` at the end of the file and run `node index.js` afterwards to execute, register and update the name.

This might take some time, as it requires the mining of blocks on the live network. The output should show  something similar as below:

```
$ node index.js
{ height: 6136, 
  claim: [Function: claim],
  salt: 8857366628560215,
  commitmentId: 'cm_6QEmSiHNyoubscGq7m1sdach3Y5wYCgPAbfqma3RKsc5Gv1uV' }
{ id: 'nm_2jKvt8rv6rx1c1zEQsbpiivJ9S6b8LVojsrtaRQsXK4S2DgBaD',
  pointers: [],
  ttl: 56137,
  update: [Function],
  transfer: [Function] }
{ blockHash: 'mh_GEPmJd86m4zT4wPnfrwVnT1Zb6hjpQNJLH4m7MGCL34aLMT4h',
  blockHeight: 6137,
  hash: 'th_2pKBvthWUtbG39gcwL6hCrV2jLr2JS1F5VUYcywjRYMnLXjECb',
  signatures:
   [ 'sg_Ae7gFueHnbiftLWA1t6hpXYhPSwDqcjAF128Q4BqRgEsVX7ANhA1fdvmeMw6ff4eoZaeWDfwjkBXHpebghexFzW9urB52' ],
  tx:
   { accountId: 'ak_c3LfYDjLqdNdWHUCV8NDv1BELhXqfKxhmKfzh4cBMpwj64CD7',
     clientTtl: 1,
     fee: 19000,
     nameId: 'nm_2jKvt8rv6rx1c1zEQsbpiivJ9S6b8LVojsrtaRQsXK4S2DgBaD',
     nameTtl: 10000,
     nonce: 17,
     pointers:
      [ { id: 'ak_c3LfYDjLqdNdWHUCV8NDv1BELhXqfKxhmKfzh4cBMpwj64CD7',
          key: 'account_pubkey' } ],
     ttl: 6637,
     type: 'NameUpdateTx',
     version: 1 } }
```


## Final Example Project File

```
const {Universal} = require('@aeternity/aepp-sdk');

const main = async (name) => {
  const publicKey = 'REPLACE_WITH_PUBLIC_KEY';

  const client = await Universal({
    url: 'http://52.56.252.75:3013',
    internalUrl: 'http://52.56.252.75:3013',
    keypair: {
        publicKey: publicKey,
        secretKey: 'REPLACE_WITH_PRIVATE_KEY'
    },
    networkId: 'ae_mainnet',
    nativeMode: true
  });

  const preclaim = await client.aensPreclaim(name);
  console.log(preclaim);

  const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
  console.log(claim);

  const update = await client.aensUpdate(claim.id, publicKey);
  console.log(update);
};

main('YOUR_NAME_TO_REGISTER.test');
```

## Further Documentation

æternity's Naming System Protocol: https://github.com/aeternity/protocol/blob/master/AENS.md

Please post your questions to the [æternity Forum](https://forum.aeternity.com/c/development) in case you've experienced any issue.


