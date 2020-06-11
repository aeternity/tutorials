# TUTORIAL: AEproject has made it simple to build Æpps with the front-end framework
## Tutorial Overview
This tutorial will teach you how to to create an aepp with Vue.js front-end framework and **aeproject** integration. You will learn how to:
- Use the **aeproject** shape command;
- Communicate between the frontend(SPA with Vue.js) and the Sophia smart contract;

## Prerequisites
- Installed the **aeproject** framework (take a look over [AEproject docs](https://aeproject.gitbook.io/aeproject/) or [installing aeproject](smart-contract-deployment-in-aeproject.md) section)
- Some familiarity with the **aeproject** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](README.md).
- Installed **git** ([installing git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

## Plan
**AEproject** has made it simple to build Vue.js based Æpps by developing pre-configured boilerplate of a project called **aeproject shape**.
This tutorial will lead you throughout process of creating such Aepp.

## AEproject shape command
```
aeproject shape [ vue | react | angular ]
```
- [ vue | react | angular ] - Specifies the name of the framework or library that the project will be build up. 
- vue - shapes boilerplate containing ready to use aepp with Vue.js front-end and aeproject project.
First, open your terminal, create a new directory ```vue-shape``` and bootstrap new **aeproject vue shape** project:
```
mkdir vue-shape
cd vue-shape
aeproject shape vue
```

The verbose output provides details as what processes the command is loading during execution. The successful log looks like this:
```
===== Initializing AEproject =====
===== Installing aepp-sdk =====
===== Installing AEproject locally =====
===== Creating project file & dir structure =====
===== Creating contracts directory =====
===== Creating tests directory =====
===== Creating integrations directory =====
===== Creating deploy directory =====
===== Creating docker directory =====
==== Adding additional files ====
===== AEproject was successfully initialized! =====
===== Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and aeproject integration =====
===== Vue project successfully initialized. =====
```

## The initialized project

As a result from the aforementioned section, the structure of the initialized project should look like this:
```
.
├── aepp-aeproject-shape-vue
├── contracts
├── deployment
├── docker
├── integrations
├── node_modules
├── test
├── docker-compose.yml
├── package-lock.json
└── package.json
```

This project presents ready to use aepp. The provided boilerplate code contains all modules and settings needed to facilitate its usage - Vue.js project created by vue cli, a Sophia smart contract and scripts for deployment on the Blockchain. It gives a helpful structure for further aeproject project development and shows examples how to read and record a data on the Blockchain through the browser. The aepp represents a smart contract that manages a ToDo List and enables interaction with each ToDo's status. It uses a local node spawned by aeproject and one of the default aeproject account to sign transactions.

## Run a local node
The **env** command help developers run their local nodes, as well as local compiler on docker. The local network contains 1 node. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests. Together with AE node *env* command run a local compiler that response at http://localhost:3080 If you want to run only AE node which contains 3 nodes, you should type:

```
aeproject node
```

For the purpose of this tutorial we will make use of the **aeproject env** command. Аt the end of the tutorial, after you have tested the functionality, you can stop the network with the following command:

```
aeproject env --stop
```

**Note** If you use the `aeproject node` command to start your local node, you will have to stop the network with the following command:
```
aeproject node --stop
```

The successful log executing the `aeproject env` command looks like this:
```
===== Starting node and compiler =====
.Creating network "vue-shape_default" with the default driver

.Creating volume "vue-shape_node1_db" with default driver
Creating volume "vue-shape_node1_keys" with default driver
Creating vue-shape_node1_1 ... 
Creating vue-shape_compiler_1 ... 
Creating vue-shape_node1_1    ... done
Creating vue-shape_compiler_1 ... done
.....
===== Node was successfully started! =====
===== Compiler was successfully started! =====
===== Funding default wallets! =====
Miner ------------------------------------------------------------
public key: ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU
private key: bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca
Wallet's balance is 472448000000000000000
#0 - #9 diffrent wallet with public key, private key and wallet balance

===== Default wallets were successfully funded! =====
```

While the log executing the `aeproject env --stop` command looks like this:
```
===== Stopping node and compiler  =====
===== Node was successfully stopped! =====
===== Compiler was successfully stopped! =====
```

## Compile the contract
The **compile** command compiles the ```ToDoManger.aes``` Sophia contract and gives the contract bytecode as a result of compliation. This result is printed in the console. Compiling the contract on the started local network is done with only one command:

```
aeproject compile
```

The log after executing the *compile* command looks like this:
```
===== Compiling contracts =====

Contract '../vue-shape/contracts/ToDoManager.aes has been successfully compiled'
Contract bytecode: "cb_+QMrRgOg3kWfBVUqnH6LvK90i1AAY31yjV2q//DH5Rxe0H3+mQ/AuQL9uQIq/h7evYECNwJHAAc3AncXGgoAgizaAgAALwAvGAICBwwIDAOvggABAD8PAgYIPgYEBvsDTUluY29tcGxldGUgcGF0dGVybnNGOAYAACsYAgJE/CMAAgICDwIGCD4GBAb+KRTdEgI3AUcAByzYhgAAAP5E1kQfADcANwAaDoIvABoOhC8AGg6GLwABAz/+a7tTgQA3ACc3Agc3AncXGgoAglUALMoCAC8AMggCAP6cRovhADcCB3c3AAwBAFUAAgMRHt69gQ8CAAwBAigsAgAnDAQPAgRVAgwrKg6CDC2YDgAELSqCggwBAz/+p+empAA3AUcAByzYhAAAAP67ilnVADcBBzcCdxcaCgCCVQAsygIALwAvGAIABwwIDAOvggABAD8PAgYIPgYEBvsDTUluY29tcGxldGUgcGF0dGVybnNGOAYAACsYAgBE/CMAAgICDwIGCD4GBAb+vELJgAA3AXcHDAEADAN/JwwEDwIADAMCVQACAxGn56akFAICDAMCVQACAxEpFN0SFAIEVQIMLOoOggwvAC2oDgQALSqCggxVAC2KhIQCVQAtioaGBAECBP7I+wU4ADcCBxc3AAwBAFUAAgMRHt69gQ8CACgsAAAMAQInDAQPAgRVAgwrKg6CDC2YDgAELSqCggwBAz/+6NiU6AA3AQc3ABoKAIJVACzKAgAvAC4aBAIAVQAtioKCBAwDAlUAAgMRp+empBUCFFUALYqEhBQBAz+4yy8KER7evYFxLlRvRG9NYW5hZ2VyLmdldF90b2RvX2J5X2lkJxEpFN0SYS5Ub0RvTWFuYWdlci5nZXRfdG9kb19pZBFE1kQfEWluaXQRa7tTgSVnZXRfdG9kb3MRnEaL4TllZGl0X3RvZG9fbmFtZRGn56akOWdldF90b2RvX2NvdW50EbuKWdU5Z2V0X3RvZG9fYnlfaWQRvELJgCFhZGRfdG9kbxHI+wU4PWVkaXRfdG9kb19zdGF0ZRHo2JToLWRlbGV0ZV90b2Rvgi8AhTQuMi4wAFqgTmA="
```

## Deploy the contract

Deploying the contract on the already started local network is done with only one command:

```
aeproject deploy
```

The **deploy** command help developers run their deployment scripts for aeternity projects. The deploy script is scaffolded in deployment folder. We can see the ```ToDoManager.aes``` contract in contracts folder.
```
├── contracts
    └── ToDoManager.aes
├── deployment
    └── deploy.js
```

The expected output of the command execution is:
```
===== Contract: ToDoManager.aes has been deployed at ct_HVb6d4kirgqzY1rShmzRTRwukcsXobjHcpLVD2EggoHmn6wt2 =====
Your deployment script finished successfully!
```

Should in case you get an error saying ```Cannot find module 'aeproject-utils'```, execute the below command on your project directory and re-execute the *aeproject deploy* command.
```
npm install aeproject-utils prompts aeproject-logger
```

## Deployment details

Let's get the deployment details with the following command:
```
aeproject history
```
As a result, we can see a table with the most important details. For example:

```
┌───────────────┬───────────────────────────────────────────────────────┐
│ Event Time    │ 11 Jun, 16:01:12                                      │
├───────────────┼───────────────────────────────────────────────────────┤
│ Public Key    │ ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU │
├───────────────┼───────────────────────────────────────────────────────┤
│ Executor      │ Deployer                                              │
├───────────────┼───────────────────────────────────────────────────────┤
│ Name or Label │ ToDoManager                                           │
├───────────────┼───────────────────────────────────────────────────────┤
│ Tx Hash       │ th_j49k8DcKbXTv2RgSvhkgSTurPkt1uRp4bfposPoXLQWSjZzDB  │
├───────────────┼───────────────────────────────────────────────────────┤
│ Status        │ Success                                               │
├───────────────┼───────────────────────────────────────────────────────┤
│ Gas Price     │ 1000000000                                            │
├───────────────┼───────────────────────────────────────────────────────┤
│ Gas Used      │ 121                                                   │
├───────────────┼───────────────────────────────────────────────────────┤
│ Result        │ ct_HVb6d4kirgqzY1rShmzRTRwukcsXobjHcpLVD2EggoHmn6wt2  │
├───────────────┼───────────────────────────────────────────────────────┤
│ Network ID    │ ae_devnet                                             │
└───────────────┴───────────────────────────────────────────────────────┘
```
Copy the address of the contract that is shown as a **Result** in the above report table.
Assign the deployed contract address to the contractAddress property in ```aepp-aeproject-shape-vue/aepp/src/contractDetails.js``` file.

## Shape project

The shape project is a sample Wallet/Identity Aepp that expects an Aepp to be loaded into an iFrame contained into this base aepp. 
The most appropriate way to provide identity is the integration between the [base-aepp](https://base.aepps.com/) and your Æpp.
The alternative identity provider is the custom identity aepp. We will use it just for simplicity and showing the app development process.

## Run the identity/wallet provider aepp
Let's start the identity/wallet Aepp, which will start on port 8080:
```
cd aepp-aeproject-shape-vue/identity-provider
npm run serve
```

## Run the aepp
Now we are ready to run the aepp, which will start on port 8081. Open new terminal window and execute the following commands:

```
cd aepp-aeproject-shape-vue/aepp
npm run serve
```

## Shape Project appearance

![shape project](https://raw.githubusercontent.com/aeternity/aepp-forgae-shape-vue/master/shape-project.png "Shape project")


## Important considerations


### Identity provider

#### Get client
The application flow starts with getting the client. The code placed in the ```created``` lifecycle hook takes care of this.

#### Identity 
The loaded ToDo aepp waits for the ‘parent’ identity provider Aepp to provide the connected client, using the Aepp approach:
Aepp provides Ae base functionality with Contract and Aens. This stamp can be used only with Wallet, all Aepp method's going through RPC to Wallet. This Wallet would sign transactions and prompt you for a coming events like onTx, onChain, onAccount and onContract.

### ToDo aepp
Todo aepp communicate with identity-provider via 'window.postMessage()'. Every action related with create or edit state of 'ToDo Manager' on a AE blockchain goes to identity provider that would prompt you to sign a transaction.

#### Configurations
The configuration file about contract details.

```
../vue-shape/aepp-aeproject-shape-vue/aepp/src/contractDetails.js
```
We should provide the deployed contract address and the source code of the contract.

#### Contract functionalities

In the same component we can see how to get all tasks by user, create task and change task status.

*Мost of the code is crammed into the ToDo.vue file, as for the purpose of this tutorial, good separation is not essential. Please do follow the VUE best practices once you start developing outside of this tutorial.*

*The source code for the aepp is on GitHub - [aepp-aeproject-shape-vue](https://github.com/aeternity/aepp-aeproject-shape-vue).*

## Conclusion
Our first ready to use Æpps is finalized and can be accessed by running the command ```aeproject shape vue```. We provide it in order to make it easier for those who want to start their blockchain projects with Vue.js by giving them a structured project. It represents a smart contract that manages a ToDo List and shows examples of how to read and record data on the Blockchain through the browser.

You can now create a own awesome **Æpp**.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).