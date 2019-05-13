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
forgae shape [name]
```
- name - Specifies the name of the framework or library that the project will be build up. Choices: vue - shapes boilerplate containing ready to use aepp with Vue.js front-end and forgae project.
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
To stop the local node, simply run

```
forgae node --stop
```

## Deploy the contract

Deploying the contract on the already started local network is done with only one command:

```
forgae deploy
```

The **deploy** command help developers run their deployment scripts for aeternity proejcts. The deploy script is scaffolded in deployment folder. We can see the ```ToDoManager.aes``` contract in contracts folder.
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
Assign the deployed contract address to the contractAddress property in src/contractDetails.js file.

## Run the aepp
Now we are ready to run the aepp.

```
cd aepp-forgae-shape-vue
npm run serve
```
*By default the front-end app running at: Local: http://localhost:8080/*

## Important considerations

### Configurations
The configuration file about contract details.

```
../vue-shape/aepp-forgae-shape-vue/src/contractDetails.js
```
We should provide the deployed contract address and the source code of the contract.

The general configuration file.
```
../vue-shape/aepp-forgae-shape-vue/src/setting.js
```
In this file, we have to fill in the account private/public key pair and the network details.

### Get client
The application flow starts with getting the client and contract instances. The code placed in the ```created``` lifecycle hook takes care of this as it is based on data from the configuration files.

```javascript=
async getClient() {
    try {
        const networkId = settings.networkId;

        const clientNative = await Ae.compose({
            props: {
                url: settings.url,
                internalUrl: settings.internalUrl,
                compilerUrl: compilerUrl
            }
        })({ nativeMode: true, networkId })

        const account = { secretKey: settings.account.priv, publicKey: settings.account.pub }

        await clientNative.setKeypair(account)

        this.client = clientNative

        this.$store.dispatch('setAccount', this.client);
        this.accountBalance();
        this.contractInstance = await this.client.getContractInstance(contractDetails.contractSource, { contractAddress: contractDetails.contractAddress });
    } catch (err) {
        console.log(err);
    }
}
```

### Calling a contract function

In order to interact with the contract functions, we will use two functions:

- callContract - calling a contract function that changes the state of the contract (has ```stateful``` modifier);
- callStatic - calling a contract function that just read from the contract, without changing the state;

```javascript=
async onCallStatic(func, args, returnType) {
    if (func && args && returnType) {
        try {
            const res = await this.contractInstance.call(func, args)
            return res.decode(returnType);
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log('Please enter a Function and 1 or more Arguments.');
    }
    },
async onCallDataAndFunctionAsync(funcName, funcArgs, returnType) {

    if (funcName && funcArgs && returnType) {
        try {
            const res = await this.contractInstance.call(funcName, funcArgs);

            if (returnType !== '()') {
                const data = await res.decode(returnType);
                console.log(data);
                return data
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log('Please enter a Function and 1 or more Arguments.');
    }
}
```

### Contract functionalities

In the same component we can see how to get all tasks by user, create task and change task status.

*Мost of the code is crammed into the ToDo.vue file, as for the purpose of this tutorial, good separation is not essential. Please do follow the VUE best practices once you start developing outside of this tutorial.*

*The source code for the aepp is on GitHub - [aepp-forgae-shape-vue](https://github.com/aeternity/aepp-forgae-shape-vue).*

## Conclusion
Our first ready to use Æpps is finalized and can be accessed by running the command ```forgae shape vue```. We provide it in order to make it easier for those who want to start their blockchain projects with Vue.js by giving them a structured project. It represents a smart contract that manages a ToDo List and shows examples of how to read and record data on the Blockchain through the browser.

You can now create a own awesome **Æpp**.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).