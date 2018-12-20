# TUTORIAL: Operating Oracle Transactions using the æternity Node

An oracle is an entity on the blockchain that provides real-world data in a structured way, lives in the oracle state tree in a full node and is operated by an oracle operator.

The oracle operator creates an oracle by posting an oracle register transaction on the chain. The oracle register transaction registers an account as an oracle (one account - one oracle). Any user can query an oracle by posting an oracle query transaction on the chain. The oracle query transaction creates an oracle query object in the oracle state tree. The oracle operator scans the transactions on the blockchain for the oracle query transaction through whatever means. The oracle operator responds to the oracle query by posting an oracle response transaction on the chain. The oracle response transaction modifies the oracle query object by adding the response. After the response has been added, the oracle query object is closed, and is now immutable.

This tutorial is limited by using the same account as an oracle operator and as a oracle query.

## Assumptions

- You <a href= "https://github.com/aeternity/epoch/blob/master/docs/installation.md"> installed</a>,  <a href = "https://github.com/aeternity/epoch/blob/master/docs/configuration.md" >configured</a> and <a href= "https://github.com/aeternity/epoch/blob/master/docs/operation.md"> ran  your node.</a>
- After you started the node attach to it using the following command:
```
./bin/epoch attach
```
 
## Helper function to read and decrypt private and public keys
```
KeypairPassword = <<"replace_with_secret_password">>.
f(ReadKeys), ReadKeys = fun() ->
    {ok, EncPub} = file:read_file("generated_keys/key.pub"),
    {ok, EncPriv} = file:read_file("generated_keys/key"),
    PubKey = crypto:block_decrypt(aes_ecb, crypto:hash(sha256, KeypairPassword), EncPub),
    PrivKey = crypto:block_decrypt(aes_ecb, crypto:hash(sha256, KeypairPassword), EncPriv),
    {PubKey, PrivKey}
end.

{PubKey, PrivKey} = ReadKeys().
```
 
**Note:** Don't forget to replace `KeypairPassword = <<"replace_with_secret_password">>.` with your secret password.
 
## Helper function to sign a transaction
This function will be called each time when we need to sign a transaction.

```
f(SignAndPushTx), SignAndPushTx = fun(Tx) ->
    TxBin = aetx:serialize_to_binary(Tx),
    TxBinMainnet = << <<"ae_mainnet">>/binary, TxBin/binary>>,
    Signature = enacl:sign_detached(TxBinMainnet, PrivKey),
    SignedTx = aetx_sign:new(Tx, [Signature]),
    aec_tx_pool:push(SignedTx)
end.
```

## How to make oracle transactions in the æternity node CLI

Before we start you have to know how to take your next valid `nonce`. Make a get request:
```
curl -G 'http://127.0.0.1:3013/v2/accounts/your_pub_key'
```
From there you can get your current nonce and you have to add 1, to get your next valid nonce.
## 1. Oracle register transaction - an oracle operator can register an existing account as an oracle

The transaction contains:
    
- **The address** that should be registered as an oracle
- <a href= https://github.com/aeternity/protocol/blob/master/oracles/oracles.md#oracle-responses-have-a-type-declaration> **Query format** definition </a> - a field, that defines the type of query that the oracle expects from a node.
- <a href= https://github.com/aeternity/protocol/blob/master/oracles/oracles.md#oracle-responses-have-a-type-declaration>**Response format** definition </a> - a field, that defines the type of response from an oracle.
- **Query fee** - that should be paid for posting a query to the oracle.
- **Oracle TTL** - oracle TTL is a tuple of two elements. First defines the type, second - the TTL value itself. The type of TTL can be block (absolute value) or delta (relative value), the value is the block height when oracle will expire.
- **Vm version** - this field is optional. Defines on which VM the oracle should be run. 0 means no VM and 1 for Sophia.
- **Transaction fee** - the transaction fee depends on the TTL. The fee for the miner. A higher fee  means that your transaction will be prioritized by the miners.
- **Transaction TTL** - this field is optional. By default the transaction will stay in the pool forever. The TTL of the transaction defines at which height the transaction will be removed from the pool if it wasn't mined.
     
