# TUTORIAL: Register and Update a Name in æternity using the æternity Node

This tutorial explains how to use the æternity node's Erlang shell and APIs to register a name using the æternity naming system.

In the current state the æternity protocol only allows for names to end in ".test", later in development more namespaces will be added. This tutorial is supposed to be run on the live æternity network, registering persistent names, but the ".test" limitation applies.

## Prerequisites

 - a running æternity node is set up locally (have a look [here](LINK) to learn how to install an æternity node)
 - the node must have a keypair set up, this can be done using `./bin/epoch keys_gen replace_with_secret_password`, note the public key which is returned and remember the password
 - the account must have a miniumum balance of 60003 


## 1. Preparing the node

 - the node should be started using `./bin/epoch console`, in case it is already running use `./bin/epoch attach` to attach the epoch Erlang shell to your terminal
 - in another terminal verify you have a minimum balance of 60003, also note the `nonce` using `curl localhost:3013/v2/accounts/your_public_key`
 - in the epoch terminal, read, decrypt and verify the keypair, using below code
```erlang
KeypairPassword = <<"replace_with_secret_password">>.

% defines a function to read the keypair from disk, decrypt and verify it
f(ReadKeys), ReadKeys = fun() ->
    
    % read encrypted keys from disk
    {ok, EncPub} = file:read_file("generated_keys/key.pub"),
    {ok, EncPriv} = file:read_file("generated_keys/key"),
    
    % decrypt keys using KeypairPassword
    PubKey = crypto:block_decrypt(aes_ecb, crypto:hash(sha256, KeypairPassword), EncPub),
    PrivKey = crypto:block_decrypt(aes_ecb, crypto:hash(sha256, KeypairPassword), EncPriv),
    
    % verify keys to be correct
    SampleMsg = <<"random message">>, 
    Signature = enacl:sign_detached(SampleMsg, PrivKey),
    {ok, SampleMsg} == enacl:sign_verify_detached(Signature, SampleMsg, PubKey),
    
    % return keys
    {PubKey, PrivKey}
end.

% execute function, to assign PubKey, PrivKey variables for later use
{PubKey, PrivKey} = ReadKeys().
% should display keys in binary representation in the shell similar to {<<123, 123, 123, ...>>, <<123, 123, 123, ...>>}
```

**Note:** Don't forget to replace `KeypairPassword = <<"replace_with_secret_password">>.` with your secret password.

## Signing a transaction

We define a function to sign and push a transaction to the pool for ease of use later in the tutorial.

```erlang
f(SignAndPushTx), SignAndPushTx = fun(Tx) ->
    TxBin = aetx:serialize_to_binary(Tx),
    
    % appends the mainnet identifier to the transaction, in case of doing this on the testnet it needs to be adjusted
    TxBinMainnet = << <<"ae_mainnet">>/binary, TxBin/binary>>,
    
    % sign and package the transaction
    Signature = enacl:sign_detached(TxBinMainnet, PrivKey),
    SignedTx = aetx_sign:new(Tx, [Signature]),
    
    % push the transaction into the pool
    aec_tx_pool:push(SignedTx)
end.
% should display #Fun<.... in the shell to indicate function creation was successful
```

## 2. Naming workflow

A name registration is done in three steps for security reasons. First, the name is pre-claimed, this registers a hidden commitment to register some name. Afterwards, this name can be claimed, making it public without anybody being able to steal it, as it was pre-claimed before. Then the name can be updated, to attach some data to it and make it usable.

## Pre-Claim Name

Pre-Claiming requires to create a "commitment" to register the name, using a secret salt and the name, hashed together, for ease of use, define a function to do this. 

```erlang
% limit the lifetime of the transaction, in block height, choose something slightly (e.g. 50 blocks) above current top
TTL = 10000.

% fee will be set to 20.000 here, as this is slightly above protocol minimum, in future this may need to be increased
Fee = 20000.

f(CreatePreClaimTx), CreatePreClaimTx = fun(Name, Salt, Nonce) ->

    % use the name and salt to create the hidden commitment
    Commitment = aens_hash:commitment_hash(Name, Salt),
    
    % package commitment to uniform id
    CommitmentId = aec_id:create(commitment, Commitment),
    
    % package the account as id as reference who the name should belong to
    AccountId = aec_id:create(account, PubKey),
    
    % generate the pre-claim transaction
    aens_preclaim_tx:new(#{account_id => AccountId, commitment_id => CommitmentId, nonce => Nonce, fee => Fee, ttl => TTL })
end.
% should display #Fun<.... in the shell to indicate function creation was successful
```

