# TUTORIAL: Deploying a Smart Contract on æternity with "forgae"
## Tutorial Overview
This tutorial will walk you through the process of setting up a new æpp project using the forgae tool. We will install **forgae**, initialize an æpp and go through the folder structure. Once this is done we will deploy the æpp on the live network.
## Prerequisites
- Installed node.js and npm (node package manager)
- Installed docker and docker-compose. Installation instructions can be found [here](https://docs.docker.com/compose/install/)
- The private key of an account that has at least AE tokens (*estimate tx cost/fee - 1677680 AET*)
## Installing forgae
**forgae** is an æternity framework which helps with setting up an æpp project. The framework makes the development of smart contracts in the æternity network very easy. It provides commands for compilation of smart contracts, running a local æternity node, unit testing and deployment of smart contracts.

### From npm global repository (recommended)

The package is available for installation from the npm global repository. You will be able to install it via the following command:
```
npm i -g forgae
```

### Install from source

You can also clone the repository and install it from source.
```
git clone https://github.com/aeternity/aepp-forgae-js.git
```
Get into the cloned repository with  ```cd aepp-forgae-js```

Run ```npm link``` inside the ```aepp-forgae-js``` folder (*If you have any folder permission issues, try running with sudo ```sudo npm link```*)

```npm link``` in the ```aepp-forgae-js``` folder will create a symlink in the global folder {prefix}/lib/node_modules/forgae that links to the package folder where the npm link command was executed.

### After installing
Now, you have a global command - ```forgae```
With ```forgae -h``` command you have a quick reference list of all commands:

```
Usage: forgae [options] [command]

Options:
  -V, --version        output the version number
  -h, --help           output usage information

Commands:
  init [options]       Initialize ForgAE
  compile [options]    Compile contracts
  test [options]       Running the tests
  node [options]       Running a local node. Without any argument node will be runned with --start argument
  deploy [options]     Run deploy script
  history [options]    Show deployment history info
  contracts [options]  Running a Contract web aepp locally and connect it to the spawned forgae node.
  shape <type> [type]  Initialize a web Vue project.
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
forgae init
```
The init command creates an æpp structure with several folders and scripts:

- contracts - directory in which the developer can create contracts
    - ExampleContract.aes -  a sample smart contract coming with the init. **We will be deploying this one.**
    ```
    contract ExampleContract =
       type state = ()
       function main(x : int) = x 
    ```
- deployment - directory that contains the deployment scripts
    - `deploy.js` - an examplary deployment script coming with the init
    
- test - directory containing the unit test files that the developer writes
    - `exampleTest.js` - an examplary test script coming with the init
    
- docker - directory with docker configuration files, allowing for easy use of a local version of the æternity network

## Deploying ExampleContract on the live æternity network
The **deploy** command helps developers run their deployment scripts for their æpp. The sample deployment script is scaffolded in deployment folder.
```
forgae deploy [path] [network] [secretKey]
```
- **--path** - path to a deployment file, default value is ```./deployment/deploy.js```
- **--network** (**-n**) - specify the network (ex. mainnet)
- **--secretKey** (**-s**) - secret(private) key that will unlock the wallet that will be used to deploy the contract

Deploy ExampleContract.aes on mainnet with the following command: 
```
forgae deploy -n mainnet -s <secretKey>
```

Final output upon deployment:
```
===== Contract: ExampleContract.aes has been deployed =====
Your deployment script finished successfully!
```

## Deploying ExampleContract on the sdk-testnet
The command for deploying on the testnet is similar to the one above, but with a different ```--network``` parameter:
```
forgae deploy -n testnet -s <secretKey>
```

## Conclusion
Deploying smart contracts to the æternity network is nice and easy. In just a few minutes and few commands, one can deploy their desired contracts on any network. The æternity team will keep this tutorial updated with news. If you encounter any problems please contact us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
