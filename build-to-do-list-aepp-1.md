# TUTORIAL: How to build a To-do list Æpp - Part 1
## Tutorial Overview
This tutorial series will teach you how to build a To-do list Æpp. You will learn how to:
- Develop a ToDoManager Sophia smart contract and write unit tests for it;
- Use the **forgae** framework to build æpps: configuration of the project structure, compilation, deployment, running tests;
- Communicate between the frontend(SPA with Vue.js) and the Sophia smart contract;

The To-do list Æpp will be able to:
- create new tasks;
- list existing tasks;
- complete tasks;
- check tasks status;

Once finished it will look like this:

![To-do list Æpp](https://raw.githubusercontent.com/VladislavIvanov/to-do-list-aepp/master/to-do-list-aepp.png)

## Prerequisites
- Installed the **forgae** framework (take a look over [installing forgae](https://dev.aepps.com/tutorials/smart-contract-deployment-in-forgae.html) section)
- Some familiarity with the **forgae** framework and development of Sophia smart contracts. If you are not there yet, we recommend checking some of these [development tutorials](https://dev.aepps.com/tutorials/README.html).
- Installed **git** ([installing git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
- Account with testnet funds ([How to Get Testnet Funds](https://dev.aepps.com/tutorials/get-testnet-tokens.html) - referencing tutorial)

## Plan

This part of the tutorial series will show you how to develop a *ToDoManager* Sophia smart contract and write unit tests for it, using the **forgae** framework.
The [second part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-2.md) will focus on the communication between the frontend and the *ToDoManager* smart contract.   
## Initialize the smart contract project

First, open your terminal, create a new directory ```to-do-contract``` and bootstrap new **forgae** project:
```
mkdir to-do-contract
cd to-do-contract
forgae init
```

## Creating the ```ToDoManager.aes``` smart contract

```
touch ./contracts/ToDoManager.aes
```

Now we need to start coding our smart contract.

The entire code of our simple ```ToDoManager.aes``` is:
```
contract ToDoManager =
  record state = {
    index_counter : int,
    m_index_to_do : map(int, string),
    m_to_do_done : map(int, bool)}

  public stateful function init() =
    { index_counter = 0,
      m_index_to_do = {},
      m_to_do_done = {}}

  public function get_task_count() : int =
    state.index_counter

  public stateful function add_to_do(_to_do : string) : string =
    put(state{m_index_to_do[state.index_counter] = _to_do})
    put(state{m_to_do_done[state.index_counter] = false})
    put(state{index_counter = state.index_counter + 1})
    _to_do

  public stateful function complete_task(_index : int) : bool =
    put(state{m_to_do_done[_index] = true})
    true

  public function get_task_by_index(_index: int) : string =
    switch(Map.lookup(_index, state.m_index_to_do))
      None  => ""
      Some(x) => x

  public function task_is_completed(_index : int) : bool =
    switch(Map.lookup(_index, state.m_to_do_done))
      None  => false
      Some(x) => x

```

As you can see, the contract stores the total number of tasks, a map that stores tasks by their index and an additional map which helps us to monitor the tasks statuses.

We can create task using the ```add_to_do``` function and complete a task with ```complete_task```. In addition, we can check the total number of tasks with ```get_task_count```, check the status of the particular task with ```task_is_completed``` and get the name of a task by its index via ```get_task_by_index``` function.

### Compiling the contract

Please compile the contract with ```testnet``` network selected:
```
forgae compile -n testnet
```

The contract bytecode will be used in the [second part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-2.md) of the tutorial series. Please save it.
```
Contract: '~/ToDoManager.aes has been successfully compiled'
Contract bytecode: cb_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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoP//////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD5AS+gzCMc7daFfOIBnzwtkVVGQYINX6CnB9GXpGeGBrsUdgqJYWRkX3RvX2RvuMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoP//////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH41KDufCtN3JmsnAqL8lW3AowT/82nqefIri0pE1G3i07L2Y5nZXRfdGFza19jb3VudLhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////////////////////uEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuQWBYgABEGIAAZ+RgICAUX/MIxzt1oV84gGfPC2RVUZBgg1foKcH0ZekZ4YGuxR2ChRiAAJfV1CAgFF/rtfzVcI/1UNA3r630Y+BXWLz5MgSxoWJx8hlLVYBap0UYgADf1dQgIBRf3mA4zVJRXSJm2276hSVsxhhXIas22b9nTZDinY13zumFGIAAdlXUICAUX/ufCtN3JmsnAqL8lW3AowT/82nqefIri0pE1G3i07L2RRiAAQ8V1CAgFF/qxrmXmV4nii7ophGg8HzxhYzjugOD9JoHqp+aaMFkQsUYgAESFdQgFF/hKXZkKOG2bBjRUNStymnlcMl/vjSPzLuRk+YEBfIhAMUYgACHVdQYAEZUQBbYAAZWWAgAZCBUmAgkANgAFmQgVJZYEABkIFSYCCQA2AAWZCBUoFSYCCQA2AGgVKBUllgIAGQgVJgIJADYAFZkIFSWWBAAZCBUmAgkANgAFmQgVKBUmAgkANgBoFSgVJZYCABkIFSYCCQA2AAWZCBUoFSWWAgAZCBUmAgkANgA4FSkFlgAFFZUmAAUmAA81tgAIBSYADzW2AAYABgAINZYGABkIFSYCCQA4WBUmAgkAOGgVJgIJADYQEugVJgAGAAWvGSUFBQkFZbYCABUVGQUFlQgJFQUIBgAFFgIAFRYgAEB5FgAGAAYACDWWBAAZCBUmAgkAOFgVJgIJADYQEtgVJgAGAAWvGRUFCQVltgIAFRUVlQgJFQUIBgAFFgQAFRYgAFUJFgAGAAYACDWWBAAZCBUmAgkAOFgVJgIJADYQEtgVJgAGAAWvGRUFCQVltgIAFRUZBQWVCAkVBQYABRgGBAAVFZYEABkIFSYCCQA4FgIAFRYgAC0ZCEWWBAAZCBUmAgkANZYgACrIFSgVJgIJADYgACs4FSgFFWW1BiAAGnVluAUGAgAYBRkGAgAVGCYABRUYKEkpVQklCSUIBRVluBUmAgkAOBUYFSkFBgAFJZUGAAUYBgQAFRYgADKpBZYgADC4FSWWAgAZCBUmAgkANiAAMSgVKAUVZbUGIAAadWW4BQYCABUYFgAFFRYACDkZNQkZNQgFFWW1lgQAGQgVJgIJADgWAgAVGBUmAgkAOBUYFSkFBgAFJZUGAAUYBgQAFRWWBAAZCBUmAgkAOBYCABUYFSYCCQA2ABYABRUQGBUpBQYABSWVCAkFCQVltgIAFRUZBQWVCAkVBQYABRgGBAAVFiAAPfkINZYEABkIFSYCCQA1liAAO8gVKBUmAgkANiAAPDgVKAUVZbUGIAAadWW4BQYCABgFGQYCABUYKBYAGEkpVQklCSUIBRVltZYEABkIFSYCCQA4FgIAFRgVJgIJADgVGBUpBQYABSWVBgAZBQkFZbgFFgABRiAAQiV4BRYAEUYgAEL1dQYAEZUQBbUGAAWZCBUluQUJBWW2AgAVGAkFBiAAQqVltQUFlQUGAAUVGQVltQUIKRUFBgAGAAYABgAFmQgVJZYEABkIFSYCCQA2AAWZCBUoFSYCCQA2EBLIFSYABgAFrxWWBAAZCBUmAgkANgAGAAYABgAVmQgVJZYEABkIFSYCCQA2AAWZCBUoFSYCCQA2EBLIFSYABgAFrxgVJgIJADYACBUllgIAGQgVJgIJADYAAZWWAgAZCBUmAgkANgAFmQgVJZYEABkIFSYCCQA2AAWZCBUoFSYCCQA2AGgVKBUllgIAGQgVJgIJADYAFZkIFSWWBAAZCBUmAgkANgAFmQgVKBUmAgkANgBoFSgVJZYCABkIFSYCCQA2AAWZCBUoFSWWAgAZCBUmAgkANgA4FSgVKQVluAUWAAFGIABWtXgFFgARRiAAV0V1BgARlRAFtQYABbkFCQVltgIAFRgJBQYgAFb1Zaiz1m
```

## Writing unit tests for the smart contract

Although we have finished the code of the smart contract, we are not done yet. We still need to deploy the smart contract and verify than it’s working.

Let's go to the ```test``` folder of the project and create a new test file.
```
touch ./toDoManagerTests.js
```

In our tests we will deploy the contract to the local network spawned by **forgae** and interact with the deployed contract.
We will test the contract functionalities as follows:
- create a task;
- get the count of tasks;
- complete a task and check the task status;
- get the name of the task by task id;

The final version of the test script file - ```toDoManagerTests.js``` is:
```javascript=
const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
	host: "http://localhost:3001/",
	internalHost: "http://localhost:3001/internal/",
	gas: 200000,
	ttl: 55
};

describe('ToDoManager Contract', () => {

	let owner;
	let contractSource

	before(async () => {
		const ownerKeyPair = wallets[0];
		owner = await Ae({
			url: config.host,
			internalUrl: config.internalHost,
			keypair: ownerKeyPair,
			nativeMode: true,
			networkId: 'ae_devnet'
		});

	});

	it('Deploying ToDoManager Contract', async () => {
		contractSource = utils.readFileRelative('./contracts/ToDoManager.aes', "utf-8"); // Read the aes file

		const compiledContract = await owner.contractCompile(contractSource, { // Compile it
			gas: config.gas
		});

		const deployPromise = compiledContract.deploy({ // Deploy it
			options: {
				ttl: config.ttl,
			}
		});

		assert.isFulfilled(deployPromise, 'Could not deploy the ToDoManager Smart Contract'); // Check it is deployed
	});

	describe('Interact with contract', () => {
		let deployedContract;
		let compiledContract;

		beforeEach(async () => {
			compiledContract = await owner.contractCompile(contractSource, {})
			deployedContract = await compiledContract.deploy({
				options: {
					ttl: config.ttl
				},
				abi: "sophia"
			});
		});

		describe('Contract functionality', () => {

			describe('Create a task', () => {
				it('should create a task successfully', async () => {
					//Arrange
					const taskName = 'Task A';

					//Act
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					const taskCreationResult = await addTaskPromise;

					//Assert
					const taskCreationResultDecoded = await taskCreationResult.decode("string");
					assert.equal(taskCreationResultDecoded.value, taskName)
				});

			});

			describe('Get tasks count', () => {
				it('should get tasks count successfully', async () => {
					//Arrange
					const taskName = 'Task A';
					const secondTaskName = 'Task B';
					const expectedTasksCount = 2;

					//Add first task
					const addFirstTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addFirstTaskPromise, 'Could not call add_to_do');
					await addFirstTaskPromise;

					//Add second task
					const addSecondTaskPromise = deployedContract.call('add_to_do', {
						args: `("${secondTaskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addSecondTaskPromise, 'Could not call add_to_do');
					await addSecondTaskPromise;

					//Act
					const getTasksCountPromise = deployedContract.call('get_task_count', {
						args: `()`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(getTasksCountPromise, 'Could not call add_to_do');
					const getTasksCountResult = await getTasksCountPromise;

					//Assert
					const getTasksCountResultDecoded = await getTasksCountResult.decode("int");

					assert.equal(getTasksCountResultDecoded.value, expectedTasksCount)
				});
			});

			describe('Complete tasks and check task status', () => {
				it('should complete a task successfully', async () => {
					const taskName = 'Task A';

					//Act
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					await addTaskPromise;

					const completeTaskPromise = deployedContract.call('complete_task', {
						args: `(0)`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(completeTaskPromise, 'Could not call complete_task');
					const completeTaskResult = await completeTaskPromise;

					//Assert
					const completeTaskResultDecoded = await completeTaskResult.decode("bool");
					assert.equal(completeTaskResultDecoded.value, true)
				});

				it('should get task status successfully', async () => {
					const taskName = 'Task A';

					// Add task
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					await addTaskPromise;

					// Check status before
					const taskIsCompleteBeforePromise = deployedContract.call('task_is_completed', {
						args: `(0)`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(taskIsCompleteBeforePromise, 'Could not call complete_task');
					const taskIsCompleteBeforeResult = await taskIsCompleteBeforePromise;

					//Assert
					const taskIsCompleteBeforeResultDecoded = await taskIsCompleteBeforeResult.decode("bool");
					assert.equal(taskIsCompleteBeforeResultDecoded.value, false);

					// Complete task
					const completeTaskPromise = deployedContract.call('complete_task', {
						args: `(0)`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(completeTaskPromise, 'Could not call complete_task');
					const completeTaskResult = await completeTaskPromise;

					//Assert
					const completeTaskResultDecoded = await completeTaskResult.decode("bool");
					assert.equal(completeTaskResultDecoded.value, true)

					// Check status after
					const taskIsCompleteAfterPromise = deployedContract.call('task_is_completed', {
						args: `(0)`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(taskIsCompleteAfterPromise, 'Could not call complete_task');
					const taskIsCompleteAfterResult = await taskIsCompleteAfterPromise;

					//Assert
					const taskIsCompleteAfterResultDecoded = await taskIsCompleteAfterResult.decode("bool");
					assert.equal(taskIsCompleteAfterResultDecoded.value, true);
				});
			});

			describe('Get task name by index', () => {
				it('should get task name by index successfully', async () => {
					//Arrange
					const taskName = 'Task A';
					const secondTaskName = 'Task B';
					const secondTaskIndex = 1;

					//Add first task
					const addFirstTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addFirstTaskPromise, 'Could not call add_to_do');
					await addFirstTaskPromise;

					//Add second task
					const addSecondTaskPromise = deployedContract.call('add_to_do', {
						args: `("${secondTaskName}")`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(addSecondTaskPromise, 'Could not call add_to_do');
					await addSecondTaskPromise;

					// Get task name by index
					const getTaskNamePromise = deployedContract.call('get_task_by_index', {
						args: `(${secondTaskIndex})`,
						options: {
							ttl: config.ttl
						}
					});
					assert.isFulfilled(getTaskNamePromise, 'Could not call get_task_by_index');
					const getTaskNameResult = await getTaskNamePromise;

					//Assert
					const getTaskNameResultDecoded = await getTaskNameResult.decode("string");
					assert.equal(getTaskNameResultDecoded.value, secondTaskName);
				});

			})
		})
	});

});
```

Next step is to run our local network with the following command:
```
forgae node
```

Let's run the tests with the ```forgae test``` command and wait for the result. It should look like this:
```
===== Starting Tests =====


  ToDoManager Contract
    ✓ Deploying ToDoManager Contract (51ms)
    Interact with contract
      Contract functionality
        Create a task
          ✓ should create a task successfully (5269ms)
        Get tasks count
          ✓ should get tasks count successfully (10743ms)
        Complete tasks and check task status
          ✓ should complete a task successfully (10464ms)
          ✓ should get task status successfully (20929ms)
        Get task name by index
          ✓ should get task name by index successfully (15708ms)


  6 passing (1m)
```

## Deploy the contract to testnet
The testnet is a wonderful place where you can experiment with the To-do list Æpp without worrying that a mistake will cost you real tokens.

We will use **forgae** to deploy our contract to the testnet. The sample deployment script is scaffolded in deployment folder - ```deploy.js```.
Let’s configure our deployment script. We have to change the contract path from ```./contracts/ExampleContract.aes``` to ```./contracts/ToDoManager.aes```. The ```deploy.js``` file should look like this:
```
const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey) => {
    let deployer = new Deployer(network, privateKey);

    await deployer.deploy("./contracts/ToDoManager.aes");
};

module.exports = {
	deploy
};
```

The deploy command is:
```
forgae deploy -n testnet -s <yourPrivateKeyHere>

```

The expected result should be similar to this:
```
===== Contract: ToDoManager.aes has been deployed =====
{ owner: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
  transaction: 'th_2onSadWAGFEu5b6JUHgLegMsNescnkPKdDnzr1j9drJ1ojTsiD',
  address: 'ct_5VMNq1bmVMyRqAraPVmzu1LDmj2R8a4WFDHo5cqjcyHJddkxn',
  call: [Function],
  callStatic: [Function],
  createdAt: 2019-01-29T14:27:54.745Z }
Your deployment script finished successfully!
```

Please save the deployed contract address. In my case - ```ct_5VMNq1bmVMyRqAraPVmzu1LDmj2R8a4WFDHo5cqjcyHJddkxn```. We will use it in the [second part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-2.md) of the tutorial series.

## Conclusion
Let’s briefly recap what we did during this tutorial. We created a basic ```ToDoManager.aes``` contract that can:
- represent a task;
- create new task;
- read a specific task;
- check a task status;
- get total tasks count;
- get task by index;

We wrote basic unit tests for the contract. Then we compiled it with ```testnet``` network selected and deployed it to the ```testnet```. The deployed contract address and contract bytecode will be used in the next tutorial.
We still don’t have a frontend for our To-do list Æpp and this is our *ToDo (pun intended)* for the [second part](https://github.com/aeternity/tutorials/blob/master/build-to-do-list-aepp-2.md) of the tutorial series.