# TUTORIALS: How to make wallet transactions on the Web with aepp-sdk-js

## Tutorial Overview
This tutorial is meant for web developers who want to begin to build interesting applications on the aeternity blockchain.
In this tutorial we will cover the following:
- Wallet Creation
- Checking Wallet Balance
- Token transfer

## Prerequisites
- Familiarity with the javascript programming language
- Basic understanding of some blockchain terminologies

## Setup And Configuration
Create a new folder and create an index.html file in it then include the CDN link for the javascript SDK, I will be using version 7.3.1 of the aeternity javascript SDK in this tutorial, and add a link to the Node.js Buffer for web CDN like it is done below, also head over to this [url](https://github.com/MikeMcl/bignumber.js/blob/master/bignumber.js), click on raw, then right click and click on save as to download the bignumber.js file. and then include it in your project directory, this file contains a library that will give us a much more accurate precision when dealing with numbers

```html
<html>
    <head>
        <script src="https://unpkg.com/@aeternity/aepp-sdk@7.3.1/dist/aepp-sdk.browser-script.js"></script>
        <script src="https://bundle.run/buffer@5.6.0"></script>
       <script src="./bignumber.js"></script>
    </head>
</html>
```
Lastly, create an index.js file in the same directory and include it in your index.html file just after the links to the buffer.This is the file where we will be doing most of our work in, your index.html file should look like this after
```html
full head of the index.html file
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wallet Web Tutorial</title>
        <script src="https://unpkg.com/@aeternity/aepp-sdk@7.3.1/dist/aepp-sdk.browser-script.js"></script>
        <script src="https://bundle.run/buffer@5.6.0"></script>
       <script src="./bignumber.js"></script>
        <script src="./index.js"></script>
    </head>
    <body>
        
    </body>
</html>
```
With the above done, we are set to start doing wonders with the aeternity javascript SDK
 ## Wallet creation
 Creating an Aeternity wallet with the javascript SDK is extremely simple since we only need one module from the SDK to do this, which is the `Crypto` module, to have access to a wallet, we need to create a KeyPair(An object containing a private key and a public key). We will go over two ways to create this and they are:
 - KeyPair creation with an existing private key
 - New KeyPair creation without a private key
 
 ### KeyPair Creation with an existing private key
 Lets see how this is done, write the following code in the `index.js` file created earlier:
 ```javascript
 function generateKeyPairWithExistingPrivateKey(secretKey){
    const hexBuffer = Ae.Crypto.hexStringToByte(secretKey);   
      const keyPair =  Ae.Crypto.generateKeyPairFromSecret(hexBuffer)   
      const publicKey=Ae.Crypto.aeEncodeKey(keyPair.publicKey);
      const secretKey=buffer.Buffer.from(keyPair.secretKey).toString('hex')
      return{publicKey:publicKey,privateKey:secretKey};
    }
 ```
 What we do above is pretty simple, the function above expects a private key as a string and then converts it to an ArrayBuffer using the `hexStringToByte` function in the crypto module of the aepp-sdk-js. We further access the `generateKeyPairFromSecret` function in the crypto module of the aeternity javascript SDK, this function then returns a KeyPair object containing both the secret key and private key as an ArrayBuffer of view UInt8Array. The next step is to retrieve the private key and public key from their respective ArrayBuffers, we do this using the `aencodeKey` function of the `Crypto` module and the `from` method of the Buffer module to get the private key and public Key as strings. So now that you know how to get a public key from an existing private key. let's go over creating a KeyPair from a brand new public key and private key.
 
 ### New KeyPair Creation Without Existing Public Key
```javascript
 function generateKeyPairWithoutSecretKey(){
    let { secretKey, publicKey } = Ae.Crypto.generateKeyPair(true);
    console.log(secretKey);
    console.log(publicKey);
    let translatedPublicKey=Ae.Crypto.aeEncodeKey(publicKey);
    let translatedSecretKey=buffer.Buffer.from(secretKey).toString('hex');
    return {publicKey:translatedPublicKey,privateKey:translatedSecretKey};
}
```
 The function above simply creates a brand new KeyPair, we do this by accessing the `generateKeyPair` method of the  `Crypto` module of the aepp-sdk-js. Then we repeat the same steps we did earlier to get the string version of our secret key and public key.
 Voilà, we now know how to create a wallet on the Aeternity Blockchain.  Lets Quickly get into checking the bank account of this wallet.
 
## Checking The Balance Of A Wallet
To check a an aeternity wallet balance we need an instance of the sdk, so lets start by creating an sdk instance
 ```javascript
async function getSdkInstance(secretKey,publicKey){
    const NODE_URL = 'https://sdk-testnet.aepps.com';
    const ACCOUNT = Ae.MemoryAccount({ keypair: { secretKey: secretKey, publicKey: publicKey } });
    const nodeInstance = await Ae.Node({ url: NODE_URL })
    const sdkInstance = await Ae.Universal({
       compilerUrl: 'https://compiler.aepps.com',
       nodes: [ { name: 'test-net', instance: nodeInstance } ],
       accounts: [ ACCOUNT ]
    });
    return sdkInstance;
}
```
To create an SDK instance, we need to specify a Node Url `NODE_URL` which states if to connect to the mainnet or the testnet, Connecting to the testnet is enough for this tutorial so we give it a value of https://sdk-testnet.aepps.com, then we create a memory account which uses the secret key and public key our function receives to do this. Then we further create our `nodeInstance` using the `NODE` constructor of the global Ae object. Lastly, we create an SDK instance using the `Universal` constructor on the global `Ae` object and return it. Let's proceed by finally adding the function that will allow us to check our Aeternity wallet account balance.

```javascript
  async function getAccountBalance(publicKey,sdkInstance){
    try{
        let balance=await sdkInstance.balance(publicKey);
        console.log(balance);
        balance=new BigNumber(balance).dividedBy(BigNumber(1000000000000000000));
        return balance.toFixed(2)+ 'AE tokens';
    }catch(err){
         console.error(err);
         return 0;
     }   
}
```
What we do in the function above is quite simple, we get the height using the sdkInstance, we use the `balance` function on the `sdkInstance` to get the total balance. Then we return it. Note the use of try and catch block because if the amount in that account is 0 aettos, it will return an error so we simply return 0 and log the error.We also use the BigNumber library we downloaded earlier for a more accurate precision while displaying the balance


## Token Transfer
Lastly, we will create a function called `sendAeToAccount`, it will receive an sdkInstance, a public address to which we want to send tokens and the amount which we want to send.
```javascript
async function sendAeToAccount(publicAddress,amount,sdkInstance){
   
  let returnValue=await sdkInstance.spend(amount, publicAddress, { denomination: 'ae' });
  console.log(returnValue);
  console.log(returnValue.hash);
   return returnValue.hash;
}
```
All we do in the function above is just one line of code we access the `spend` function on the sdkInstance and then pass the `amount`, `publicAddress` and  `denomination` we want to use and that's all we need to so to perform a spend transaction. Finally, we return the hash.

    

## Things To Note
 - The aeternity javascript SDK of version 7.3.1 was used in this tutorial
 - You can find the source code of all that was taught [here](https://github.com/Jesulonimi21/AeWebWalletTutorial/blob/master/MakingWalletTransactionsOnTheWebTutorial/finish/). 
 - You can find a video that explains clearly all that was taught [here](https://www.youtube.com/watch?v=AztwYKJpCK4&feature=youtu.be)
 - There is also a showcase that can be found [here](https://jesulonimi21.github.io/Aeternity-Web-Wallet-ShowCase/), it explains the above including how to connect to a smart contract, you can find the source code [here](https://github.com/Jesulonimi21/Aeternity-Web-Wallet-ShowCase)
 
## Conclusion
  If you have any problem, please make sure to post it on the [Aeternity Dev Forum](https://forum.aeternity.com/c/development)

  
