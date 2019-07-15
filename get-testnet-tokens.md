# TUTORIAL: How to Get Testnet Funds

## Tutorial Overview

In this tutorial we'll briefly explain æternity testnets – what they are, what they're used for, and how to get AE tokens from a faucet for testnets.

## Prerequisites

Please read our previous tutorial [How to Create an æternity Account With CLI?](account-creation-in-ae-cli.md) in order to better understand the next steps and to follow them.

## æternity test network

Testnets are copies of the æternity blockchain almost identical to the live network except the fact that their AE tokens are worthless.

The æternity SDK team currently runs **sdk-testnet** testnets. Testnet is the latest stable release, and Mainnet is the next.

In the previous tutorial we've installed **aecli**. So we can use ```aecli chain``` to interact with the blockchain. You can see additional information for the command here:


```
Usage: aecli-chain [options] [command]

Options:
  -u --url [hostname]       Node to connect to (default: "https://sdk-mainnet.aepps.com")
  --internalUrl [internal]  Node to connect to(internal) (default: "https://sdk-mainnet.aepps.com")
  -L --limit [playlimit]    Limit for play command (default: 10)
  -f --force                Ignore node version compatibility check
  --json                    Print result in json format
  -h, --help                output usage information

Commands:
  top                       Get top of Chain
  status                    Get node version
  ttl <absoluteTtl>         Get relative ttl
  network_id                Get network ID
  play [options]            Real-time block monitoring
  broadcast [options] <tx>  Send transaction to the chain
```

### sdk-testnet

Audience – people using released versions of our SDKs. Most software developers should use this one.

Let's check the Epoch version of sdk-testnet:
```
aecli chain status -u https://sdk-testnet.aepps.com
```
expected output at the time of writing:
```

Node version____________________________ 3.3.0
Node revision___________________________ f7b59566e1dc12f48db2b5fb76f4a496e782cff9
Genesis hash____________________________ kh_wUCideEB8aDtUaiHCtKcfywU6oHZW6gnyci8Mw6S1RSTCnCRu
Network ID______________________________ ae_uat
Listening_______________________________ true
Pending transactions count______________ 0
Solutions_______________________________ 0
Syncing_________________________________ false
```

### sdk-mainnet

Audience – people developing the SDKs, developers who need the latest features from the develop branch on github. This network is used primarily for development and can be reset without notification.

Epoch version checking:
```
aecli chain status -u https://sdk-mainnet.aepps.com
```
```
Difficulty______________________________ 24810372857402
Node version____________________________ 3.1.0
Node revision___________________________ 93c2bd73ae273e3068fb16893024030cf49817b5
Genesis hash____________________________ kh_pbtwgLrNu23k9PA6XCZnUbtsvEFeQGgavY4FS2do3QP8kcp2z
Network ID______________________________ ae_mainnet
Listening_______________________________ true
Peer count______________________________ 17050
Pending transactions count______________ 1
Solutions_______________________________ 0
Syncing_________________________________ false
```

## Before funding

We are going to use the secure wallet created in the previous tutorial - ```my-ae-wallet```.
Getting wallet balance: 
```
aecli account balance <wallet_path>
```
```
Usage: aecli-account [options] [command]

Options:
  -u, --url [hostname]                                      Node to connect to (default: "https://sdk-mainnet.aepps.com")
  -U, --internalUrl [internal]                              Node to connect to(internal) (default: "https://sdk-mainnet.aepps.com")
  -P, --password [password]                                 Wallet Password
  -f --force                                                Ignore epoch version compatibility check
  --json                                                    Print result in json format
  -h, --help                                                output usage information

Commands:
  spend [options] <wallet_path> <receiver> <amount>
  transfer [options] <wallet_path> <receiver> <percentage>
  sign [options] <wallet_path> <tx>                         Create a transaction to another wallet
  balance [options] <wallet_path>                           Get wallet balance
  address [options] <wallet_path>                           Get wallet address
  create [options] <name>                                   Create a secure wallet
  save [options] <name> <privkey>                           Save a private keys string to a password protected file wallet
  nonce <wallet_path>                                       Get account nonce
```
When checking the balance of an empty wallet, the expected output should be:
```
prompt: Enter your password:  *****

API ERROR: Account not found
```
The account is not found, because the wallet actually has 0 funds and the balance is equal to 0.

Let's change that!

## Getting tokens

There is a way of getting tokens using ```sdk-testnet```. The faucets operated by the SDK team will give you tokens for no effort at all. Alternatively, you can mine your own. The SDK team does not provide tokens for the uat-testnet via a faucet.

### Faucets

The faucet form accepts just one parameter - wallet address.
Let's bring to mind how to get it:
```
aecli account address my-ae-wallet
```
The CLI will prompt you to type in your password and will give you the following output:
```

```
aecli account balance ./my-ae-wallet -u https://sdk-testnet.aepps.com
```
and we have it:

```
Nonce___________________________________ 1
```

## Mining

If you want to use your node to mine, please read the following documentation:
[Beneficiary Account and Miner Configuration](https://github.com/aeternity/epoch/blob/master/docs/configuration.md#beneficiary-account)

## Conclusion

Testnets are an incredibly useful tool in æpps development. They make the process of testing the æternity software much easier by providing safety layers on which to experiment before pushing something to the live network.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
