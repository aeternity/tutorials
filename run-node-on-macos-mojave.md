# TUTORIAL: Run an æternity Node on macOS Mojave

## 1. Install OpenSSL and libsodium with Homebrew
1.1. Install the Homebrew package manager for macOS: https://brew.sh

1.2. Install OpenSSL with Homebrew in its default path. Open your terminal and type:
`brew install openssl`

1.3. Install libsodium with Homebrew in its default path. In your terminal type: 
`brew install libsodium`

NOTE: In case you have installed either of them already in a non-default path, you could use symlink(s) to work around the issue.

For further information visit our documentation: https://github.com/aeternity/epoch/blob/master/docs/installation.md

## 2.  Download and unpack the latest æternity OSX Release: 
2.1. Download the latest æternity release for macOS from https://github.com/aeternity/epoch/releases

2.2. Make a new directory and enter it. In your terminal type:
`mkdir node`
`cd node`

2.3. Unpack epoch release inside directory. In your terminal type:
`tar xf ~/Downloads/epoch-1.0.1-osx-10.13.6.tar.gz`
 
## 3.  Configure the node
3.1. Inside your node directory create the file `epoch.yaml`

3.2. Go to https://airgap.it/ or https://base.aepps.com/ and create an AE keypair.

3.3. Copy paste the below provided code to `epoch.yaml` 

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

3.5. Replace beneficiary: “beneficiary_pubkey_to_be_replaced” with your AE Public key.

3.6. Check if your epoch.yaml configuration is OK.
In your terminal type: 
`bin/epoch check_config epoch.yaml`

You should get an “OK” back, if not go through your config and check for mistakes.

## 4.  Run the node
4.1. Start the node inside your node directory. In your terminal type: 
`bin/epoch start`

4.2. Inspect the current top of the blockchain as seen by the roma network. In your terminal type:
`curl http://35.178.61.73:3013/v2/blocks/top`

4.3. Inspect the current top of the blockchain as seen by your node. In your terminal type:
`curl http://127.0.0.1:3013/v2/blocks/top`

## Troubleshooting
**General note**
If you are stuck, post your question in [the Forum](https://forum.aeternity.com/c/development), look into the documentation on https://github.com/aeternity/epoch/tree/master/docs or check the logs inside the logs folder in your node directory. 

**File limit 256**
If you try to run the node and you get the warning: 
> WARNING: ulimit -n is 256; 24576 is the recommended minimum.

A. Try to increase the file limit
In your terminal type: 
`ulimit -n 24576`

B. If this is not working and you can't start your node, follow the steps mentioned in this link https://www.macobserver.com/tips/deep-dive/evade-macos-many-open-files-error-pushing-limits/ starting at "Configuring Your New File Limits".


