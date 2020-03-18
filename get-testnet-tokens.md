# TUTORIAL: How to Get Testnet Funds?
## Tutorial Overview
In this tutorial we'll briefly explain the æternity testnet – what it is, what it's used for, and how to get AE tokens from a faucet for the testnet.
## Prerequisites
- Please read our previous tutorial [How to Create an æternity Account With CLI?](account-creation-in-ae-cli.md) in order to better understand the next steps and to follow them.
## æternity test network
The testnet of the æternity blockchain is almost identical to the live network except the fact that their AE tokens are worthless.

The æternity SDK team currently runs the **sdk-testnet**. This testnet represents the latest stable release.

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
Audience – people using released versions of our SDKs. Most software developers should use this for testing purposes.

Let's check the Epoch version of sdk-testnet:
```
aecli chain status -u https://sdk-testnet.aepps.com
```
expected output at the time of writing:
```
Difficulty______________________________ 90814248
Node version____________________________ 5.2.0
Node revision___________________________ c6c12b039971ebe9a367d76826c6acbbd966fa0d
Genesis hash____________________________ kh_wUCideEB8aDtUaiHCtKcfywU6oHZW6gnyci8Mw6S1RSTCnCRu
Network ID______________________________ ae_uat
Listening_______________________________ true
Peer count______________________________ 10776
Pending transactions count______________ 3
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
  generate [options] <count>                                Generate keyPairs
```
When checking the balance of an empty wallet, the expected output should be:
```
aecli account balance ./my-ae-wallet -u https://sdk-testnet.aepps.com
prompt: Enter your password:  *****

API ERROR: Account not found
```
The account is not found, because the wallet actually has 0 funds and the balance is equal to 0.

Let's change that!
## Getting tokens
There are two ways of getting tokens. The faucet operated by the SDK team will give you tokens for no effort at all. Alternatively, you can mine your own.
### Faucet
- sdk-testnet - https://faucet.aepps.com/

In the next steps we're going to show you how to get tokens from the faucet for **sdk-testnet**.

The faucet form accepts just one parameter - wallet address.
Let's bring to mind how to get it:
```
aecli account address my-ae-wallet
```
The CLI will prompt you to type in your password and will give you the following output:
```
Address_________________________________ ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF
```
We are placing a request and just few seconds later, our account is topped up:
```
Added 5AE!

Transaction: th_wL1GZR2fJ6RDXbGuoh7xVeLhpThSN91K6UfM4RYyg5Xf8CUQK

Account: ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF
Balance: 5 AE
```
Finally, let's check the balance of wallet on **sdk-testnet**:
```
aecli account balance ./my-ae-wallet -u https://sdk-testnet.aepps.com
```
and we have it:
```
Balance_________________________________ 5000000000000000000
ID______________________________________ ak_hipJRoK6hfiRgcejJchpXwhDJKcN5AQ3yGmqmCU8rWJ2A3BXF
Nonce___________________________________ 1
```
### Mining
If you want to use your node to mine, please read the following documentation:
[Beneficiary Account and Miner Configuration](https://github.com/aeternity/epoch/blob/master/docs/configuration.md#beneficiary-account)

## Conclusion
The testnet is an incredibly useful tool in æpps development. It makes the process of testing the æternity software much easier by providing safety layers on which to experiment before pushing something to the live network.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
