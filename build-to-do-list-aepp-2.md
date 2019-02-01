# TUTORIAL: How to build a To-do list Æpp - Part 2
## Tutorial Overview
This tutorial will teach you how to develop the communication process between the client side and the *ToDoManager* smart contract. We will setup the basic infrastructure in order to interact with the smart contract from the frontend.

## Prerequisites
- Before we go any further, please make sure you have followed the [first part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-1.md) of *How to build a To-do list Æpp*.
- Installed **yarn** package manager ([installation](https://yarnpkg.com/lang/en/docs/install))

## Plan
I have published the simple frontend project in Github. We will start with cloning the github repository and I will explain the most important segments of the *To-do list Æpp*.

## Getting started 
Clone the Github repository and install the required dependencies with the following sequence of commands:
```
git clone https://github.com/VladislavIvanov/to-do-list-aepp.git
cd to-do-list-aepp
yarn install
```

The application is started via:
```
yarn run start:dev
```

The project runs at http://localhost:8080.

## Project structure
Here is the structure of the *src* directory for the frontend project:
```
.
├── App.vue
├── components
│   └── Home.vue
├── index.js
├── main.css
├── router.js
├── settings.js
└── store.js
```

In this tutorial we will focus on the **Home.vue** and **settings.js** files. These two files contain the essence of our project. Тhe other files are specific to the configuration of the frontend framework you have chosen - in our case - *Vue.js*. 

This tutorial will not deal with creation of the ui components and styling them

*Мost of the code is crammed into the ```Home.vue``` file. That is so, as for the purpose of this tutorial, good separation is not essential. Please do follow the VUE best practices once you start developing outside of this tutorial.*

## Configuration file
The ```settings.js``` file contains the information for:
- the network we want to connect to - the ```host``` property;
- the deployed contract address;
- the bytecode of the contract;

The structure of the file looks like this

```
export default {
  host: 'https://sdk-testnet.aepps.com',
  deployedContractAddress: CONTRACT_ADDRESS,
  deployedContractByteCode: CONTRACT_BYTE_CODE
}
```

We want to test our *To-do list Æpp* on the testnet. The host property should be ```https://sdk-testnet.aepps.com```. In the [previous tutorial](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-1.md) we have deployed the ```ToDoManager.aes``` contract to the testnet, we will use the deployed contract address as  a ```deployedContractAddress``` property. We have compiled the contract for the testnet usage, so we will use the bytecode as a ```deployedContractByteCode``` property. Our configuration file is ready.

## Authenticate
The application flow starts with the authentication step. The user has to provide his/her private key to be authenticated.
The functions responsible for the follow-up are ```connectWithPrivateKey``` and ```getClient```.
The first function generates a key pair from the private key through the ```Crypto``` module of the ```aeternity/aepp-sdk``` and assigns the public and the private key to the ```account``` variable.
The ```getClient``` function is responsible for connecting the account with the selected network. This action is done via ```Wallet``` module from the ```aeternity/aepp-sdk```. 
```
Wallet.compose(Contract)({
  url: this.host,
  internalUrl: this.host,
  accounts: [MemoryAccount({keypair: {secretKey: this.account.priv, publicKey: this.account.pub}})],
  address: this.account.pub,
  onTx: true,
  onChain: true,
  onAccount: true,
  networkId: 'ae_uat'
})
```
The compose function returns the connected client. After that we get the balance of the account public key.

## Calling a contract function
In order to interact with the contract functions, we will use two functions:
- ```callContract``` - calling a contract function that changes the state of the contract (has ```stateful``` modifier);
- ```callStatic``` - calling a contract function that just read from the contract, without changing the state;

```
callContract (func, args, options) {
    console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, options)
    return this.client.contractCall(this.byteCode, 'sophia', this.contractAddress, func, {args, options})
}
```
```
callStatic (func, args) {
    console.log(`calling static func ${func} with args ${args}`)
    return this.client.contractCallStatic(this.contractAddress, 'sophia-address', func, { args })
}
``` 

The connected client allows us to call ```contractCall``` and ```contractCallStatic```. Calling a stateful function requires passing a contract bytecode, ```sophia``` constant, deployed contract address, function name and function arguments. Invoking a static function requires a contract address, ```sophia-address``` constant, function name and arguments.

```onCallDataAndFunctionAsync``` and ```onCallStatic``` functions wrap the above functions, process their responses and visualize the useful information about their execution in the browser.

## Get all tasks
The first step after successful authentication is to take all the tasks in the contract, if any. Тhis is achieved by calling three static functions. The first one will give us the total number of tasks created in the contract state - ```get_task_count```. We will iterate them with a for loop and for every task will call - ```get_task_by_index``` which returns the task name and ```task_is_completed``` which checks the task status. Finally we will store the results in the ```todos``` array and visualize it in the frontend template.

```
async getContractTasks () {
    const data = await this.onCallStatic('get_task_count', '()', 'int')
    console.log(data.value)
    let taskName
    let taskCompleted

    for (let i = 0; i < data.value; i++) {
      taskName = await this.onCallStatic('get_task_by_index', `(${i})`, 'string')
      taskCompleted = await this.onCallStatic('task_is_completed', `(${i})`, 'bool')
      console.log(taskCompleted.value)
      const task = {
        title: taskName.value,
        done: !!taskCompleted.value
      }
      this.todos.push(task)
      console.log(this.todos)
    }
  }
```

## Create a task 
Creating a task is done by calling the ```add_to_do``` function of our ```ToDoManager``` contract. Here we will use the call to a stateful function:
```
  async createTask () {
    if (this.createTaskInput) {
      const taskName = await this.onCallDataAndFunctionAsync('add_to_do', `("${this.createTaskInput}")`, 'string')
      const task = {
        title: taskName.value,
        done: false
      }
      this.todos.push(task)
    }
  }
```

## Mark a task as completed
Completing a task is done by calling the ```complete_task``` function. We will use the above approach:
```
  async completeTask (taskIndex) {
    const completed = await this.onCallDataAndFunctionAsync('complete_task', `(${taskIndex})`, 'bool')
    console.log(completed.value)
    this.todos[taskIndex].done = true
  }
```

## Conclusion
Let’s briefly recap what we did during this tutorial series. 
In the [first part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-1.md) we created a basic ```ToDoManager.aes``` contract that can:
- represent a task;
- create new task;
- read a specific task;
- check a task status;
- get total tasks count;
- get task by index;

We wrote basic unit tests for the contract. Compile it with ```testnet``` network selected and deploy the contract to the ```testnet```. The deployed contract address and contract bytecode will be used in the next tutorial.
The [second part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-2.md) shows us how to communicate with the previously deployed contract.
The included features are:
- connecting the account with testnet;
- getting the account's balance;
- getting all the task and visualize them in the browser;
- creating a task by typing name in a input field and click a button;
- completing a task by a button click;

You can now create a own awesome **Æpp**.

The æternity team will keep this tutorial updated. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).