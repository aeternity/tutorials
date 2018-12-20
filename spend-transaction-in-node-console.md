
# TUTORIAL: How to do a Spend Transaction in æternity Node CLI
    
## Assumptions
##### The instructions below assume that
1. You <a href= "https://github.com/aeternity/epoch/blob/master/docs/installation.md"> installed</a>,  <a href = "https://github.com/aeternity/epoch/blob/master/docs/configuration.md" >configured</a> and <a href= "https://github.com/aeternity/epoch/blob/master/docs/operation.md"> ran  your node </a>
2.  You know your own public key and the recipient public key

## 1. Attaching to Erlang console 
After you started the node, attach to it, using the following command:
```
./bin/epoch attach
```

## 2. Sender's public key Base58 decoding
The keys should now be decoded. The æternity node implements it's own **base58** decoding functionality:
```
{_, Sender_pub_key} = aehttp_api_encoder:decode(<<"your_pub_key">>).
```

## 3. Recipient's public key Base58 decoding
Now, the same with recipient's public key:
```
{_, Recipient_pub_key} = aehttp_api_encoder:decode(<<"recipient_pub_key">>).
```

## 4. Adding binary identifiers 
Then, you have to add <a href= "https://github.com/aeternity/protocol/blob/epoch-v1.0.1/serializations.md#the-id-type" >binary identifiers </a> to them:
```
Sender_id = aec_id:create(account, Sender_pub_key).
Recipient_id = aec_id:create(account, Recipient_pub_key).
```

## 5. Creating a body of the transaction 
You will have to create **a data** for key-value structure with provided data, called <a href ="http://erlang.org/doc/man/maps.html"> a map</a> with following commands:
 ```
 % amount of tokens you want to send, example: 200000
Amount = 200000.          

% the fee for the miner. Higher fee makes your transaction to be more prioritized by miner. In this example: 20000
Fee = 20000.    

% You can get your valid next nonce by making a get request:
% curl -G 'http://127.0.0.1:3013/v2/accounts/your_pub_key'. From there you can get your current nonce and you have to add 1.
Nonce = 1.                
Payload = <<"">>.
```
And now the map itself: 
```
TxData = #{
    sender_id    => Sender_id,
    recipient_id => Recipient_id,
    amount       => Amount,
    fee          => Fee,
    nonce        => Nonce,
    payload      => Payload
}.
```
Then, to **build** a spend transaction, call:

```
{ok, Tx} = aec_spend_tx:new(TxData).
```

## 6. Preparing a private key
Now you have to sign this transaction with your private key. First, you need to get your private key.

Assuming that you generated them using the æternity node key generator:

```
{ok, EncPriv} = file:read_file("generated_keys/key").
```

This will return your **encrypted private key**.
In order to use it, you should **decrypt** it:

```
PrivKey = crypto:block_decrypt(aes_ecb, crypto:hash(sha256, <<"your_secret_password">>), EncPriv).
```
  
## 7. Signing a transaction
When we have our decrypted private key, we are ready to sign the transaction:
```
TxBin = aetx:serialize_to_binary(Tx).
TxBinMainnet = << <<"ae_mainnet">>/binary, TxBin/binary>>.
Signature = enacl:sign_detached(TxBinMainnet, PrivKey).
SignedTx = aetx_sign:new(Tx, [Signature]).
```
## 8. You have to add the Signed Transaction to the pool
```
aec_tx_pool:push(SignedTx).
```  
The transaction should now be pushed to the transactions pool to be picked up by miners in the next blocks. In the block explorer https://explorer.aepps.com/ you can verify that your transaction was mined, looking for your account in the last blocks.

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development).