After defining our name parameters and pre-claim create function we can execute it, sign and push the transaction. In the current version of the protocol only names ending on ".test" are allowed.

```erlang

% replace this with a desired_name
Name = <<"desired_name.test">>.

% replace this with some secret number
Salt = 123.

% previously noted nonce + 1
f(Nonce), Nonce = 1.

% build pre-claim transaction
{ok, PreClaimTx} = CreatePreClaimTx(Name, Salt, Nonce).

% sign and push the transaction
SignAndPushTx(PreClaimTx).
% return value should be ok
```

The transaction should now be pushed to the transactions pool to be picked up by miners in the next block. In the block explorer https://explorer.aepps.com/ you can verify that your transactions were mined and the name successfully pre-claimed, looking for your account or name or transaction type in the last blocks.

## Claim Name

After pre-claiming a name we need to make the name and chosen salt public to prove that our account is the owner of the name. before we do this, we need to wait for the pre-claim transaction to be included in a block.

```erlang
f(CreateClaimTx), CreateClaimTx = fun(Name, Salt, Nonce) ->

    % package the account as id as reference who the name should belong to
    AccountId = aec_id:create(account, PubKey),
    
    % generate the claim transaction, reusing fee and ttl variables defined before
    aens_claim_tx:new(#{account_id => AccountId, name => Name, name_salt => Salt, nonce => Nonce, fee => Fee, ttl => TTL })
end.
% should display #Fun<.... in the shell to indicate function creation was successfull
```

After defining the claim create function we can execute it, sign and push the transaction.

```erlang
% next nonce of the account, if there have been no intermediate transactions this is the following nonce to the pre-claim transactions one
f(Nonce), Nonce = 2.

% build claim transaction, reusing name and salt variables defined before
{ok, ClaimTx} = CreateClaimTx(Name, Salt, Nonce).

% sign and push the transaction
SignAndPushTx(ClaimTx).
% return value should be ok
```
The transaction should now be pushed to the transactions pool to be picked up by miners in the next block. In the block explorer https://explorer.aepps.com/ you can verify that your transactions were mined and the name successfully registered, looking for your account or name or transaction type in the last blocks.


## Update Name

Afterwards, the name is registered to the account and can be updated to provide functionallity as to point to an oracle, contract or account (AE address). In this tutorial we demonstrate how to point the name to the original account, so any transaction can be sent to this account, refering to its name, instead of the public key (which is much more user-friendly).


```erlang
f(UpdateNameTx), UpdateNameTx = fun(Name, Nonce) ->

    % refering to the name by hash and packaging it as id
    NameHash = aens_hash:name_hash(Name),
    NameId = aec_id:create(name, NameHash),
    
    % package the account as id as reference who the name should belong to
    AccountId = aec_id:create(account, PubKey),
    
    % creating a pointer, to point the name to the account
    Pointers = [aens_pointer:new(<<"account_pubkey">>, AccountId)],
    
    % generate the update transaction, reusing fee and ttl variables defined before, name_ttl is for how long the registration should be valid for in blocks and client_ttl the value the cache should be present in resolving this entry in milliseconds
    aens_update_tx:new(#{account_id => AccountId, name_id => NameId, pointers => Pointers, nonce => Nonce, name_ttl => 36000, client_ttl => 36000, fee => Fee, ttl => TTL })
end.
% should display #Fun<.... in the shell to indicate function creation was successful
```
After defining the update name function we can execute it, sign and push the transaction.

```erlang
% next nonce of the account, if there have been no intermediate transactions this is the following nonce to the pre-claim transactions one
f(Nonce), Nonce = 3.

% build claim transaction, reusing name and salt variables defined before
{ok, UpdateTx} = UpdateNameTx(Name, Nonce).

% sign and push the transaction
SignAndPushTx(UpdateTx).
% return value should be ok
```
The transaction should now be pushed to the transactions pool to be picked up by miners in the next block. In the block explorer https://explorer.aepps.com/ you can verify that your transactions were mined and the name successfully updated, looking for your account or name or transaction type in the last blocks.

## Further Documentation

æternity's Naming System Protocol: https://github.com/aeternity/protocol/blob/master/AENS.md

## Troubleshooting

If the pool does not accept the transaction it will show an error message:

 - the nonce could be to high or low and thus needs to be a adjusted to the next higher of the account as seen in `curl localhost:3013/v2/accounts/your_public_key`
 - the fee could be to low and thus needs to be higher
 - the transaction ttl could be to low and needs to be above the current top block height.

The transaction may not be imediately be picked up by miners. In the block explorer https://explorer.aepps.com/ you can verify that your transactions were mined, looking for your account or name or transaction type in the last blocks.

In case there are any other problems, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development). 