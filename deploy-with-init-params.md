# TUTORIAL: Deploying Sophia smart contracts with init parameters

## Tutorial Overview
This tutorial will walk you through the deployment of smart contracts with init parameters throug the use of forgae.


## Prerequisites
- You have completed [this tutorial](smart-contract-deployment-in-forgae.md) that teaches you how to deploy a contract without init parameters.

## Step 0. Run your forgae node
We would need a local node to compile and deploy on. The easiest option is to spawn one from forgae

```
forgae node
```

Do not forget to stop it once you are done developing

```
forgae node --stop
```

## Step 1. Update your example project
Lets add some state and init parameters to our example contract.
```
contract ExampleContract =
  record state = 
    { savedNumber : int }

  public stateful function init(num : int) = 
    { savedNumber = num }

  public function savedNumber() : int = state.savedNumber
```

As you can see the contract now has a state variable `savedNumber` of type int. The initial value will be passed by the init function. We've also added a read function for this value.

Run forgae compile to verify that your contract compiles successfully

```
forgae compile
```

## Step 2. Change our default deploy script
Lets change our default deploy script to add parameters. The parameters of the init functions are always passed as tuple. Here is how our new deploy script deploy function looks like

```
const deploy = async (network, privateKey) => {
	let deployer = new Deployer(network, privateKey)

	let contract = await deployer.deploy("./contracts/ExampleContract.aes", gasLimit, `(42)`)

	let encodedSavedNumber = await contract.callStatic('savedNumber')
	let decodedSavedNumber = await encodedSavedNumber.decode("int")
	console.log(decodedSavedNumber.value) // 42
};
```

As you can see, we are now passing the initial value value of 42 as tuple string. *Note*: If you are passing string, do not forget to add quotes (`"`) around the string too (`("Some string")`). More than one parameter can be passed separated by coma (`("Some string", 42)`))

## Step 3. Run our deploy script
Running our deployment script with forgae is trivial. Just run :
```
forgae deploy
```
You will see in your terminal the value of the saved number - 42.
## Conclusion
Smart contracts are frequently in need of init params. Keep in mind the specifics of tuples and you will be able to successfully initialize your awesome Aeternity smart contracts.

The æternity team will keep this tutorial updated. If you encounter any problems please contact us through the [æternity Forum](https://forum.aeternity.com/c/development).