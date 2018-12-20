# TUTORIAL: How to Run the æternity CPU Miner on Ubuntu 18.04

## Assumptions

The instructions below assume that you have installed and configured your node ([Ubuntu 18.04](https://hackmd.aepps.com/EYdgDAHALDCcC0ATAbLZ8oDMoCZ4EMJY9MQBTAVimTB2XxAGYg==?view) / [macOS Mojave](https://hackmd.aepps.com/KYDgzA7ARhBMAmBaADAYwKxUQFgGwENZER9kAzRWVYWWcseARnwE4g==?view)).

## Run automatically
Assuming that you have created and set up your `epoch.yaml` file:

1. Under `mining` section, change the value of `autostart` to `true`
2. Run your node ([Ubuntu 18.04](https://hackmd.aepps.com/EYdgDAHALDCcC0ATAbLZ8oDMoCZ4EMJY9MQBTAVimTB2XxAGYg==?view) / [macOS Mojave](https://hackmd.aepps.com/KYDgzA7ARhBMAmBaADAYwKxUQFgGwENZER9kAzRWVYWWcseARnwE4g==?view))

## Run manually
Assuming that you have ran your node ([Ubuntu 18.04](https://hackmd.aepps.com/EYdgDAHALDCcC0ATAbLZ8oDMoCZ4EMJY9MQBTAVimTB2XxAGYg==?view) / [macOS Mojave](https://hackmd.aepps.com/KYDgzA7ARhBMAmBaADAYwKxUQFgGwENZER9kAzRWVYWWcseARnwE4g==?view)):

1. Attach to your node, using the command `./bin/epoch attach`
2. To start the mining process, type `aec_conductor:start_mining().` in the interactive console. You should see `ok` as a result from the command.
3. Check the miner's status by typing `aec_conductor:get_mining_state().`. You should receive `running` as a result.

## Check miner status
+ In interactive console - type `aec_conductor:get_mining_state().`
+ In `log/epoch_mining.log` file - check for `Starting mining` message entries from the miner process. If something goes wrong, a corresponding `[error]` message will be added to the file.

## Stop miner
To stop the miner, type `aec_conductor:stop_mining().` in the interactive console.

## Adjust miner executable
In order to change the miner executable and pass arguments to it, add the following in the `mining` section in `epoch.yaml` file:
```
cuckoo:
        miner:
            executable: mean29-generic
            extra_args: "-t 5"
```
Where:
+ `executable` is the chosen executable binary of the miner
+ `extra_args` is the arguments, passed to the executable binary; can be used to define the number of processing threads in order to optimize the process. Depends on your hardware - can be set to the number of your virtual cores

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/mining).