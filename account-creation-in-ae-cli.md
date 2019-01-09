# TUTORIAL: How to Create an æternity Account With CLI?
## Tutorial Overview
Each account on the æternity blockchain is represented by a private and public key pair. The public key is your identity to the outside world. The private key you use to sign transactions, and must at all costs be kept secret. If your private key is discovered by someone else, they can use it to impersonate you and take your tokens. You must keep your private key secret.

This tutorial will walk you through the process of creating an account (wallet) through the **AECLI** tool. We will install **aepp-cli-js**(javascript version of CLI), create an account and will go through the basic account commands.
## Prerequisites
- Installed node.js and npm (node package manager)
## Installing aecli
One of the better features of æternity's JavaScript SDK is that it comes with a command-line interface (short - CLI, or AECLI). We are going to use the CLI from now on so lets install it first.
### Install from source
Currently, to use the CLI, you must clone the repository and install it from source.
```
git clone https://github.com/aeternity/aepp-cli-js.git
```
Get into the cloned repository with  ```cd aepp-cli-js```

Run ```npm link``` in order to link the AECLI to ```aecli/bin/aecli.js``` (*If you have any folder permission issues, try running with sudo ```sudo npm link```*)

```npm link``` command will create a symlink in the global node_modules folder and expose the CLI binary to be used through the terminal.
### From npm global repository (comming soon)

The package will soon be available for installation from the global npm repository. You will be able to install it via the following command:
```
npm i -g @aeternity/aecli
```
## After install
The CLI can be invoked using the command ```aecli```.
If you invoke the AECLI with no arguments, it shows basic usage:
```
Usage: aecli [options] [command]

Options:
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  config         Print the client configuration
  chain          Interact with the blockchain
  inspect        Get information on transactions, blocks,...
  account        Handle wallet operations
  contract       Compile contracts
  name           AENS system
  tx             Transaction builder
  crypto         Crypto helpers
  help [cmd]     display help for [cmd]
```

## Account commands
The account (wallet) commands are those used to create and report on key pairs. Using the Account commands, you can create a wallet, add some coins to it, send coins and view the wallet’s address (public key) and private key.

In this tutorial we will focus on the ```account``` group (mostly ```account create```), which handles wallet operations.
## Create a secure wallet 
Create command details:
```
aecli account create <name> [options] 
```
- <name> - the name of the wallet
- Тhe option capabilities of the command are the following:
```
Options:
  -u, --url [hostname]                               Node to connect to (default: "https://sdk-mainnet.aepp.com")
  -U, --internalUrl [internal]                       Node to connect to(internal) (default: "https://sdk-mainnet.aepp.com")
  --native                                           Build transaction natively
  --networkId [networkId]                            Network ID (default: ae_mainnet)
  -P, --password [password]                          Wallet Password
  -n, --nonce [nonce]                                Override the nonce that the transaction is going to be sent with
  -f --force                                         Ignore epoch version compatibility check
  --json                                             Print result in json format
  -h, --help                                         Output usage information
```
    
Let's create our new æternity account:
```
aecli account create my-ae-wallet --password 12345
```
Expected output: 
```
Wallet saved
    Wallet address________________ ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
    Wallet path___________________ ~/aeternity-project/my-ae-wallet
```

The above command generates a wallet file with name - ```my-ae-wallet```, located where the command was executed.
The content of wallet file looks like this:
```
{"name":"my-ae-wallet","version":1,"public_key":"ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx","id":"55de7645-d692-4b7f-ba08-30d73018d521","crypto":{"secret_type":"ed25519","symmetric_alg":"xsalsa20-poly1305","ciphertext":"3a09b310f27235feee1028782ca770e3c7562f4fb2e49df1650a81d27504d70a0fefd0f90848996ea71b4676dc9d4ee6f626b7e438473e0b8731aee1a2fae08f1c63b8445e4088dfae26c31ee61e864d","cipher_params":{"nonce":"cbe0c81ef70cd2173b10071003462cc562d81c794ea2e823"},"kdf":"argon2id","kdf_params":{"memlimit_kib":65536,"opslimit":3,"parallelism":1,"salt":"f3445dee19949ac08f2aeb0e73a0c634"}}}
```
View the address (public key) of your wallet using the following command:
```
aecli account address my-ae-wallet
```
The CLI will prompt you to type in your password and will give you the following output:

```
Your address is: ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
```

In order to get the private key of an account one can use the following command:
```
aecli account address my-ae-wallet --privateKey
```
Type your password in and you will see output similar to this:

```
Your address is: ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx
Your private key is: 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

## Conclusion
Accounts (wallets) are digital key pairs associated with your digital assets.

As you can see, the tool **AECLI** allows you to create your account with just a few commands. Once you have your wallet set up, remember not to share your private keys with anyone, never lose them and store them safely in a location where you can retrieve on demand. Your wallet is now ready to execute blockchain actions for you. Go ahead and try spending, deploying and  all the goodies AE has to offer.

The æternity team will be keeping this tutorial updated. If you encounter any problems please contract us through the [aeternity dev forum](https://forum.aeternity.com/c/development).