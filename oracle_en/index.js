const contractSource = `
contract Oracles =
  record state = {  									
    source_oracle : map(address, oracle(string, string)),
    id_query : map(address, oracle_query(string, string)),
    question_answer : map(string, string)}
  stateful entrypoint init() : state =  						 
    { source_oracle = {},
      id_query = {}, 
      question_answer  = {} }
  stateful entrypoint registerOracle(      						
        qfee : int,     						 //Minimum payment fee
        rttl : int) : oracle(string, string) =   //oracle expiration time blocks
    let register: oracle(string, string) =  Oracle.register(Contract.address, qfee, RelativeTTL(rttl))
    put(state{ source_oracle[Contract.address] = register })
    register
  entrypoint get_oracle(): oracle(string, string) =  					
    switch(Map.lookup(Contract.address, state.source_oracle))
      None    => abort("Not registered")
      Some(x) => x
  stateful entrypoint extendOracle(  							
                                o   : oracle(string, string),	//oracle address
                                ttl : int) : unit =		//oracle expiration time blocks 
    Oracle.extend(o, RelativeTTL(ttl))
  payable stateful entrypoint quest_answer(quest : string, answ : string) : bool = 
    let val = Call.value
    if(val > 0)
      false
    else
      put(state{question_answer[quest] = answ })
      true
  entrypoint getQuestion(  								
                o : oracle(string, string),    		            //oracle address
                q : oracle_query(string, string)) : string =    //id of query in oracle
    Oracle.get_question(o, q)      							    //show the question
  entrypoint hasAnswer(  								
                       o : oracle(string, string),
                       q : oracle_query(string, string)) =
    switch(Oracle.get_answer(o, q))
      None    => false
      Some(_) => true
  entrypoint getAnswer(  
        o : oracle(string, string),  					        //oracle address
        q : oracle_query(string, string)) : option(string) =    //id of query in oracle
    Oracle.get_answer(o, q)  								   //show the answer
  stateful entrypoint contract_balance() = 
    Contract.balance
  entrypoint get_query(): oracle_query(string, string) =  
    switch(Map.lookup(Call.caller, state.id_query))
      None    => abort("No query")
      Some(x) => x
  entrypoint queryFee(o : oracle(string, string)) : int = 
    Oracle.query_fee(o)			
  payable stateful entrypoint createQuery(      					
                                          o    : oracle(string, string),    	//oracle address
                                          q    : string,      				//question
                                          qfee : int,         				//fee
                                          qttl : int,         				//last height oracle to post a reply
                                          rttl : int) : oracle_query(string, string) =  //time stays on the chain
    require(qfee =< Call.value, "insufficient value for qfee")    	//check the fee
    let query : oracle_query(string, string) = Oracle.query(o, q, qfee, RelativeTTL(qttl), RelativeTTL(rttl))
    let query_answer = get_answer(q)
    Oracle.respond(o, query, query_answer)
    put(state{id_query[Call.caller] = query })
    query
  entrypoint get_answer(stranswer : string) =  	//Check if there is an answer
    switch(Map.lookup(stranswer, state.question_answer))
      None    => abort("Not registered")
      Some(x) => x
  stateful entrypoint respond(  
            o    : oracle(string, string),  	   //oracle address
            q    : oracle_query(string, string),   //id of query in oracle
            r    : string) =  			           //reply
    Oracle.respond(o, q, r)        				   //reply
  entrypoint getCheck(
                    o : oracle(string, string)) =  	    //oracle address
    Oracle.check(o)  									//show the answer
  stateful entrypoint contract_creator() = 
    Contract.creator
`;

//Address of the  smart contract on the testnet of the aeternity blockchain
//Dirección del contrato inteligente en el testnet de la blockchain de aeternity
const contractAddress = 'ct_WMdMuoDod4tgT9VLBe1gjqi5j8kKy3AuYsJKNDPCCPEhudWf6';

//Create variable for client so it can be used in different functions
//Crear la variable cliente para las funciones
var client = null;

//Create a new global array for the messages
//Crea un array para los mensajes
var mensajes = [];

//Create a asynchronous read call for our smart contract
//Cree una llamada de lectura asincrónica para uso de funciones estáticas
async function callStatic(func, args) {

	//Create a new contract instance that we can interact with
	//Cree una nueva instancia de contrato con la que podamos interactuar
	const contract = await client.getContractInstance(contractSource, {contractAddress});

	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));

	//Make another call to decode the data received in first call
	//Realice otra llamada para decodificar los datos recibidos en la primera llamada
	const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
