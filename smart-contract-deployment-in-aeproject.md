# TUTORIAL: Deploying a Smart Contract on æternity with "aeproject"
## Tutorial Overview
This tutorial will walk you through the process of setting up a new æpp project using the aeproject tool. We will install **aeproject**, initialize an æpp and go through the folder structure. Once this is done we will deploy the æpp on the live network.
## Prerequisites
- Installed node.js and npm (node package manager)
- Installed docker and docker-compose. Installation instructions can be found [here](https://docs.docker.com/compose/install/)
- The private key of an account that has at least AE tokens (*estimate tx cost/fee - 87280000000000 ættos*)
- Installed Visual Studio Code 2017 for Windows users
## Installing aeproject
**aeproject** is an æternity framework which helps with setting up an æpp project. The framework makes the development of smart contracts in the æternity network very easy. It provides commands for compilation of smart contracts, running a local æternity node, unit testing and deployment of smart contracts.

### From npm global repository (recommended)

The package is available for installation from the npm global repository. You will be able to install it via the following command:
```
npm i -g aeproject
```

### Install from source

You can also clone the repository and install it from source.
```
git clone https://github.com/aeternity/aepp-aeproject-js
```
Get into the cloned repository with  ```cd aepp-aeproject-js```

Run ```npm link``` inside the ```aepp-aeproject-js``` folder (*If you have any folder permission issues, try running with sudo ```sudo npm link```*)

```npm link``` in the ```aepp-aeproject-js``` folder will create a symlink in the global folder {prefix}/lib/node_modules/aeproject that links to the package folder where the npm link command was executed.

### After installing
Now, you have a global command - ```aeproject```
With ```aeproject -h``` command you have a quick reference list of all commands:

```
Usage: aeproject [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  init [options]           Initialize AEproject
  compile [options]        Compile contracts
  test [options]           Running the tests
  env [options]            Running a local network. Without any argument node will be run with --start argument
  node [options]           Running a local node. Without any argument node will be run with --start argument
  compiler [options]       Running a local compiler. Without any arguments compiler will be run with --start argument
  deploy [options]         Run deploy script
  history [options]        Show deployment history info
  contracts [options]      Running a Contract web aepp locally and connect it to the spawned aeproject node.
  shape <type> [type]      Initialize a web Vue project.
  export-config [options]  Export miner account, few funded accounts  and default node configuration.
  inspect [options] <tx>   Unpack and verify transaction (verify nonce, ttl, fee, account balance)
  fire-editor [options]    Download, install and run locally the Fire Editor
  compatibility [options]  Start env with latest versions and test the current project for compatibility
```

## Generating the æpp project structure
### Initialize æpp

The first thing we need to do is create a project folder and initialize its structure.

Let's create a folder for our project:
```
mkdir ~/myFirstAepp
```

Go to the newly created folder ```cd ~/myFirstAepp``` and initialize the æpp with:
```
aeproject init
```
The init command creates an æpp structure with several folders and scripts:

- contracts - directory in which the developer can create contracts
   - ExampleContract.aes -  a sample smart contract coming with the init. **We will be deploying this one.**
```
contract CryptoHamster =
   datatype event = NewHamster(indexed int, string, hash)

   record state = { hamsters : map(string, hash), next_id : int }

   stateful entrypoint init() = { hamsters = {}, next_id = 0 }

   entrypoint nameExists(name: string) : bool =
      Map.member(name, state.hamsters)

   stateful entrypoint createHamster(hamsterName: string) =
      require(!nameExists(hamsterName), "Name is already taken")
      createHamsterByNameDNA(hamsterName, generateDNA(hamsterName))

   entrypoint getHamsterDNA(hamsterName: string) : hash =
      require(nameExists(hamsterName), "Hamster does not exist!")
      state.hamsters[hamsterName]

   stateful function createHamsterByNameDNA(name: string, dna: hash) =
      put(state{hamsters[name] = dna, next_id = (state.next_id + 1)})
      Chain.event(NewHamster(state.next_id, name, dna))

   function generateDNA(name : string) : hash =
      String.sha3(name)
```
- deployment - directory that contains the deployment scripts
    - `deploy.js` - an examplary deployment script coming with the init
    
- test - directory containing the unit test files that the developer writes
    - `exampleTest.js` - an examplary test script coming with the init
    
- docker - directory with docker configuration files, allowing for easy use of a local version of the æternity network

## Deploying ExampleContract on the live æternity network
The **deploy** command helps developers run their deployment scripts for their æpp. The sample deployment script is scaffolded in deployment folder.
```
Usage: deploy [options]

Run deploy script

Options:
  --path [deploy path]        Path to deployment file (default: "./deployment/deploy.js")
  -n --network [network]      Select network (default: "local")
  --networkId [networkId]     Configure your network id
  -s --secretKey [secretKey]  Wallet secretKey(privateKey)
  --compiler [compiler_url]   Url to the desired compiler
  -h, --help                  output usage information
```

Deploy ExampleContract.aes on mainnet with the following command: 
```
aeproject deploy -n mainnet -s <secretKey>
```

Final output upon deployment:
```
===== Contract: ExampleContract.aes has been deployed at [contract address] =====
Your deployment script finished successfully!
```

## Deploying ExampleContract on the sdk-testnet
The command for deploying on the testnet is similar to the one above, but with a different ```--network``` parameter:
```
aeproject deploy -n testnet -s <secretKey>
```

## Conclusion
Deploying smart contracts to the æternity network is nice and easy. In just a few minutes and few commands, one can deploy their desired contracts on any network. The æternity team will keep this tutorial updated with news. If you encounter any problems please contact us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
