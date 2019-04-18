# TUTORIAL: State Channels Introduction

## Requirements

- **Node.JS** (v8.0.0)
- [Aeternity node](https://github.com/aeternity/epoch/blob/master/docs/release-notes/RELEASE-NOTES-1.1.0.md#retrieve-the-software-for-running-a-node)
- [aepp-sdk-js](https://github.com/aeternity/aepp-sdk-js) (`npm install @aeternity/aepp-sdk`)
- [bignumber.js](https://github.com/MikeMcl/bignumber.js) (`npm install bignumber.js`)

## Configuration

You need to know some configuration variables of the node you will connect to.

- URL of the API (by default `http://localhost:3013`)
- URL of the internal API (by default `http://localhost:3113`)
- URL of state channels endpoint (by default `http://localhost:3014`)
- Network ID (for example `ae_docker` if you run your node with docker)
- Host of the responder's node (for example `localhost`)
- Port of the responder's node (for example `3333`)

Let's define variables which we can use later.

```javascript
const API_URL = 'http://localhost:3013'
const INTERNAL_API_URL = 'http://localhost:3113'
const STATE_CHANNEL_URL = 'ws://localhost:3014'
const NETWORK_ID = 'ae_docker'
const RESPONDER_HOST = 'localhost'
const RESPONDER_PORT = 3333
```

## Prerequisites

1. Let's define variables for the **public key** of both accounts (initiator and responder):

```javascript
// We will use these variables to keep 
// the public keys
const initiatorAddress = 'ak_Lmp4JMbNGdfgQ68yfavm4CxBizKXn9y1aJv1E1phf1geRbncN'
const responderAddress = 'ak_MpwgJ4ZD5bctbHBmtdA6XMchpbtBKiYnMzaNwgCHvxL37mrea'
```

2. Create function for **accounts**

```javascript
import { Universal } from '@aeternity/aepp-sdk'

let initiatorAccount
let responderAccount

async function createAccounts () {
  initiatorAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: initiatorAddress,
      secretKey: 'a27376905aca058c0ca08a478515f04cb13f3a56a77705ec43a206fb6aa6c7282ce568a0488ed4823f403d908421ac5eee5703680f3fd7d1c6bdc8c6205125e2'
    }
  })
  responderAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: responderAddress,
      secretKey: '96d02824d81fdabfcb7fbcb66e2653a71ba5c4c5461dfd4fbdb0d07c4948c73d2f4a122bb84f9b1b1d65f89e4c0768ab768113a96959f664fa2288227216e71e'
    }
  })
}
```

3. Define variables for both **channels**:
```javascript
// We will use these variables to interact with 
// state channel as initiator and responder
let initiatorChannel
let responderChannel
```

4. Create functions for state channel **transactions**:
```javascript
// We will use these functions to verify and sign (or reject)
// state channel transactions as initiator and responder
async function initiatorSign (tag, tx) {
  return initiatorAccount.signTransaction(tx)
}
async function responderSign (tag, tx) {
  return responderAccount.signTransaction(tx)
}
```
5. Create functions for **connection**:
```javascript
// We will use these functions to connect to state channel
// endpoint as initiator and responder
async function connectAsInitiator (params) {
  return Channel({
    ...params,
    url: STATE_CHANNEL_URL,
    role: 'initiator',
    sign: initiatorSign
  })
}
async function connectAsResponder (params) {
  return Channel({
    ...params,
    url: STATE_CHANNEL_URL,
    role: 'responder',
    sign: responderSign
  })
}
```
For opening a channel you're going to need two accounts at least - one for the initiator and one for the responder. Create your own accounts [TUTORIAL: How to Create an æternity Account With CLI?](https://dev.aepps.com/tutorials/account-creation-in-ae-cli.html) or you can use the public and secret keys provided below for now: 

```javascript
import { MemoryAccount } from '@aeternity/aepp-sdk'

initiatorAddress = 'ak_Lmp4JMbNGdfgQ68yfavm4CxBizKXn9y1aJv1E1phf1geRbncN'
responderAddress = 'ak_MpwgJ4ZD5bctbHBmtdA6XMchpbtBKiYnMzaNwgCHvxL37mrea'

let initiatorAccount
let responderAccount

async function createAccounts () {
  initiatorAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: initiatorAddress,
      secretKey: 'a27376905aca058c0ca08a478515f04cb13f3a56a77705ec43a206fb6aa6c7282ce568a0488ed4823f403d908421ac5eee5703680f3fd7d1c6bdc8c6205125e2'
    }
  })
  responderAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: responderAddress,
      secretKey: '96d02824d81fdabfcb7fbcb66e2653a71ba5c4c5461dfd4fbdb0d07c4948c73d2f4a122bb84f9b1b1d65f89e4c0768ab768113a96959f664fa2288227216e71e'
    }
  })
}
```

Make sure that each account has at least 30000 ættos (for deposit and transaction fees).

## How to open a channel

In each channel there are two WebSocket client parties. For each channel, a new WebSocket connection is opened. Once the channel is opened - participants are equal in every regard. They have different roles while opening and we have names for them - initiator and responder. For short we will call them the parties.

Before opening a channel both parties must negotiate some paramaters. For example how many tokens each party will deposit into the channel.

Once they agree on those parameters both parties can connect to state channels endpoint. Each party will receive `channel_create_tx`. When both of them sign this transaction it will be posted on chain and state channel will be opened once this transaction is confirmed.

We need to change our sign functions to sign `channel_create_tx`.

```javascript
async function initiatorSign (tag, tx) {
  if (tag === 'initiator_sign') {
    return initiatorAccount.signTransaction(tx)
  }
}

async function responderSign (tag, tx) {
  if (tag === 'responder_sign') {
    return responderAccount.signTransaction(tx)
  }
}
```

Now let's define state channel parameters and connect both initiator and responder:

```javascript
const DEPOSIT = 1000000000000000000
const params = {
  // Public key of initiator
  // (in this case `initiatorAddress` defined earlier)
  initiatorId: initiatorAddress,
  // Public key of responder
  // (in this case `responderAddress` defined earlier)
  responderId: responderAddress,
  // Initial deposit in favour of the responder by the initiator
  pushAmount: 0,
  // Amount of tokes initiator will deposit into state channel
  initiatorAmount: DEPOSIT,
  // Amount of tokes responder will deposit into state channel
  responderAmount: DEPOSIT,
  // Minimum amount both peers need to maintain
  channelReserve: 40000,
  // Minimum block height to include the channel_create_tx
  ttl: 1000,
  // Amount of blocks for disputing a solo close
  lockPeriod: 10,
  // Host of the responder's node
  host: RESPONDER_HOST,
  // Port of the responders node
  port: RESPONDER_PORT,
}
```

Once we decided on channel parameters both participants can connect to state channel endpoint:

```javascript
// initiator connects to state channels endpoint
connectAsInitiator(params).then(channel => {
  initiatorChannel = channel
})

// responder connects to state channels endpoint
connectAsResponder(params).then(channel => {
  responderChannel = channel
})
```

You can track state channel status with `statusChanged` event listener.

```javascript
initiatorChannel.on('statusChanged', (status) => {
  if (status === 'open') {
    console.log('State channel has been opened!')  
  }
})
```

Similarly when `channel_create_tx` has been created, `onChainTx` event will be emited. This is useful if you want to track this transaction status on chain.

```javascript
initiatorChannel.on('onChainTx', (tx) => {
  console.log('channel_create_tx:', tx)
})
```

## How to transfer tokens

Let's say that we want to transfer 10 tokens from initiator account to responder account. Transfer will be initiated by initiator and responder will either sign it or reject.

First we need to update `responderSign` function. We want it to sign offchain transactions only when initiator is the sender:

```javascript
const { TxBuilder: { unpackTx } } = require('@aeternity/aepp-sdk')

async function responderSign (tag, tx) {
  if (tag === 'responder_sign') {
    return responderAccount.signTransaction(tx)
  }

  // Deserialize binary transaction so we can inspect it
  const { txType, tx: txData } = unpackTx(tx)
  // When someone wants to transfer a tokens we will receive
  // a sign request with `update_ack` tag
  if (tag === 'update_ack') {
    // Check if update contains only one offchain transaction
    // and sender is initiator
    if (
      txType === 'channelOffChain' &&
      txData.updates.length === 1 &&
      txData.updates[0].txType === 'channelOffChainUpdateTransfer' &&
      txData.updates[0].tx.from === initiatorAddress
    ) {
      return responderAccount.signTransaction(tx)  
    }
  }
}
```

Now initiator can trigger an update:

```javascript
initiatorChannel.update(
  // Sender account
  initiatorAddress,
  // Recipient account
  responderAddress,
  // Amount
  10,
  // This function should verify offchain transaction
  // and sign it with initiator's private key
  async (tx) => initiatorAccount.signTransaction(tx)
).then((result) => {
  if (result.accepted) {
    console.log('Succesfully transfered 10 tokens!')
    console.log('Current state:', result.state)
  } else {
    console.log('Transfer has been rejected')  
  }
})
```

## How to close a channel

There are multiple ways in which state channel can be closed. For the sake of simplicity we will only present mutual close in this guide.

Similar to transfering a token one party can trigger mutual close and the other party can either agree on it (sign a transaction) or reject it. This time responder will initiate mutual close and initiator will respond to this request.

We need to modify `initiatorSign` function to verify mutual close transaction:

```javascript
const { TxBuilder: { unpackTx } } = require('@aeternity/aepp-sdk')
const { BigNumber } = require('bignumber.js')

async function initiatorSign (tag, tx) {
  if (tag === 'initiator_sign') {
    return initiatorAccount.signTransaction(tx)
  }
                                        
  // Deserialize binary transaction so we can inspect it
  const { txType, tx: txData } = unpackTx(tx)
  if (tag === 'shutdown_sign_ack') {
    // Fee amount is splitted equally per participants
    const fee = BigNumber(txData.fee).div(2)
    if (
      txType === 'channelCloseMutual' &&
      // To keep things simple we manually check that
      // balances are correct (as a result of previous transfer update)
      BigNumber(txData.initiatorAmountFinal).plus(fee).eq(BigNumber(DEPOSIT).minus(10)) &&
      BigNumber(txData.responderAmountFinal).plus(fee).eq(BigNumber(DEPOSIT).plus(10))
    ) {
      return initiatorAccount.signTransaction(tx)
    }
  }
}
```

Now responder can initiate mutual close:

```javascript
responderChannel.shutdown(
  // This function should verify shutdown transaction
  // and sign it with responder's secret key 
  async (tx) => responderAccount.signTransaction(tx)
).then((tx) => {
  console.log('State channel has been closed')
  console.log('You can track this transaction onchain', tx)
})
```

## Sending generic messages

Sometimes you may want to inform other participant about something happening. For example if you implement a game in state channel you need to send player moves. Aeternity state channels allow to send generic messages.

You can listen for incoming messages with `message` handler:

```javascript
responderChannel.on('message', (msg) => {
  console.log('Received message from:', msg.sender)
  console.log(msg.info)
})
```

And now let's send the one and only "hello world" message from initiator to responder:

```javascript
initiatorChannel.sendMessage('hello world', responderAddress)
```

## Full source code

```javascript
const { Channel, Universal, TxBuilder: { unpackTx } } = require('@aeternity/aepp-sdk')
const { BigNumber } = require('bignumber.js')

const API_URL = 'http://localhost:3001'
const INTERNAL_API_URL = 'http://localhost:3001/internal'
const STATE_CHANNEL_URL = 'ws://localhost:3001'
const NETWORK_ID = 'ae_docker'
const RESPONDER_HOST = 'localhost'
const RESPONDER_PORT = 3333

const initiatorAddress = 'ak_236pSYHQFnaAy8rJMSypB2bmiNhjq3oA3zrsJMMrQyjtrw9ECK'
const responderAddress = 'ak_24RZkzfKAQCxMD66shsbEUVEbQ3inU45Gu3j3VCSgF7GwNbZaU'

let initiatorAccount
let responderAccount

async function createAccounts () {
  initiatorAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: initiatorAddress,
      secretKey: 'bb184ac1420a6c61d04ac916cbaba60bd0c10c31a945e961f28f4246b61a4ffd8877111543ee3b68b4c8ba80237200bcd54bd9e458776db5a52c1e391fd16458'
    }
  })
  responderAccount = await Universal({
    networkdId: NETWORK_ID,
    url: API_URL,
    internalUrl: INTERNAL_API_URL,
    keypair: {
      publicKey: responderAddress,
      secretKey: 'd549faca2aa008dc0d5e99268c613d29c5a23c809795ca1b88d6a6e5fe716c778b783a6b93d1f1686dfaae3f25a539799246fe0e469a11250fba02c749055c08'
    }
  })
}

async function initiatorSign (tag, tx) {
  if (tag === 'initiator_sign') {
    return initiatorAccount.signTransaction(tx)
  }
                                        
  // Deserialize binary transaction so we can inspect it
  const { txType, tx: txData } = unpackTx(tx)
  if (tag === 'shutdown_sign_ack') {
    // Fee amount is splitted equally per participants
    const fee = BigNumber(txData.fee).div(2)
    if (
      txType === 'channelCloseMutual' &&
      // To keep things simple we manually check that
      // balances are correct (as a result of previous transfer update)
      BigNumber(txData.initiatorAmountFinal).plus(fee).eq(BigNumber(DEPOSIT).minus(10)) &&
      BigNumber(txData.responderAmountFinal).plus(fee).eq(BigNumber(DEPOSIT).plus(10))
    ) {
      return initiatorAccount.signTransaction(tx)
    }
  }
}

async function responderSign (tag, tx) {
  if (tag === 'responder_sign') {
    return responderAccount.signTransaction(tx)
  }

  // Deserialize binary transaction so we can inspect it
  const { txType, tx: txData } = unpackTx(tx)
  // When someone wants to transfer a tokens we will receive
  // a sign request with `update_ack` tag
  if (tag === 'update_ack') {
    // Check if update contains only one offchain transaction
    // and sender is initiator
    if (
      txType === 'channelOffChain' &&
      txData.updates.length === 1 &&
      txData.updates[0].txType === 'channelOffChainUpdateTransfer' &&
      txData.updates[0].tx.from === initiatorAddress
    ) {
      return responderAccount.signTransaction(tx)  
    }
  }
}

async function connectAsInitiator (params) {
  return Channel({
    ...params,
    url: STATE_CHANNEL_URL,
    role: 'initiator',
    sign: initiatorSign
  })
}

async function connectAsResponder (params) {
  return Channel({
    ...params,
    url: STATE_CHANNEL_URL,
    role: 'responder',
    sign: responderSign
  })
}

const DEPOSIT = 1000000000000000000
const params = {
  // Public key of initiator
  // (in this case `initiatorAddress` defined earlier)
  initiatorId: initiatorAddress,
  // Public key of responder
  // (in this case `responderAddress` defined earlier)
  responderId: responderAddress,
  // Initial deposit in favour of the responder by the initiator
  pushAmount: 0,
  // Amount of tokens initiator will deposit into state channel
  initiatorAmount: DEPOSIT,
  // Amount of tokens responder will deposit into state channel
  responderAmount: DEPOSIT,
  // Minimum amount both peers need to maintain
  channelReserve: 40000,
  // Minimum block height to include the channel_create_tx
  ttl: 1000,
  // Amount of blocks for disputing a solo close
  lockPeriod: 10,
  // Host of the responder's node
  host: RESPONDER_HOST,
  // Port of the responders node
  port: RESPONDER_PORT,
}

createAccounts().then(() => {
  // initiator connects to state channels endpoint
  connectAsInitiator(params).then(initiatorChannel => {
    initiatorChannel.on('statusChanged', (status) => {
      if (status === 'open') {
        console.log('State channel has been opened!')  
      }
    })

    initiatorChannel.on('onChainTx', (tx) => {
      console.log('channel_create_tx:', tx)
    })

    initiatorChannel.sendMessage('hello world', responderAddress)

    initiatorChannel.update(
      // Sender account
      initiatorAddress,
      // Recipient account
      responderAddress,
      // Amount
      10,
      // This function should verify offchain transaction
      // and sign it with initiator's private key
      async (tx) => initiatorAccount.signTransaction(tx)
    ).then((result) => {
      if (result.accepted) {
        console.log('Succesfully transfered 10 tokens!')
      } else {
        console.log('Transfer has been rejected')  
      }
    })
                                                       
    initiatorChannel.on('error', err => console.log(err))
  }).catch(err => {
    console.log('Initiator failed to connect')
    console.log(err)
  })

  // responder connects to state channels endpoint
  connectAsResponder(params).then(responderChannel => {
    responderChannel.on('message', (msg) => {
      console.log('Received message from:', msg.from)
      console.log(msg.info)
    })

    // close channel after a minute
    setTimeout(() => {
      console.log('Closing channel...')
      responderChannel.shutdown(
        // This function should verify shutdown transaction
        // and sign it with responder's secret key 
        async (tx) => responderAccount.signTransaction(tx)
      ).then((tx) => {
        console.log('State channel has been closed')
        console.log('You can track this transaction onchain', tx)
      }).catch(err => console.log(err))
    }, 60000)
                                                       
    responderChannel.on('error', err => console.log(err))
  }).catch(err => {
    console.log('Responder failed to connect')
    console.log(err)
  })
})
```

## Conclusion

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