```
OracleId = aec_id:create(account, PubKey).
OracleNonce = 1. % You should get your next valid nonce and place it here
QueryFormat = <<"string()">>.
ResponseFormat = <<"boolean()">>.
QueryFee = 20000.
OracleTtl = {delta, 1234}. 
OracleFee = 20000.
VmVersion = 0. 

OracleRegisterMap = #{
    account_id => OracleId,
    nonce => OracleNonce,
    query_format => QueryFormat,
    response_format => ResponseFormat,
    query_fee => QueryFee,
    oracle_ttl => OracleTtl,
    fee => OracleFee,
    vm_version => VmVersion
}.

{ok, OracleTx} = aeo_register_tx:new(OracleRegisterMap).
```
Now you have to sign your oracle register transaction. 

```
SignAndPushTx(OracleTx).
% return value should be ok
```

After the transaction is mined it will appear in the block that it was mined in. You can check the oracle in the oracle tree:
   
```
{ok, TopState} = aec_chain:get_top_state().
Tree = aec_trees:oracles(TopState).
aeo_state_tree:get_oracle(PubKey, Tree).
```


## 2. Oracle extend transaction - an oracle operator can extend the TTL of an existing oracle (optional transaction)

The transaction contains:

- The **address/oracle** that should be extended
- An **extension** to the TTL (relative to current expiry in number of blocks)
- **Transaction fee**
    
```
OracleExId = aec_id:create(oracle, PubKey).
OracleExtendMap = #{oracle_id => OracleExId,
                    nonce => 2, % You should get your next valid nonce and place it here
                    oracle_ttl => {delta, 1000},
                    fee => 20000}.

{ok, OracleExtendTx} = aeo_extend_tx:new(OracleExtendMap).
```

Now you have to sign your oracle extend transaction.

```
SignAndPushTx(OracleExtendTx).
% return value should be ok
```
    
## 3. Oracle query transaction
The transaction contains:

- **The sender address**
- **Nonce**
- **Oracle address**
- **Query** in binary format
- **Response** in binary format
- **Transaction TTL**
- **Response TTL**
- **Transaction fee**

The transaction creates an oracle interaction object in the oracle state tree. The ID of this object is constructed from the query transaction as the hash of {sender_address, nonce, oracle_address}.

   The **query TTL** decides how long the query is open for response from the oracle.

The query TTL can be either absolute (in block height) or relative (also in block height) to the block the query was included in.

The **response TTL** decides how long the response is available when given from the oracle. The response TTL is always relative. This is so as to not to incentivize the oracle to post the answer late, since the oracle is paying the fee for the response.

```
SenderId = aec_id:create(account, PubKey).
QueryNonce = 3. % You should get your next valid nonce and place it here
Oracle_id = aec_id:create(oracle, PubKey).
Query = <<"Is it raining in Berlin?">>.
QueryTtl = {delta, 1000}.
QueryFee = 20000.
ResponseTtl = {delta, 1000}.
TxFee = 20000.

OracleQueryMap = #{
    sender_id => SenderId, 
    nonce => QueryNonce, 
    oracle_id => Oracle_id, 
    query => Query, 
    query_fee => QueryFee, 
    query_ttl => QueryTtl, 
    response_ttl => ResponseTtl, 
    fee => TxFee
}.

{ok, OracleQueryTx} = aeo_query_tx:new(OracleQueryMap).
```
    
Now you have to sign your query transaction.
     
```
SignAndPushTx(OracleQueryTx).
% return value should be ok
```

## 4. Oracle response transaction - the oracle operator responds to a query by posting an oracle response transaction

The transaction contains:

- **Oracle address**
- **Nonce**
- **Query ID**
- The **response** in binary format
- **Response TTL**
- **Transaction fee**
- **Transaction TTL**

```
RegisteredOracleId = aec_id:create(oracle, PubKey).
ResponseNonce = 4. % You should get your next valid nonce and place it here
QueryId = aeo_query:id(PubKey, QueryNonce, PubKey). % Note: our oracle will respond to the query which he made to himself
Response= <<"true">>.
ResponseTtl = {delta, 1000}.
ResponseFee = 20000.

OracleResponseMap = #{
    oracle_id => RegisteredOracleId, 
    nonce => ResponseNonce, 
    query_id => QueryId, 
    response => Response, 
    response_ttl => ResponseTtl, 
    fee => ResponseFee
}.

{ok, OracleResponseTx} = aeo_response_tx:new(OracleResponseMap).
```
  
Now you have to sign your response transaction.
    
```
SignAndPushTx(OracleResponseTx).
% return value should be ok
```
In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/development). 