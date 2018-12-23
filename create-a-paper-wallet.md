# TUTORIAL: Creating your own Aeternity Paper Wallets

## Tutorial Overview
This tutorial will walk you through the steps of creating your own Aeternity Paper Wallets. From generation of accounts through broadcasting multiple transactions at once and all the way down to generating the QR codes, this tutorial will guide you into the creation of your own AE Paper Wallets.

## Wait... what is a Paper Wallet actually?
Paper wallets are amazing tool for you to physically send AE around. It is literally printing QR code on paper and when this QR code is scanned a reward can be claimed. They are amazing for promotional campaigns, bounties or just creating physical versions of digital wallets.

## Prerequisites
- Docker
- Installed Aecli - For installation steps refer to [this tutorial](account-creation-in-ae-cli.md#installing-aecli)

## Step 1. Prepare your environment

First things first, we need to setup our working directories. Lets create a directory named `paper-wallets`. We will use this directory to execute all the following commands.
```
mkdir paper-wallets && cd paper-wallets
```

We would also need one more directory `data` - data where the various artifacts of the paper wallets will be created.
```
mkdir data
```

## Step 2. Create funding account
In order to create paper wallets we need account to fund these. Lets create a `sdk-testnet` account and get some test AE. Alternatively you can use your own testnet/mainnet accounts and skip this section.

### 2.1 Generating the funding account
The following command will create an account and save it in `sender.json` file inside `data`
```
aecli account create data/sender.json -P my_example_password
```

Your result will look something like this:
```
    Wallet saved
    Wallet address________________ ak_254JeRHzmiNVse7KFsqDG7L3WWEZXvCXkbSKK7hmBapWq9Uua8
    Wallet path___________________ /Users/my_user/paper-wallets/data/sender.json
```

### 2.2 Add some funds to your account
In order to add some funds to your account head to https://testnet.faucet.aepps.com/. Paste your wallet address (ex. `ak_254JeRHzmiNVse7KFsqDG7L3WWEZXvCXkbSKK7hmBapWq9Uua8`) and you will be given 5 AE. Do that 2-3 times.

Verify that you have your AE in your account using:
```
aecli -u https://sdk-testnet.aepps.com account balance data/sender.json -P my_example_password
```

You should see something like:
```
Your balance is: 15000000000000000000
```

### 2.3 Get and write down your nonce
At a later stage we would need the nonce of this account. Verify that it is 0 by adjusting and running the following command:
```
aecli -u https://sdk-testnet.aepps.com inspect ak_254JeRHzmiNVse7KFsqDG7L3WWEZXvCXkbSKK7hmBapWq9Uua8 -P my_example_password
```

***Note*** Change the address to your own. You can skip the -u argument for mainnet.

You should see something like this:
```
Account ID______________________________ ak_254JeRHzmiNVse7KFsqDG7L3WWEZXvCXkbSKK7hmBapWq9Uua8
Account balance_________________________ 15000000000000000000
Account nonce___________________________ 0
```

## Step 3. Creating and funding accounts for the paper wallets
### 3.1 Create paper wallet accounts
Every paper wallet is an account itself. We need to create these paper wallet accounts first. For this we will use docker and the image `aeternity/paperwallets`. The following command will automatically download the image and create 5 accounts for your 5 paper wallets.

```
docker run -it --volume=$PWD/data:/data/paperw aeternity/paperwallets \
  gen -n 5 -f /data/paperw/data.db.sqlite
```

You can easily create more/less accounts by changing the `-n` argument value.

### 3.2 Generate and broadcast paper-wallet transactions
Lets fund our paper-wallets through the wallet we created in the previous step. We need to do that in two steps - first generating fund transactions and then broadcasting them.

We will again use docker for generation of the fund transactions:
```
docker run -it --volume=$PWD/data:/data/paperw aeternity/paperwallets  txs-prepare  -f /data/paperw/data.db.sqlite  --amount 1  --nonce 1  --keystore /data/paperw/sender.json  --network-id ae_uat
```

This command will ask for your account password. If you have followed this step by step it should be `my_example_password`.

The amount parameter is how much each paper-wallet will have denominated in AE. In our case each wallet will have 1 AE

The nonce parameter should be the nonce you saw when you inspected your wallet plus one. If you want to use this on **mainnet** skip the --network-id parameter.

The result of this command should look like this:
```
top up 1AE to account ak_2nRHEtmFgmzpDBEDbceG92am1vwyaeyQSx7LHFiLrce8MXbaBk
top up 1AE to account ak_2th5G8yRaPUeSpJc3N2StwhBvnwqhGDzRmbTUSQ1aN2RVp7fC2
top up 1AE to account ak_WkjvoGDHKwMidWaTH3Z385yLAe6cx4rX5UwQUtuePMEE5KKMn
top up 1AE to account ak_pQZLHFEGgC6pNwA9KK82uEtVgme2EvxYFMhLB8pBnbyepXP3N
top up 1AE to account ak_z6QGgGpSCFc7QdV9qidH3MLpSnjT72DgcLtnjWhSnSRw5VSjM
```

The only thing we are left to do is broadcast these transactions. Docker is going to help us again here:

```
docker run -it --volume=$PWD/data:/data/paperw  aeternity/paperwallets  txs-broadcast  -f /data/paperw/data.db.sqlite  --epoch-url https://sdk-testnet.aepps.com
```

***Note***: If you want to use this on **mainnet** skip the --epoch-url parameter.

Your paper wallet accounts are funded now. The result should look something like this:

```
tx hash th_2cS5HQicY5tjWM1ZLRrQYifjuoTHF2WviP4MovrsqQYxxoBuKj broadcasted: th_2cS5HQicY5tjWM1ZLRrQYifjuoTHF2WviP4MovrsqQYxxoBuKj
tx hash th_29UDWB2vouCYwTmTDTD541RZxZfPkdZ4DAzfJEE1fzQRnwVNuY broadcasted: th_29UDWB2vouCYwTmTDTD541RZxZfPkdZ4DAzfJEE1fzQRnwVNuY
tx hash th_2LSyKZmA77U8M2i5tAhf7gJuUWFUdYgFaj45xy1fUuVBGhAYVB broadcasted: th_2LSyKZmA77U8M2i5tAhf7gJuUWFUdYgFaj45xy1fUuVBGhAYVB
tx hash th_73H8ZkVyzVgHQCPRpXspWu9pz92xPCYiH2XFEfS5xbLFdZHfD broadcasted: th_73H8ZkVyzVgHQCPRpXspWu9pz92xPCYiH2XFEfS5xbLFdZHfD
tx hash th_LcNYbAUddneanPw4frRUNB7fr7Zc2h3k131u9godj65wPQLGx broadcasted: th_LcNYbAUddneanPw4frRUNB7fr7Zc2h3k131u9godj65wPQLGx
```

## Step 4. Generate the paper wallets

### 4.1 Generate the paper wallet fronts
In order to generate the PDF paper wallets out of these accounts you can execute the following command
```
docker run -it --volume=$PWD/data:/data/paperw  aeternity/paperwallets \
 paperwallets \
 -f /data/paperw/data.db.sqlite \
 -o /data/paperw/pdfs
```

In your `data/pdfs` directory you can now see the 5 pdf paper wallets ready to be claimed.

### 4.2 Generate the paper wallet backs
As this is only the frontside of the paper-wallets, you can find and the back-sides of the paper-wallets [here](https://github.com/aeternity/tool-paperwallets/raw/master/assets/paper-wallet-back.pdf)

## Redeeming a paper wallet
In order to redeem a paper wallet you can head to https://redeem.aepps.com/#/ or use the AirGap Vault app. You will be asked to scan the QR code and following the instructions you will be able to redeem the paper wallet.

## Conclusion
Paper wallets are an amazing tool to create physical wallets and use them for promotional, exchange our bounties purposes. Following this easy guide you can create your own unique usable AE paper wallets.

*The æternity team will keep this tutorial updated with news. If you encounter any problems please contract us through the [æternity dev Forum category](https://forum.aeternity.com/c/development).*
