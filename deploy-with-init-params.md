# TUTORIAL: Deploying Sophia smart contracts with init parameters

## Tutorial Overview

This tutorial will walk you through the deployment of smart contracts with init parameters through the use of forgae.

## Prerequisites

You have completed [this tutorial](smart-contract-deployment-in-forgae.md) that teaches you how to deploy a contract without init parameters.

## Step 0: Create a project and Run your forgae node

We would need a local node to compile and deploy on. The easiest option is to spawn one from forgae. Follow the below steps to create a project, initilize the project and test the project using forgae on your CLI

```
Step 1: $ mkdir forgae-init
Step 2: $ cd forgae-init
Step 3: $ forgae init
Step 4: $ forgae node or docker-compose up for docker-toolbox users
```

### Check if you are on track

- Step 3 Output

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
```

- Step 4 Output

```
===== Starting node =====
........Creating forgae-init_node3_1 ...
Creating forgae-init_node1_1 ...
Creating forgae-init_proxy_1 ...
Creating forgae-init_node2_1 ...
..............

===== Node was successfully started =====
===== Funding default wallets =====

....
===== Default wallets was successfully funded! =====
```

Do not forget to stop it once you are done developing

```
forgae node --stop
```

## Step 1: Update your ExampleContract.aes

Lets add some state and init parameters to our example contract which can be found at **contracts/ExampleContract.aes**

```
contract ExampleContract =

  record state = { saved_string : string }

  function init() = { saved_string = "aeternity" }

  public function get_string() : string =
	  state.saved_string

  public stateful function register_string(word : string) =
	  put(state { saved_string = word})
```

As you can see the contract now has a state variable `saved_string` of type `string`. The initial value will be passed by the init function. We've also added a read function `get_string` for this value and a write function `register_string` to write and change the value in `saved_string`.

Run forgae compile to verify that your contract compiles successfully

```
forgae compile
```

## Step 2. Update your deploy.js

Lets add some parameters to our example deploy script which can be found at **deployment/deploy.js**. The parameters of the init functions are always passed as tuple. Here is how our new deploy script looks like

```
const Deployer = require('forgae-lib').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    let contract = await deployer.deploy("./contracts/ExampleContract.aes")

    // Getting savedString value in our ExampleContract
    let get_string = await contract.call('get_string')
    console.log(get_string.value)

    // Writing new value ('hello world') to our saved_string
    await contractCall('register_string', 'hello world')

    // Getting new saved_string value in our ExampleContract
    let get_string2 = await contract.call('get_string')
    console.log(get_string2.value)
};

module.exports = {
    deploy
};
```

As you can see, we got our first initial value of `aeternity` then we are add a new value `hello world` as a tuple string and finally got the new value.

## Step 3. Run our deploy script

Running our deployment script with forgae is trivial. Just run :
```
forgae deploy
```

You will see in your terminal the value of the saved string - aeternity.

## Conclusion

Smart contracts are frequently in need of init params. Keep in mind the specifics of tuples and you will be able to successfully initialize your awesome Aeternity smart contracts. The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).