//Cree una llamada de escritura asincrónica para las funciones dinámicas
async function contractCall(func, args, value) {
	
	//Make a call to write smart contract func, with aeon value input
	//Realice una llamada para escribir una función de contrato inteligente, con una entrada de valor eón
	const contract = await client.getContractInstance(contractSource, {contractAddress});
	
	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

	return calledSet;
}

//Execute main function
//Ejecutar función principal
window.addEventListener('load', async () => {

	//Display the loader animation so the user knows that something is happening
	//Muestra la animación de cargando....
	$("#loader").show();

	//Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
	//Inicialice el objeto Aepp a través de aepp-sdk.browser.js, la aplicación base debe estar ejecutándose.
	client = await Ae.Aepp();

	//Hide loader animation
	//Oculta la animación de cargando
	$("#loader").hide();
});

//If someone clicks register Oracle,  execute queryFee
//Si alguien hace clic para registrar oráculo, ejecute registerOracle
$('#registerOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const qfee = ($('#qfee').val());
	const ttl = ($('#ttl').val());
	const consul = await contractCall('registerOracle', [qfee,ttl], 0);
	if(consul){document.getElementById('messages').value = 'registered';}
	$("#loader").hide();
});

//If someone clicks to consult Address Oracle,  execute get_oracle
//Si alguien hace clic para consultar Dirección del Oráculo, ejecute get_oracle
$('#addressOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const consul = await callStatic('get_oracle',[]);
	document.getElementById('messages').value = consul;
	document.getElementById('address').value = consul;
	$("#loader").hide();
});

//If someone clicks extend Oracle,  execute queryFee
//Si alguien hace clic para externder oráculo, ejecute extendOracle
$('#extendOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const address = ($('#messages').val());
	const qfee = ($('#qfee').val());
	const ttl = ($('#ttl').val());
	const consul = await contractCall('extendOracle', [address,ttl], 0);
	if(consul){document.getElementById('messages').value = 'extend';}
	$("#loader").hide();
});

//If someone clicks register question answer,  execute quest_answer
//Si alguien hace clic para registrar pregunta respuesta, ejecute quest_answer
$('#quest_answerBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const question = ($('#question').val());
	const answer = ($('#answer').val());
	const consul = await contractCall('quest_answer', [question,answer], 0);
	if(consul){document.getElementById('messages').value = 'registered';}
	$("#loader").hide();
});

//If someone clicks to consult Question,  execute getQuestion
//Si alguien hace clic para consultar pregunta, ejecute getQuestion
$('#getQuestionBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('getQuestion',[address,idquery]);
	document.getElementById('messages2').value = consul;
	$("#loader").hide();
});

//If someone clicks to check if you have an answer,  execute hasAnswer
//Si alguien hace clic para consultar si tiene respuesta, ejecute hasAnswer
$('#hasAnswerBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('hasAnswer',[address,idquery]);
	document.getElementById('messages2').value = consul;
	$("#loader").hide();
});

//If someone clicks to consult Answer,  execute getAnswer
//Si alguien hace clic para consultar respuesta, ejecute getAnswer
$('#getAnswerBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('getAnswer',[address,idquery]);
	document.getElementById('messages2').value = consul.Some[0];
	$("#loader").hide();
});

//If someone clicks to consult balance,  execute contract_balance
//Si alguien hace clic para consultar balance, ejecute contract_balance
$('#balanceBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const consul = await callStatic('contract_balance',[]);
	document.getElementById('messages3').value = consul;
	$("#loader").hide();
});

//If someone clicks to consult Fee Query,  execute queryFee
//Si alguien hace clic para consultar Fee Query, ejecute queryFee
$('#queryFeeBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const address = ($('#address').val());
	const consul = await callStatic('queryFee',[address]);
	document.getElementById('fee').value = consul;
	$("#loader").hide();
});

//If someone clicks to create Query,  execute createQuery
//Si alguien hace clic para crear query, ejecute createQuery
$('#createQueryBtn').click(async function(){
	$("#loader").show();
	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const address = ($('#address').val());
	const string = ($('#string').val()),
		  fee = ($('#fee').val());
	//Make the contract call to consult the oracle with the newly passed values
	//Llame al contrato para consultar el oráculo con los valores recibidos
	await contractCall('createQuery', [address,string,fee,1,1], fee);
	const consul = await callStatic('get_query',[]);
	document.getElementById('idquery').value = consul;
	const result = await callStatic('getAnswer',[address,consul]);
	document.getElementById('messages4').value = result.Some[0];
	$("#loader").hide();
});
