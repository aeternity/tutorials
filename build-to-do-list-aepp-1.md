# TUTORIAL: How to build a To-do list Æpp - Part 1
## Tutorial Overview
This tutorial series will teach you how to build a To-do list Æpp. You will learn how to:
- Develop a ToDoManager Sophia smart contract and write unit tests for it;
- Use the **aeproject** framework to build æpps: configuration of the project structure, compilation, deployment, running tests;
- Communicate between the frontend(SPA with Vue.js) and the Sophia smart contract;

The To-do list Æpp will be able to:
- create new tasks;
- list existing tasks;
- edit task name;
- change task status;
- delete task;

Once finished it will look like this:

![To-do list Æpp](https://raw.githubusercontent.com/aeternity/aepp-aeproject-shape-vue/master/shape-project.png)

## Prerequisites
- Installed  **aeproject** framework (take a look over [installing aeproject](smart-contract-deployment-in-aeproject.md) section)
- Some familiarity with the **aeproject** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](README.md).
- Installed **git** ([installing git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
- Account with testnet funds ([How to Get Testnet Funds](get-testnet-tokens.md) - referencing tutorial)

## Plan

This part of the tutorial series will show you how to develop a *ToDoManager* Sophia smart contract and write unit tests for it, using the **aeproject** framework.
The [second part](build-to-do-list-aepp-2.md) will focus on the communication between the frontend and the *ToDoManager* smart contract.

## Initialize the smart contract project

First, open your terminal, create a new directory ```to-do-contract``` and bootstrap new **aeproject** project:
```
mkdir to-do-contract
cd to-do-contract
aeproject init
```

## Creating the ```ToDoManager.aes``` smart contract

```
touch ./contracts/ToDoManager.aes
```

Now we need to start coding our smart contract.

The entire code of our simple ```ToDoManager.aes``` is:
```
contract ToDoManager =

  record todo = {
    name: string,
    is_completed: bool}

  record state = {
    map_user_todos: map(address, map(int, todo)),
    map_user_todo_count: map(address, int),
    map_user_todo_id: map(address, int)}


  stateful entrypoint init() =
    { map_user_todos = {},
      map_user_todo_count = {},
      map_user_todo_id = {}}

  entrypoint get_todo_count(user: address) : int =
    Map.lookup_default(user, state.map_user_todo_count, 0)

  private function get_todo_id(user: address) : int =
    Map.lookup_default(user, state.map_user_todo_id, 0)

  stateful entrypoint add_todo(todo_name: string) : int =
    let new_todo : todo = {
      name = todo_name,
      is_completed = false}

    let count = get_todo_count(Call.caller) + 1
    let id = get_todo_id(Call.caller) + 1

    put(state{map_user_todos[Call.caller = {}][id] = new_todo})
    put(state{map_user_todo_count[Call.caller] = count})
    put(state{map_user_todo_id[Call.caller] = id})

    id

  stateful entrypoint edit_todo_state(todo_id: int, is_completed: bool) =

    let current_todo : todo = get_todo_by_id'(Call.caller, todo_id)
    let edited_todo : todo = {
      name = current_todo.name,
      is_completed = is_completed}

    put(state{map_user_todos[Call.caller][todo_id] = edited_todo})

  stateful entrypoint edit_todo_name(todo_id: int, todo_name: string) =

    let current_todo : todo = get_todo_by_id'(Call.caller, todo_id)
    let edited_todo : todo = {
      name = todo_name,
      is_completed = current_todo.is_completed}

    put(state{map_user_todos[Call.caller][todo_id] = edited_todo})

  stateful entrypoint delete_todo(todo_id: int) =
    let todos: map(int,todo) = Map.lookup_default(Call.caller, state.map_user_todos, {})
    let updated_todos = Map.delete(todo_id, todos)

    put(state{map_user_todos[Call.caller] = updated_todos})

    let count = get_todo_count(Call.caller) - 1
    put(state{map_user_todo_count[Call.caller] = count})

  entrypoint get_todo_by_id(id: int) : todo =
    let todos: map(int,todo) = Map.lookup_default(Call.caller, state.map_user_todos, {})
    let result = switch(Map.lookup(id, todos))
      // None => {}
      Some(x) => x

    result

  entrypoint get_todos() =

    let user_todos = Map.lookup_default(Call.caller, state.map_user_todos, {})
    let todos = Map.to_list(user_todos)
    todos

  private function convert_bool_to_string(expression: bool) : string =
    switch(expression)
      true => "true"
      false => "false"

  private function get_todo_by_id'(user: address, id: int) : todo =
    let todos: map(int,todo) = Map.lookup_default(user, state.map_user_todos, {})

    let result = switch(Map.lookup(id, todos))
      // None => {}
      Some(x) => x

    result
```

As you can see, the contract stores users tasks by their index, a map that stores users total number of tasks, and an additional map which helps us get a user todo id.

A user can create task using the ```add_todo``` function and change a task status with ```edit_todo_state```. In addition, a user can check the total number of tasks with ```get_todo_count```, edit a task name with ```edit_todo_name```, delete a task with ```delete_todo```, and get a task by its index via ```get_todo_by_id``` function.

## Writing unit tests for the smart contract

Although we have finished the code of the smart contract, we are not done yet. We still need to deploy the smart contract and verify that it’s working.

Let's go to the ```test``` folder of the project and create a new test file.
```
touch ./toDoManagerTests.js
```

In our tests we will deploy the contract to the local network spawned by **aeproject** and interact with the deployed contract.
We will test the contract functionalities as follows:
- Create a task;
	- Should create a task successfully
- Get tasks;
	- Should get tasks count successfully
	- Should get all tasks successfully
- Complete a  tasks;
	- Should add a task and return false if the task is not completed successfully
	- Should add a task and return true if the task is completed successfully
- Edit a task;
	- Should get a task name by task id successfully
	- Should change a task name by task id successfully
- Delete a task;
	- Should delete a task successfully

The final version of the test script file - ```toDoManagerTests.js``` is:
```javascript=
const Deployer = require('aeproject-lib').Deployer;
const TODOMANAGER_CONTRACT_PATH = "./contracts/ToDoManager.aes";

describe('ToDoManager Contract', () => {
  
  let deployer;
  let ownerKeyPair = wallets[0];
  
  before(async () => {
    deployer = new Deployer('local', ownerKeyPair.secretKey)
  })

  it('Deploying ToDoManager Contract', async () => {
    const deployedPromise = deployer.deploy(TODOMANAGER_CONTRACT_PATH) // Deploy it

    await assert.isFulfilled(deployedPromise, 'Could not deploy the ToDoManager Smart Contract'); // Check whether it's deployed
  })


	describe('Interact with contract', () => {
		describe('Contract functionality', () => {
      let instance;

      beforeEach(async () => {
        const deployedContract = deployer.deploy(TODOMANAGER_CONTRACT_PATH);
        instance = await Promise.resolve(deployedContract)
      });

			describe('Create a task', () => {
        it('Should create a task successfully', async () => {
          //Arrange
          let taskName = 'Task A';

          //Act
          let addTask = await instance.add_todo(taskName);

          //Assert
          assert.isOk(addTask)
        })
      });
      
      describe('Get tasks', () => {
				it('Should get tasks count successfully', async () => {
          //Arrange
					let taskName = 'Task A';
					let secondTaskName = 'Task B';
          let expectedTasksCount = 2;
          
          //Act
          await instance.add_todo(taskName);
          await instance.add_todo(secondTaskName);
          let taskCount = (await instance.get_todo_count(ownerKeyPair.publicKey)).decodedResult

          //Assert
					assert.equal(taskCount, expectedTasksCount)
        });
        it('Should get all tasks successfully', async () => {
          //Arrange
					let taskName = 'Task A';
					let secondTaskName = 'Task B';
          
          //Act
          await instance.add_todo(taskName);
          await instance.add_todo(secondTaskName);
          let allTask = await instance.get_todos(ownerKeyPair.publicKey)

          //Assert
					assert.isOk(allTask)
				});
      });
      
      describe('Complete a tasks', () => {
				it('Should add a task and return false if the task is not completed successfully', async () => {
          //Arrange
					let taskName = 'Task A';

          //Act
          let addTask = (await instance.add_todo(taskName)).decodedResult;
          let getTask = (await instance.get_todo_by_id(addTask)).decodedResult.is_completed;

          //Assert
					assert.isOk(!getTask)
				});
        it('Should add a task and return true if the task is completed successfully', async () => {
          //Arrange
					let taskName = 'Task A';

          //Act
          let addTask = (await instance.add_todo(taskName)).decodedResult;
          await instance.edit_todo_state(addTask, true)
          let getTask = (await instance.get_todo_by_id(addTask)).decodedResult.is_completed;

          //Assert
					assert.isOk(getTask)
				});
      });

      describe('Edit a task', () => {
				it('Should get a task name by task id successfully', async () => {
          //Arrange
					let taskName = 'Task A';

          //Act
          let addTask = (await instance.add_todo(taskName)).decodedResult;
          let getTask = (await instance.get_todo_by_id(addTask)).decodedResult.name;

          //Assert
					assert.equal(getTask, taskName)
				});
        it('Should change a task name by task id successfully', async () => {
          //Arrange
          let taskName = 'Task A';
          let newTaskName = 'Task B';

          //Act
          let addTask = (await instance.add_todo(taskName)).decodedResult;
          await instance.edit_todo_name(addTask, newTaskName)
          let getTask = (await instance.get_todo_by_id(addTask)).decodedResult.name;

          //Assert
					assert.equal(getTask, newTaskName)
				});
      });
      
      describe('Delete a task', () => {
				it('Should delete a task successfully', async () => {
          //Arrange
					let taskName = 'Task A';
          
          //Act
          let addTask = (await instance.add_todo(taskName)).decodedResult;
          let deleteTask = await instance.delete_todo(addTask)

          //Assert
					assert.isOk(deleteTask)
				});
      });
		})
	});
});
```

## Compiling the contract

Next step is to run our local network and compiler on docker with the following command:
```
aeproject env
```

## Compiling the contract

Now let's compile the contract with the following command:
```
aeproject compile
```

## Testing the contract

Let's run the tests with the ```aeproject test``` command and wait for the result. It should look like this:
```
===== Starting Tests =====


  ToDoManager Contract
    ✓ Deploying ToDoManager Contract (7018ms)
    Interact with contract
      Contract functionality
        Create a task
          ✓ Should create a task successfully (5333ms)
        Get tasks
          ✓ Should get tasks count successfully (10935ms)
          ✓ Should get all tasks successfully (10914ms)
        Complete a tasks
          ✓ Should add a task and return false if the task is not completed successfully (5610ms)
          ✓ Should add a task and return true if the task is completed successfully (10910ms)
        Edit a task
          ✓ Should get a task name by task id successfully (5598ms)
          ✓ Should changing a task name by task id successfully (10896ms)
        Delete a task
          ✓ Should delete a task successfully (10640ms)


  9 passing (2m)
```

If you get an error saying ```Cannot find module 'aeproject-utils'```, execute the below command on your project directory and re-execute the *aeproject test* command.
```
npm install aeproject-utils prompts aeproject-logger
```

## Deploying the contract to testnet
The testnet is a wonderful place where you can experiment with the To-do list Æpp without worrying that a mistake will cost you real tokens.

We will use **aeproject** to deploy our contract to the testnet. The sample deployment script is scaffolded in deployment folder - ```deploy.js```.
Let’s configure our deployment script. We have to change the contract path from ```./contracts/ExampleContract.aes``` to ```./contracts/ToDoManager.aes```. The ```deploy.js``` file should look like this:
```
const Deployer = require('aeproject-lib').Deployer;

const deploy = async (network, privateKey, compiler, networkId) => {
	let deployer = new Deployer(network, privateKey, compiler, networkId)

	await deployer.deploy("./contracts/ToDoManager.aes")
};

module.exports = {
  deploy
};
```

The deploy command is:
```
aeproject deploy -n testnet

```

The expected result should be similar to this:
```
===== Contract: ToDoManager.aes has been deployed at ct_28HXSRkYyQDr4nRzYuUTDyRxy9NGJRYuTpi5LUiyvb7oG9tJaj =====
Your deployment script finished successfully!
```

Please save the deployed contract address. In my case - ```ct_28HXSRkYyQDr4nRzYuUTDyRxy9NGJRYuTpi5LUiyvb7oG9tJaj```. We will use it in the [second part](build-to-do-list-aepp-2.md) of the tutorial series.

## Conclusion
Let’s briefly recap what we did during this tutorial. We created a basic ```ToDoManager.aes``` contract that can:
- create a new task;
- read a specific task;
- edit a specific task;
- delete a specific task;
- get all tasks;
- get total tasks count;
- get task by index;

We still don’t have a frontend for our To-do list Æpp and this is our *ToDo (pun intended)* for the [second part](build-to-do-list-aepp-2.md) of the tutorial series. If you encounter any problems please check out the [video tutorial](https://www.youtube.com/watch?v=9fMpejyECC0&list=PLVz98HTQCJzRmy8naIh49mAW306kGyGXA) on YouTube.