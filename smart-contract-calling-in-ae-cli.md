# TUTORIAL: Call a deployed contract using the CLI

## Tutorial Overview
This tutorial will walk you through the process of calling a function of deployed contract.
## Prerequisites
- We will reuse ExampleContract which was deployed in our previous tutorial [Deploying a Smart Contract on æternity with “forgae”](smart-contract-deployment-in-forgae.md)(ToDo: we have to add link to published tutorial) and we are going to call its main function.  
- Account with testnet/edgenet funds ([How to Get Testnet Funds](get-testnet-tokens.md) - referencing tutorial)
- Installed **aecli** (take a look at [this tutorial](account-creation-in-ae-cli.md#installing-aecli) to to remind yourself on installing the javascript version of aecli)

## Checking if the preconditions have been fulfilled

### aecli
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

### Wallet with balance

We are aiming to call a function of our *ExampleContract* deployed on **sdk-edgenet**.
Let’s check the balance of wallet on the above network:

```
aecli account balance ./my-ae-wallet -u https://sdk-edgenet.aepps.com
```
The CLI will prompt you to type in your password and should give you similar output:
```
Your balance is: 250000000000000000000
```

### Deployed contract

The command for depoying on the edgenet is:
```
forgae deploy -n https://sdk-edgenet.aepps.com -s 195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7
```

And the expected result is:
```
===== Contract: ExampleContract.aes has been deployed =====
{ owner: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  transaction: 'th_SaC8i2mCgdnGQvjoMB6ksirXCTb1Qx73nN8fjFcBKk4SBGW1e',
  address: 'ct_2KtGYFX1RTX5LZjasbjusZuMuL6KdddtDPND5Bd84G7TnF7oSv',
  call: [Function],
  callStatic: [Function],
  createdAt: 2018-12-18T10:15:46.593Z }
Your deployment script finished successfully!

```

## Execution

Our contract has the following code:
```
contract ExampleContract =
   type state = ()
   function main(x : int) = x 

```

We will use **aecli** to call the **main** function. It waits for one integer parameter and returns the same one as response.
In this tutorial we will focus on the contract group (mostly contract call), which executes a function's of contract.

### aecli contract command details

```
Usage: aecli-contract [options] [command]

Options:
  -u --url [hostname]                                                        Node to connect to (default: "https://sdk-mainnet.aepps.com")
  --internalUrl [internal]                                                   Node to connect to(internal) (default: "https://sdk-mainnet.aepps.com")
  --networkId [networkId]                                                    Network id (default: ae_mainnet)
  --native                                                                   Build transaction natively
  -T, --ttl [ttl]                                                            Validity of the transaction in number of blocks (default forever) (default: 0)
  -n, --nonce [nonce]                                                        Override the nonce that the transaction is going to be sent with
  -f --force                                                                 Ignore epoch version compatibility check
  --json                                                                     Print result in json format
  -h, --help                                                                 output usage information

Commands:
  compile <file>                                                             Compile a contract
  call [options] <wallet_path> <fn> <return_type> [args...]                  Execute a function of the contract
  callChecked [options] <wallet_path> <fn> <return_type> <callContractPath>  Execute a function of the contract using type-checked call
  deploy [options] <wallet_path> <contract_path>                             Deploy a contract on the chain
```
The general structure of **aecli contract call** command is following:
```
aecli contract call <wallet_path> 
--password <wallet_password> 
--contractAddress <deployed_contract_address> 
<function_name> <parameter_type> <parameter_value> 
-u <node_to_connect> --internalUrl 
<node_to_connect_internal> --networkId 
<network_id>
```

The actual values for the above placeholders in our case are:

- wallet_path - `./my-ae-wallet`
- wallet_password - `12345`
- deployed_contract_address - `ct_2KtGYFX1RTX5LZjasbjusZuMuL6KdddtDPND5Bd84G7TnF7oSv` (address property from the response of deploy transaction)
- function_name - `main`
- parameter_type - `int`
- parameter_value - `4`(random integer number)
- node_to_connect and node_to_connect_internal - `https://sdk-edgenet.aepps.com`
- network_id - `ae_devnet`

Let's pack all together and execute command:

```
aecli contract call ./my-ae-wallet 
--password 12345 
--contractAddress ct_2KtGYFX1RTX5LZjasbjusZuMuL6KdddtDPND5Bd84G7TnF7oSv 
main int 4 
-u https://sdk-edgenet.aepps.com 
--internalUrl https://sdk-edgenet.aepps.com 
--networkId ae_devnet
```

The successful execution gives to us a verbose output like this one:
```
Contract address_________ ct_2KtGYFX1RTX5LZjasbjusZuMuL6KdddtDPND5Bd84G7TnF7oSv
Gas price________________ 1
Gas used_________________ 192
Return value (encoded)___ cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARfjTDm
Return value (decoded)___ 4
Return remote type_______ word
```

As we can see the execution of our main function with parameter 4, returns 4. 

## Conclusion
Calling the contract's function is simple as executing one command with a few arguments and options. This is a quick and easy way to test our function executions on test environment. 
The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).