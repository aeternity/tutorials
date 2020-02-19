# TUTORIAL: How to Register and Update a Name with the SDK in Javascript

This tutorial explains how to use the æternity javascript SDK to register and update a name using the æternity naming system (AENS).

In the current state the æternity protocol allows for names to end in ".chain", later in development more namespaces may be added. This tutorial should be run on the live æternity network, registering persistent names, but the ".chain" limitation applies.

## Prerequisites

- up to date npm and nodejs installed
- private and public key for an account with some balance ([create an account](account-creation-in-ae-cli.md); [get testnet tokens](get-testnet-tokens.md))

## Setup

#### Step 1: Create a directory for the project and initialize it with npm:

```
mkdir aepp-naming
cd aepp-naming
npm init -y
```

#### Step 2: Install the aepp-sdk dependency

```
npm install --save @aeternity/aepp-sdk
```

#### Step 3: Create a example project file `index.js` in this directory

```
touch index.js
```

#### Step 4: Setup example code structure in `index.js`, this does require the SDK dependency and setup a sync function in which we can build the naming workflow

```
const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk')

const main = async (name) => {

}
```

## SDK Naming Workflow

A name registration is done in three steps for security reasons. First, the name is pre-claimed, this registers a hidden commitment to register some name. Afterwards, this name can be claimed, making it public without anybody being able to steal it, as it was pre-claimed before. Then the name can be updated, to attach some data to it and make it usable.

## Initialize SDK client

Inside the main function, to create the SDK client referencing a live æternity network node and the needed public and private keys, add:

```
  const node = await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' })
  const acc = MemoryAccount({
      keypair: {
        publicKey: 'PUBLIC_KEY',
        secretKey: 'SECRET_KEY'
      }
  })
  const client = await Ae({
      nodes: [
        { name: 'node', instance: node },
      ],
      accounts: [
        acc,
      ],
  })
```

## Pre-Claim Name

Pre-claiming requires to create a "commitment" to register the name, using a secret salt and the name, hashed together. This is done automatically using the SDK function as described. At the end of the defined main function, add:

```
  const preclaim = await client.aensPreclaim(name)
  console.log(preclaim)
```

We use the `console.log()` output to visualize that all steps are working as intended.


## Claim Name

After pre-claiming a name we need to make the name and chosen salt public to prove that our account is the owner of the name. This is done automatically using the SDK function as described. At the end of the defined main function, add:

```
  const claim = await client.aensClaim(name, preclaim.salt)
  console.log(claim)
```

## Update Name

Afterwards, the name is registered to the account and can be updated to provide functionality as to point to an oracle, contract, or account (wallet). In this tutorial we demonstrate how to point the name to the original account, so any transaction can be sent to this account, referring to its name, instead of the public key (which is much more user-friendly). At the end of the defined main function, add:

```
  const update = await client.aensUpdate(name, ['PUBLIC_KEY'])
  console.log(update)
```

## Execution

Add `main('YOURNAMETOREGISTER.chain');` in the end of the file, then run `node index.js` to run, register, and update the name. Example `main('iloveaeternity.chain');`

This may take some time, as it requires the mining of blocks on the live network. It will show an output similar to:

```
{
  blockHash: 'mh_26dsYP5zuNnrSEhhx5fpr5mmQnebRzUhgXMVYMmkPmNjzxwhdo',
  blockHeight: 214758,
  hash: 'th_2NERTWA1hLZ5VDzqL52og9NWFVJ96AHzQvgUN5weQpZa4C86kA',
  signatures: [
    'sg_XKZbLZHB5DztaAmeWqmjjnsTE76w6QMvVh1k4aBsAKigsz41yDFU6FHy51vwNh259yoQXiHACfbv9NNpSoiMpXuhZExBT'
  ],
  tx: {
    accountId: 'ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF',
    commitmentId: 'cm_31nBvaeqisLXy83sM9MqU4BUXRM2bUk2XW3sayagmNtZd6Guk',
    fee: 16620000000000,
    nonce: 36,
    type: 'NamePreclaimTx',
    version: 1
  },
  rawTx: 'tx_+JkLAfhCuEDnwQv9fDijWcpry4ecGRMG2E0m7FoKUJIXZGboBCmLqoJkqomxurdmjtvQI17jygF9TMspvkPeD9kOmTc6/rQFuFH4TyEBoQFcdkASNRizxnqtaehFb7cuz58KwPjwBEfgvMwnTDPG6SShAwSSXe3/humZsGKCilh9yIRZq7fX4LyO7ZDQhHZQv/Xvhg8dpTI4AAC2j2g6',
  height: 214758,
  claim: [Function: claim],
  salt: 7474803452166061,
  commitmentId: 'cm_31nBvaeqisLXy83sM9MqU4BUXRM2bUk2XW3sayagmNtZd6Guk'
}
{
  blockHash: 'mh_2keWSGeLmUWsMoA7W15TndtT4oCTvPtT96m3xZayX32j32oiYp',
  blockHeight: 214760,
  hash: 'th_b2J1kKdonYEhi8muLWAZwf7pFJY4D5ejoQzAtKMwF4vFUSAiZ',
  signatures: [
    'sg_4Cjyi3tZ2GQ2FEMxvU8hgV1oeKWscFyFU4RhPUUWb1YwFkkDkNwYWKVmr1GswjBe8EaLHJDaYPp3iy8eE4mVzdRh1QvDD'
  ],
  tx: {
    accountId: 'ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF',
    fee: 16700000000000,
    name: 'iloveaeternity.chain',
    nameFee: '2865700000000000000',
    nameSalt: '7474803452166061',
    nonce: 37,
    type: 'NameClaimTx',
    version: 2
  },
  rawTx: 'tx_+J0LAfhCuEAYemQHg/O6BruhsvnEYopD4JQp3wYrJepUsUCE2fc9NB4fu759MYBYKyIONJldZy/Sc7chWUwAJL3D1L85gv8CuFX4UyACoQFcdkASNRizxnqtaehFb7cuz58KwPjwBEfgvMwnTDPG6SWUaWxvdmVhZXRlcm5pdHkuY2hhaW6HGo5LTIg/rYgnxQL3hNZAAIYPMEWRWAAAFr6UEw==',
  id: 'nm_48dMWykeWZGg3uvv1Ks2irFWtWkM2qhNVtmjhcRFiNKX77Jum',
  pointers: [],
  ttl: 264760,
  update: [Function],
  transfer: [Function],
  revoke: [Function],
  extendTtl: [Function]
}
{
  blockHash: 'mh_i3iWBFX9e1F3uXCEn45QHb4Gz8x95GV6aTrrePLq4NARZP8qh',
  blockHeight: 214760,
  hash: 'th_2ZgVgcvz6copLJeE1do4V1ptiTwcGLsr9yo3eDDEAX48J6Pw2f',
  signatures: [
    'sg_WXvx5gbDTRJJUCKKTX13eayQY4psCyMrP9qLH8sTQ9K6YtgBG1uADF8vA52e7Qau7vFcWDihh9TSowPzUWcz2rmT8VZZJ'
  ],
  tx: {
    accountId: 'ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF',
    clientTtl: 84600,
    fee: 17780000000000,
    nameId: 'nm_48dMWykeWZGg3uvv1Ks2irFWtWkM2qhNVtmjhcRFiNKX77Jum',
    nameTtl: 50000,
    nonce: 38,
    pointers: [ [Object] ],
    type: 'NameUpdateTx',
    version: 1
  },
  rawTx: 'tx_+NMLAfhCuEDhvY52ldEbTWV/eJASFiejX/5qo3iZh4Smdag3ssQbpWXbBcCtsvRFbfp/koZhAlhAL+96T6pK6c1XSBwNkbABuIv4iSIBoQFcdkASNRizxnqtaehFb7cuz58KwPjwBEfgvMwnTDPG6SahAgccRikEtBT5x2rbOuq7wtcGhsWw3BWTBIXBp3dPff50gsNQ8vGOYWNjb3VudF9wdWJrZXmhAVx2QBI1GLPGeq1p6EVvty7PnwrA+PAER+C8zCdMM8bpgwFKeIYQK7qViAAAdtdKtg=='
}
```

## Final Example Project File

```
const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk')

const main = async (name) => {

  const node = await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' })
  const acc = MemoryAccount({
      keypair: {
        publicKey: 'PUBLIC_KEY',
        secretKey: 'SECRET_KEY'
      }
  })
  const client = await Ae({
      nodes: [
        { name: 'node', instance: node },
      ],
      accounts: [
        acc,
      ],
  })
  const preclaim = await client.aensPreclaim(name)
  console.log(preclaim)
  const claim = await client.aensClaim(name, preclaim.salt)
  console.log(claim)
  const update = await client.aensUpdate(name, ['PUBLIC_KEY'])
  console.log(update)
}

main('iloveaeternity.chain')
```

## Further Documentation

æternity's Naming System Protocol: [https://github.com/aeternity/protocol/blob/master/AENS.md](https://github.com/aeternity/protocol/blob/master/AENS.md)

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development).
