# Tutorials How to make wallet transactions on Android

## Tutorial Overview
This tutorial is mend for android developers who want to begin to build interesting applications on the aeternity blockchain.
In this tutorial we will cover the following:
- Wallet Creation
- Checking Wallet Balance
- Token transfer

## Prerequisites
- A familiarity with the kotlin programming language
- Basic understanding of some blockchain terminologies

## Setup And Configuration
Create a new android studio project, change the language type to kotlin, set the minimum sdk version to 26(Android 8.0 oreo)
Now, in your app level build.gradle file, add the code below just after the closing brace of the defaultConfig

```gradle
 compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    packagingOptions {
        exclude 'META-INF/DISCLAIMER'
        exclude 'META-INF/io.netty.versions.properties'
        exclude 'META-INF/INDEX.LIST'
    }
    packagingOptions {
        exclude 'lib/x86_64/darwin/libscrypt.dylib'
        exclude 'lib/x86_64/freebsd/libscrypt.so'
        exclude 'lib/x86_64/linux/libscrypt.so'
    }
```

and finally add this dependency to the dependency section of your project and click ``sync now``
 
   ``` implementation 'com.kryptokrauts:aepp-sdk-java:2.2.1'  ```
   
   
 So simple, thats all you need to get set up
    
    
 ## Wallet creation
 To create a wallet, we need to make use of some classes which include the AeternityService,AeternityServiceFactory,AeternityServiceConfiguration,KeyPairService,Keypair.
  - AeternityService: It is the central access point to all Services
  - AeternityServiceFactory: Used to provide a Singleton instance of the AeternityService
  - AeternityServiceConfiguration: Used to configure the AeternityService object
  - KeyPairService: It is used to create A keypair
  - KeyPair: An existence of a wallet on the aeternity blockchain, contains access to publicKey, privateKey,...
    
  Lets begin to Use some of all this classes in our Project,Open the MainActivity class of your project and write the following:
  ```kotlin
lateinit var keyPairService:KeyPairService
lateinit var userKeyPair:BaseKeyPair
lateinit  var mnemonicKeyPair:MnemonicKeyPair
lateinit var aeternityService:AeternityService
//You can change the variables below to also point to the mainnet, the testnet is enough for this example
private val aeternalBaseUrl="https://testnet.aeternal.io";
private val nodeBaseUrl="https://sdk-testnet.aepps.com"
  ```
 Then in your onCreate function  initialize your ``aeternityService`` and ``keypairService``  variables, we also need to disable Vert.x
 from  creating a cache folder to avoid an exception,Since the aepp-sdk-java creates an instance of it behind the scenes
 
 ```kotlin
   System.setProperty("vertx.disableFileCPResolving", "true")
   
   aeternityService=AeternityServiceFactory().getService(
            AeternityServiceConfiguration.configure()
                .baseUrl(nodeBaseUrl)
                .aeternalBaseUrl(aeternalBaseUrl)
                .compile()
        )
        
   keyPairService=KeyPairServiceFactory().service    
 ```
 ## Creating a Keypair
 We will cover two ways to create a KeyPair object, the first is creating a Keypair object using a mnemonic String and the other is creating a  KeyPair object without a mnemonic string.
### Creating A Keypair With A Mnemonic String
 lets create a function called ``createAccountFromMnemonic`` that will create a keypair
 ```kotlin
   fun createAeAccountFromMnemonic(){
        mnemonicKeyPair=keyPairService.generateMasterMnemonicKeyPair(null)
        userKeyPair = EncodingUtils.createBaseKeyPair(keyPairService.generateDerivedKey(mnemonicKeyPair, true))
        Log.d("usersMnemonicSeedWord",mnemonicKeyPair.mnemonicSeedWords.joinToString{it+" "})
        Log.d("usersKeys",userKeyPair.privateKey+"\n ${userKeyPair.publicKey}")
    }
 ```
 one thing to note presently is that there is a slight bug with creating a keypair with a mnemonic, you can follow the issue on github here https://github.com/kryptokrauts/aepp-sdk-java/issues/126
 ### Creating A KeyPair Without A Mnemonic String
 ```kotlin
 fun createAccountWithoutMnemonic(){
  userKeyPair= keyPairService.generateBaseKeyPair()
   Log.d("usersKeys",userKeyPair.privateKey+"\n ${userKeyPair.publicKey}")
 }
 ```
 Then you can always recover the created Keypair by using the privateKey
 ```kotlin
  fun recoverWalletFromPrivateKey(){
  var recoverredKeyPair= keyPairService.generateBaseKeyPairFromSecret(userKeyPair.privateKey);
   Log.d("usersKeys",recoverredKeyPair.privateKey+"\n ${recoverredKeyPair.publicKey}")
  }
 ```
 
 
 
 ## Transfer Tokens
  Next we will create a function called ``sendAe`` that will receive as input two Strings, one for the publicAddress and the other for
  the amount
  ```kotlin
    fun sendAe(var pAddrToSend:String,var amount:String){
       var account = aeternityService.accounts.blockingGetAccount(Optional.of(pAddrToSend))
        var spendTx = SpendTransactionModel.builder().amount(UnitConversionUtil.toAettos(amount, UnitConversionUtil.Unit.AE).toBigInteger()).nonce(account.nonce.add(
            BigInteger.ONE)).recipient(
           pAddrToSend).sender(userKeyPair.publicKey).ttl(BigInteger.ZERO).build()
        var result = aeternityService.transactions.blockingPostTransaction(spendTx, userKeyPair.privateKey)
    
    }
  ```
  Notice how we use the privateKey field on the userKeyPair object to access the private key of the already created user so as to
send tokens from his wallet  
  
  ## Checking Wallet Balance
    Lastly we will create a function to get the balance of a user using his public address
    
```kotlin   
fun getAeBalance(var publicAddress:String){

        var account= aeternityService.accounts.blockingGetAccount(Optional.of(publicAddress))

        Thread({
            var account= aeternityService.accounts.blockingGetAccount(Optional.of(userKeyPair.publicKey));
            Log.d("balance","Balance is ${account.balance}")
        }).start()
    }
```
 # Things To Note
  - This tutorial was done using the gradle pugin 3.6.0 and Gradle build tools version 5.4.6
  - BigDecimal and BigInteger are used instead of  double, float and int for a higher precision while making calculation
  - It is important to remember to put most of this operations in another thread using Coroutines, Thread or AsyncTasks
  - You can always check out the documentation here https://kryptokrauts.gitbook.io/aepp-sdk-java/use-the-sdk/overview-structure
    to understand any class better
    
 
   
