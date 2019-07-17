# TUTORIAL: Forgae has made it simple to build Æpps with the front-end framework
## Tutorial Overview
This tutorial will teach you how to to create an aepp with Vue.js front-end framework and **forgae** integration. You will learn how to:
- Use the **forgae** shape command;
- Communicate between the frontend(SPA with Vue.js) and the Sophia smart contract;

## Prerequisites
- Installed the **forgae** framework (take a look over [installing forgae](https://dev.aepps.com/tutorials/smart-contract-deployment-in-forgae.html) section)
- Some familiarity with the **forgae** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](https://dev.aepps.com/tutorials/README.html).
- Installed **git** ([installing git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

## Plan
**Forgae** has made it simple to build Vue.js based Æpps by developing pre-configured boilerplate of a project called **forgae shape**.
This tutorial will lead you throughout process of creating such Aepp.

## Forgae shape command
```
forgae shape [ vue | react | angular ]
```
- [ react | angular ] - coming soon
- [ vue | react | angular ] - Specifies the name of the framework or library that the project will be build up. 
- vue - shapes boilerplate containing ready to use aepp with Vue.js front-end and forgae project.
First, open your terminal, create a new directory ```vue-shape``` and bootstrap new **forgae vue shape** project:
```
mkdir vue-shape
cd vue-shape
forgae shape vue
```

The verbose output provides details as what processes the command is loading during execution. The successful log looks like this:
```
===== Initializing ForgAE =====
===== Installing aepp-sdk =====
===== Installing ForgAE locally =====
===== Installing yarn locally =====
===== Creating project file & dir structure =====
===== Creating contracts directory =====
===== Creating tests directory =====
===== Creating integrations directory =====
===== Creating deploy directory =====
===== Creating docker directory =====
===== ForgAE was successfully initialized! =====
===== Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and forgae integration =====
===== Vue project successfully initialized. =====
```

## The initialized project

As a result from the aforementioned section, the structure of the initialized project should look like this:
```
.
├── aepp-forgae-shape-vue
├── contracts
├── deployment
├── docker
├── docker-compose.yml
├── integrations
├── node_modules
├── package-lock.json
├── package.json
└── test
```

This project presents ready to use aepp. The provided boilerplate code contains all modules and settings needed to facilitate its usage - Vue.js project created by vue cli, a Sophia smart contract and scripts for deployment on the Blockchain. It gives a helpful structure for further forgae project development and shows examples how to read and record a data on the Blockchain through the browser. The aepp represents a smart contract that manages a ToDo List and enables interaction with each ToDo's status. It uses a local node spawned by forgae and one of the default forgae account to sign transactions.

## Run a local node
The node command help developers run their local network on docker. The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.

```
forgae node
```
Аt the end of the tutorial, after you have tested the functionality, you can stop the network with the following command:

```
forgae node --stop
```

## Deploy the contract

Deploying the contract on the already started local network is done with only one command:

```
forgae deploy
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
===== Contract: ToDoManager.aes has been deployed =====
Your deployment script finished successfully!
```

## Deployment details

Let's get the deployment details with the following command:
```
forgae history
```
As a result, we can see a table with the most important details. For example:

```
┌───────────────┬──────────────────────────────────────────────────────┐
│ Event Time    │ 2 May, 15:05:17                                      │
├───────────────┼──────────────────────────────────────────────────────┤
│ Executor      │ Deployer                                             │
├───────────────┼──────────────────────────────────────────────────────┤
│ Name or Label │ ToDoManager                                          │
├───────────────┼──────────────────────────────────────────────────────┤
│ Tx Hash       │ undefined                                            │
├───────────────┼──────────────────────────────────────────────────────┤
│ Status        │ Success                                              │
├───────────────┼──────────────────────────────────────────────────────┤
│ Gas Price     │ 1000000000                                           │
├───────────────┼──────────────────────────────────────────────────────┤
│ Gas Used      │ 4000                                                 │
├───────────────┼──────────────────────────────────────────────────────┤
│ Result        │ ct_HVb6d4kirgqzY1rShmzRTRwukcsXobjHcpLVD2EggoHmn6wt2 │
├───────────────┼──────────────────────────────────────────────────────┤
│ Network ID    │ ae_devnet                                            │
└───────────────┴──────────────────────────────────────────────────────┘
```
Copy the address of the contract that is shown as a **Result** in the above report table.
Assign the deployed contract address to the contractAddress property in ```aepp/src/contractDetails.js``` file.

## Shape project

The shape project is a sample Wallet/Identity Aepp that expects an Aepp to be loaded into an iFrame contained into this base aepp. 
The most appropriate way to provide identity is the integration between the [base-aepp](https://base.aepps.com/) and your Æpp.
The alternative identity provider is the custom identity aepp. We will use it just for simplicity and showing the app development process.

## Run the identity/wallet provider aepp
Let's start the identity/wallet Aepp, which will start on port 8080:
```
cd aepp-forgae-shape-vue/identity-provider
npm run serve
```

## Run the aepp
Now we are ready to run the aepp, which will start on port 8081. Open new terminal window and execute the following commands:

```
cd aepp-forgae-shape-vue/aepp
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
../vue-shape/aepp-forgae-shape-vue/aepp/src/contractDetails.js
```
We should provide the deployed contract address and the source code of the contract.

#### Contract functionalities

In the same component we can see how to get all tasks by user, create task and change task status.

*Мost of the code is crammed into the ToDo.vue file, as for the purpose of this tutorial, good separation is not essential. Please do follow the VUE best practices once you start developing outside of this tutorial.*

*The source code for the aepp is on GitHub - [aepp-forgae-shape-vue](https://github.com/aeternity/aepp-forgae-shape-vue).*

## Conclusion
Our first ready to use Æpps is finalized and can be accessed by running the command ```forgae shape vue```. We provide it in order to make it easier for those who want to start their blockchain projects with Vue.js by giving them a structured project. It represents a smart contract that manages a ToDo List and shows examples of how to read and record data on the Blockchain through the browser.

You can now create a own awesome **Æpp**.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).