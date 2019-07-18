# TUTORIAL: How to Setup a Private Testnet on a Single Machine
 
## Requirements
 1. [docker](https://docs.docker.com/install/)
 2. [docker-compose](https://docs.docker.com/compose/install/)
 3. [æternity node source code](https://github.com/aeternity/epoch)

## Running a local network

A small local network of three nodes can be deployed with `docker-compose`. These nodes will only operate locally and won't connect to the main network.

They run mean15-generic miners (fastest generic miner).

Their respective configuration files are `docker/epoch_node{1/2/3}_mean15.yaml`. 

They are configured to connect to each other on start and all have the same mining beneficiary (`ak_twR4h7dEcUtc2iSEDv8kB7UFJJDGiEDQCXr85C3fYF8FdVdyo`), for more details on configuration see [configuration documentation](https://github.com/aeternity/epoch/blob/master/docs/configuration.md).

Both the external and internal API is exposed on the following ports: 
- `node1` - port 3001
- `node2` - port 3002
- `node3` - port 3003


For example, to inspect the top block of `node2`:

```bash
curl http://localhost:3002/v2/blocks/top
```

[API usage documentation](https://github.com/aeternity/protocol/tree/master/epoch/api)


The documentation below assumes that current directory is that of the source code.

Before running make sure to pull the latest images:
```bash
docker-compose pull
```

Start the network in foreground mode (for log inspection purposes):

```bash
docker-compose up
```


Start the network in background mode:

```bash
docker-compose up -d
```


Stop the network:

```bash
docker-compose down
```

Stop the network and cleanup volumes:

```bash
docker-compose down -v
```

By default the default mine rate is 1 block per 15 seconds.
It can be changed by setting the `EPOCH_MINE_RATE`environment variable.
The variable is in milliseconds.

```bash
EPOCH_MINE_RATE=10000 docker-compose up
```

In case there are any other problems, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development). 