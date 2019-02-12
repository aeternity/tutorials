# TUTORIAL: How to build a To-do list Æpp - Part 2
## Tutorial Overview
This tutorial will teach you how to develop the communication process between the client side and the *ToDoManager* smart contract. We will setup the basic infrastructure in order to interact with the smart contract from the frontend.

## Prerequisites
- Before we go any further, please make sure you have followed the [first part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-1.md) of *How to build a To-do list Æpp*.
- Installed **yarn** package manager ([installation](https://yarnpkg.com/lang/en/docs/install))

## Plan
I have published the simple frontend project in Github. We will start with cloning the github repository and I will explain the most important segments of the *To-do list Æpp*.

## To-do list Æpp content
The tutorial is created to showcase the aeternity SDK implementation for both Base/Wallet Aepp and simple To-do list Æpp "depending" on a base (Wallet/Identity) Aepp.
The To-do list Æpp consists of two parts:
- Wallet/Identity Base Aepp;
- To-do list Æpp dependent on a wallet/identity aepp;

## Getting started 
Clone the Github repository and install the required dependencies with the following sequence of commands:
```
git clone https://github.com/VladislavIvanov/to-do-list-aepp.git
cd to-do-list-aepp/identity
yarn install
```

The Base/Wallet Aepp is started via:
```
yarn run start:dev
```

The Aepp runs at http://localhost:9000.

Repeat the above steps for the ```aepp-origin```.
```
cd to-do-list-aepp/aepp-origin
yarn install
```

The To-do list Æpp is started via:
```
yarn run start:dev
```

It runs at http://localhost:9001.

## Wallet/Identity Base Aepp
The Wallet/Identity Aepp that expects our Aepp to be loaded into an iFrame contained into this base aepp.
The essential part of the app is instantiation of the wallet. The implementation is shown here:
```
~/to-do-list-aepp/identity/src/components/Home.vue
```
```
      Wallet({
        url: settingData.host,
        internalUrl: settingData.host,
        accounts: [MemoryAccount({ keypair: { secretKey: this.priv, publicKey: this.pub } })],
        address: this.pub,
        onTx: this.confirmDialog,
        onChain: this.confirmDialog,
        onAccount: this.confirmDialog,
        onContract: this.confirmDialog,
        networkId: settingData.networkId
      }).then(ae => {
        this.client = ae;
        console.log('status', this.client.api.getTopBlock())
        console.log('version', this.client.api.getStatus())
        this.$refs.aepp.src = this.aeppUrl

        ae.height().then(height => {
          console.log('height', height)
          this.height = height
        })

        ae.balance(this.pub).then(balance => {
          console.log('balance', balance)
          this.balance = balance
        }).catch(e => {
          this.balance = 0
        })
      })
```
We have attached the confirmation dialog to the following events: 
```
        onTx: this.confirmDialog,
        onChain: this.confirmDialog,
        onAccount: this.confirmDialog,
        onContract: this.confirmDialog,
```
When embedded Aepp triggers some of the above events, the Wallet/Identity Aepp should to approve the executed action.

The configuration settings are placed in ```~/to-do-list-aepp/identity/src/settings.js```. For example:
```
export default {
  pub: 'ak_2EdPu7gJTMZSdFntHK5864CnsRykW1GUwLGC2KeC8tjNnFBjBx',
  priv: '195675e7ef31c689f92eb86fc67e31124b3b124889906607f63ee9d323834039a2a39512ab47c05b764883c04466533e0661007061a4787dc34e95de96b7b8e7',
  aeppUrl: '//0.0.0.0:9001',
  host: 'https://sdk-testnet.aepps.com',
  networkId: 'ae_uat'
}

```

The ```settings.js``` file contains the information for:
- the public key;
- the private key;
- the link to the embedded Aepp;
- the network we want to connect to;
- the networkId of the selected network;

We want to test our *To-do list Æpp* on the testnet. The host property should be ```https://sdk-testnet.aepps.com``` and the networkId is ```ae_uat```.
As you can see the ```aeppUrl``` property points to the To-do list Æpp url - ```//0.0.0.0:9001```.
This property is used for the embedding of the To-do list Æpp inside Base/Wallet Aepp:
```
<iframe v-show="aeppUrl" ref="aepp" class="w-full h-screen border border-black border-dashed bg-grey-light mx-auto mt-4 shadow" src="about:blank" frameborder="1"></iframe>
```

## To-do list Æpp
Here is the structure of the *src* directory for the ```aepp-origin``` project:
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

### Configuration file
The ```settings.js``` file contains the information for the deployed contract address. For instance:

```
export default {
  deployedContractAddress: 'ct_2XA3aXMZvH46CG5Ld387Z7Ac1QfTRQKpKNcgVaYVYDm3EKowNP',
}

```

In the [previous tutorial](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-1.md) we have deployed the ```ToDoManager.aes``` contract to the testnet, we will use the deployed contract address as  a ```deployedContractAddress``` property.

## Authenticate
The application flow starts with the authentication step. The code placed in the ```created``` lifecycle hook waits for the 'parent' identity provider Aepp to provide the connected client. 

```
    created() {
      Aepp().then(ae => {
        this.client = ae
        console.log(this.client);
        ae.address()
          .then(address => {
            this.account.pub = address
            console.log(address);
            this.getContractTasks()
          })
          .catch(e => {
            this.account.pub = `Rejected: ${e}`
          })
      })
    }
```

## Calling a contract function
In order to interact with the contract functions, we will use two functions:
- ```callContract``` - calling a contract function that changes the state of the contract (has ```stateful``` modifier);
- ```callStatic``` - calling a contract function that just read from the contract, without changing the state;

```
callContract(func, args, options) {
    console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, options)
    return this.client.contractCall(this.contractAddress, 'sophia-address', this.contractAddress, func, { args, options })
}
```
```
callStatic(func, args) {
    console.log(`calling static func ${func} with args ${args}`)
    return this.client.contractCallStatic(this.contractAddress, 'sophia-address', func, { args })
}
``` 

The connected client allows us to call ```contractCall``` and ```contractCallStatic```. Calling a stateful function requires passing a deployed contract address, ```sophia-address``` constant, deployed contract address again, function name and function arguments. Invoking a static function requires a contract address, ```sophia-address``` constant, function name and arguments.

```onCallDataAndFunctionAsync``` and ```onCallStatic``` functions wrap the above functions, process their responses and visualize the useful information about their execution in the browser.

## Get all tasks
The first step after successful authentication is to take all the tasks in the contract, if any. Тhis is achieved by calling three static functions. The first one will give us the total number of tasks created in the contract state - ```get_task_count```. We will iterate them with a for loop and for every task will call - ```get_task_by_index``` which returns the task name and ```task_is_completed``` which checks the task status. Finally we will store the results in the ```todos``` array and visualize it in the frontend template.

```
  async getContractTasks() {
    const taskCount = await this.onCallStatic('get_task_count', '()', 'int')
    let taskName
    let taskCompleted

    for (let i = 0; i < taskCount; i++) {
      taskName = await this.onCallStatic('get_task_by_index', `(${i})`, 'string')
      taskCompleted = await this.onCallStatic('task_is_completed', `(${i})`, 'bool')
      console.log(taskCompleted)
      const task = {
        title: taskName,
        done: !!taskCompleted
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