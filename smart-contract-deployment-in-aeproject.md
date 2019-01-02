# TUTORIAL: Deploying a Smart Contract on æternity with "aeproject"
## Tutorial Overview
This tutorial will walk you through the process of setting up a new æpp project using the aeproject tool. We will install **aeproject**, initialize an æpp and go through the folder structure. Once this is done we will deploy the æpp on the live network.
## Prerequisites
- Installed aeternity node and npm (have a look [here](LINK) to learn how to install an æternity node)
- Installed docker and docker-compose. Installation instructions can be found [here](https://docs.docker.com/compose/install/)
- The private key of an account that has at least AE tokens (*estimate tx cost/fee - 1671168 AET*)
## Installing aeproject
**aeproject** is an æternity framework which helps with setting up an æpp project. The framework makes the development of smart contracts in the æternity network very easy. It provides commands for compilation of smart contracts, running a local aeternity node, unit testing and deployment of smart contracts.

### Install from source

Currently, to use the framework, you must clone the repository and install it from source.
```
git clone https://github.com/aeternity/aeproject.git
```
Get into the cloned repository with  ```cd aeproject```

Run ```npm link``` inside the ```aeproject``` folder (*If you have any folder permission issues, try running with sudo ```sudo npm link```*)

```npm link``` in the aeproject folder will create a symlink in the global folder {prefix}/lib/node_modules/aeproject that links to the package folder where the npm link command was executed.


### From npm global repository (comming soon)

The package will soon be available for installation from the npm global repository. You will be able to install it via the following command:
```
npm i -g aeproject
```

### After install
Now, you have a global command - ```aeproject```
With ```aeproject -h``` command you have a quick reference list of all commands:

```
Usage: aeproject [options] [command]

Options:
  -V, --version      output the version number
  -h, --help         output usage information

Commands:
  init [options]     Initialize aepp project
  compile [options]  Compile contracts
  test [options]     Running the tests
  epoch [options]    Running the epoch. Without any argument epoch will be runned with --start argument
  deploy [options]   Run deploy script
```

## Generating the æpp project structure
### Initialize æpp

The first thing we need to do is create a project folder and initialize its structure.

Let's create a folder for our project:
```
mkdir ~/Development/myFirstAepp
```

Go to a newly created folder ```cd ~/Development/myFirstAepp``` and initialize the æpp with:
```
aeproject init
```
The init command creates an æpp structure with several folders and scripts:

- contracts - directory in which the developer can create contracts
    - ExampleContract.aes -  an sample smart contract coming with the init. **We will be deploying this one.**
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
aeproject deploy [path] [network] [secretKey]
```
- **-path** - path to a deployment file, default value is ```./deployment/deploy.js```
- **-network** (**-n**) - specify the url to a node in this network (ex. https://sdk-mainnet.aepp.com)
- **-secretKey** (**-s**) - secret(private) key that will unlock the wallet that will be used to deploy the contract

Deploy ExampleContract.aes on mainnet with the following command: 
```
aeproject deploy -n https://sdk-mainnet.aepp.com  -s <secretKey>
```

## Deploying ExampleContract on the sdk-edgenet
The command for depoying on the edgenet is similar to the one above above, but with different ```--network``` paramerter:
```
aeproject deploy -n https://sdk-edgenet.aepps.com  -s <secretKey>
```

## Conclusion
Deploying smart contracts to the æternity network is nice and easy. In just few minutes and few commands, one can deploy their desired contracts on any net. The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).
