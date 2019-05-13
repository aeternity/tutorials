# TUTORIAL: Run an æternity Node on Ubuntu 18.04

## 1. Install libssl and libsodium
1.1. Install libssl by running`sudo apt-get install libssl1.0.0` inside the terminal
1.2. Install libsodium using `sudo apt-get install libsodium23`

For further information visit our documentation: https://github.com/aeternity/epoch/blob/master/docs/installation.md

## 2. Download and unpack the latest æternity Ubuntu Release: 
2.1. Download: latest Ubuntu release under https://github.com/aeternity/epoch/releases
2.2. Make a new directory and enter it. In your terminal type: `mkdir node` then `cd node`
2.3. Unpack epoch release inside directory. In your terminal type:
`tar xf ~/Downloads/epoch-1.0.1-ubuntu-x86_64.tar.gz`
 
## 3. Configure the node
3.1. Inside your node directory create an`aeternity.yaml` file
3.2. Go to https://airgap.it/ or https://base.aepps.com/ and create an AE keypair
3.3. Copy paste the below provided code to epoch.yaml 

```
sync:
    port: 3015

keys:
    dir: keys
    peer_password: "secret"

http:
    external:
        port: 3013
    internal:
        port: 3113

websocket:
    channel:
        port: 3014

mining:
    beneficiary: "beneficiary_pubkey_to_be_replaced"
    autostart: false

chain:
    persist: true
    db_path: ./my_db

fork_management:
    network_id: ae_mainnet
```

3.4. Replace peer_password: “secret” with your own password.
3.5. Replace beneficiary: “beneficiary_pubkey_to_be_replaced” with your AE public key.
3.6. Check if your `aeternity.yaml` configuration is OK. In your terminal type: `./bin/aeternity check_config aeternity.yaml`
You should get an “OK” back, if not go through your config and check for mistakes.

## 4. Make sure your node is connectable

https://blog.aeternity.com/insides-from-the-coredev-corner-configuring-ports-of-the-%C3%A6ternity-epoch-node-3bf366ebed26

## 5. Run the node
4.1. Start the node inside your node directory using `./bin/aeternity start` inside the terminal.
4.2. Inspect the current top of the blockchain as seen by the roma network. In your terminal type:
`curl http://35.178.61.73:3013/v2/blocks/top`
4.3. Inspect the current top of the blockchain as seen by your node. In your terminal type:
`curl http://127.0.0.1:3013/v2/blocks/top`

## Troubleshooting
**General note**
If you are stuck, post your question in [the Forum](https://forum.aeternity.com/c/development), look into the documentation on https://github.com/aeternity/epoch/tree/master/docs or check the logs inside the logs folder in your node directory.

