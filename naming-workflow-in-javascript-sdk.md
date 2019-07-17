# TUTORIAL: How to Register and Update a Name with the SDK in Javascript

This tutorial explains how to use the æternity javascript SDK to register and update name using the æternity naming system.

In the current state the æternity protocol only allows for names to end in ".test", later in development more namespaces will be added. This tutorial should be run on the live æternity network, registering persistent names, but the ".test" limitation applies.

## Prerequisites

- up to date npm and nodejs installed
- private and public key for an account with some balance ([create an account](account-creation-in-ae-cli.md); [get testnet tokens](get-testnet-tokens.md))

## Setup

- Step 1: Create a directory for the project and initialize it with npm:

```
$ mkdir aepp-naming
$ cd aepp-naming
$ npm init -y
```

- Step 2: Install the aepp-sdk dependency

```
npm install --save @aeternity/aepp-sdk
```

- Step 3: Create a example project file `index.js` in this directory
- Step 4: Setup example code structure in `index.js`, this does require the SDK dependency and setup a sync function in which we can build the naming workflow

```
const {Universal} = require('@aeternity/aepp-sdk');

const main = async (name) => {

};
```

### Check if you are on track

- Step 1 Output

```
{
  "name": "aepp-naming",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

- Step 2 Output
```
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN aepp-naming@1.0.0 No description
npm WARN aepp-naming@1.0.0 No repository field.

+ @aeternity/aepp-sdk@4.2.0
added 376 packages from 303 contributors and audited 6660 packages in 281.21s
found 0 vulnerabilities
```

## SDK Naming Workflow

A name registration is done in three steps for security reasons. First, the name is pre-claimed, this registers a hidden commitment to register some name. Afterwards, this name can be claimed, making it public without anybody being able to steal it, as it was pre-claimed before. Then the name can be updated, to attach some data to it and make it usable.

## Initialize SDK client

Inside the main function, to create the SDK client referencing a live æternity network node and the needed public and private keys, add:

```
const publicKey = 'ak_KwMaLaTpXCW25ztTjFBKwZ7E3EXfWqVmKwt1doFdar33q7ESW'; // replace with your publicKey
const privateKey = 'PRIVATE_KEY';

const client = await Universal({
  url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
  internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
  keypair: {
      publicKey: publicKey,
      secretKey: privateKey
  },
  networkId: 'ae_uat', //replace with ae_mainnet for mainnet
  nativeMode: true
});
```

## Pre-Claim Name

Pre-claiming requires to create a "commitment" to register the name, using a secret salt and the name, hashed together. This is done automatically using the SDK function as described. At the end of the defined main function, add:

```
const preclaim = await client.aensPreclaim(name);
console.log(preclaim);
```

we use the `console.log()` output later to visualize all steps were working as intended.


## Claim Name

After pre-claiming a name we need to make the name and chosen salt public to prove that our account is the owner of the name. Inside the main function at the end. This is done automatically using the sdk function as described. At the end of the defined main function, add:

```
const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
console.log(claim);
```

## Update Name

Afterwards, the name is registered to the account and can be updated to provide functionallity as to point to an oracle, contract or account (wallet). In this tutorial we demonstrate how to point the name to the original account, so any transaction can be sent to this account, refering to its name, instead of the public key (which is much more user-friendly). At the end of the defined main function, add:

```
const update = await client.aensUpdate(claim.id, publicKey);
console.log(update);
```

## Execution

Add `main('YOUR_NAME_TO_REGISTER.test');` in the end of the file, then run `node index.js` to run, register and update the name. Example `main('aeternity.test');`

This may take some time, as it requires the mining of blocks on the live network. It will show output similar to:

```
{
  blockHash: 'mh_2paafEHgn6EAmfYg5bFSYBatDvLhhdUUVB1viNXdia7jQpc5pN',
  blockHeight: 111011,
  hash: 'th_BBaG2E1bd8pRzib962sS81YP4zo5jutwutr5priJxEvKmhxjk',
  signatures: [
    'sg_6M4igwmJ6iZGKBFZC7bPbesn22ZTjyDUpaDZv8vdEqSCHU9AG3xGbBTfzojmr7ax6FJRjpTA2iGWR27zJ196YA3DZf7Vi'
  ],
  tx: {
    accountId: 'ak_KwMaLaTpXCW25ztTjFBKwZ7E3EXfWqVmKwt1doFdar33q7ESW',
    commitmentId: 'cm_bcht5Lyi7q1QL3VsSHf4Pw6XhQ6dMBrRGXCQzVLr5EjKUH6KB',
    fee: 16620000000000,
    nonce: 1,
    type: 'NamePreclaimTx',
    version: 1
  },
  rawTx: 'tx_+JkLAfhCuEAo3LYRq4pxcGG23tJMyB4Z8aIwpnC37xQg/XXzLJPH2W07OIWNqAjOkfao77hsq4vEdFHEY2uD8eoE+pTqpL4FuFH4TyEBoQEq/8Yk44hEMs/rjCuqiwR20lapAXBcbVbpSMD8QHuQngGhA06ZVSzOVGS+enhZBySdIHyvv44GdOBoYCMmyhH+NHy5hg8dpTI4AAAfjr8I',
  height: 111011,
  claim: [Function: claim],
  salt: 3722830630237751,
  commitmentId: 'cm_bcht5Lyi7q1QL3VsSHf4Pw6XhQ6dMBrRGXCQzVLr5EjKUH6KB'
}
```

### Confirmation Image For Successful name

You should get this type of output when your name has been recorded successfully
![confirmation_image](https://i.ibb.co/dtgbt19/confirmation.png)

## Final Example Project File

```
const {Universal} = require('@aeternity/aepp-sdk');

const main = async (name) => {
  const publicKey = 'ak_rLoCtHE3NK9dKyCNonJFYWkEEfeAsDUWa887GsCKqV1rhSuT6'; // replace with your publicKey
  const privateKey = 'PRIVATE_KEY';

  const client = await Universal({
    url: 'https://sdk-mainnet.aepps.com', //replace with https://sdk-testnet.aepps.com for testnet
    internalUrl: 'https://sdk-mainnet.aepps.com', //replace with https://sdk-testnet.aepps.com for testnet
    keypair: {
        publicKey: publicKey,
        secretKey: privateKey
    },
    networkId: 'ae_mainnet', //replace with ae_uat for testnet
    nativeMode: true
  });

  const preclaim = await client.aensPreclaim(name);
  console.log(preclaim);

  const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
  console.log(claim);

  const update = await client.aensUpdate(claim.id, publicKey);
  console.log(update);
};

main('emmanueljet.test');
```

## Further Documentation

æternity's Naming System Protocol: [https://github.com/aeternity/protocol/blob/master/AENS.md](https://github.com/aeternity/protocol/blob/master/AENS.md)

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development).
