const express = require('express');
const app = express();
const cors = require('cors');


app.use(express.json());
app.use(cors());

//IMPORTS

const ApiUtils = require('./api_utils');
const PayableApi = require('./payable');
const StatusApi = require('./status');
const TransactionApi = require('./transaction');
const PayMethodApi = require('./pay_method');


//BD CONNECTION FUNCTION

let pgClient;

startDbConnection();

async function startDbConnection(){
    pgClient = await ApiUtils.getPostgreSQLConnection();
}


//ERROR MESSAGE FUNCTION

function generateError( string ){
    let answer ={};
    answer.message = string.replace(/"/g, '\'');
    return JSON.stringify(answer);
}

//API ENDPOINTS

 //Create a payable

app.post("/api/payables",async (req,res)=>{
    res.setHeader("content-type", "application/json");

    //Validate payable
    //If invalid, return 400 - Bad Request
    const {error} = PayableApi.validatePayable(req.body);

    if(error){
        //400 Bad Request
        return res.status(400).send(generateError(error.details[0].message));
    }

    //Check if status exists
    let status_id = await StatusApi.getIdByName(pgClient,req.body.status);

    //If the status_id returned is -1, the status in the body is invalid
    if(status_id===-1){
        //400 Bad Request
        return res.status(400).send(generateError("The status is invalid"));
    }

    //If all its ok, the payable is created

    try{
        await PayableApi.insertPayable(pgClient,req.body.barcode,req.body.description,req.body.due_date,req.body.payment,req.body.service,status_id);
        res.status(201); //Created
        res.send();
    }
    catch(e){
        return res.status(409).send(generateError("The payable already exists"));
    }


});

//Create a transaction

app.post("/api/transactions",async (req,res)=>{
    res.setHeader("content-type", "application/json");

    //Validate transaction
    //If invalid, return 400 - Bad Request
    const {error} = TransactionApi.validateTransaction(req.body,0);

    if(error){
        //400 Bad Request
        return res.status(400).send(generateError(error.details[0].message));
    }

    //Check if pay_method exists
    let pay_method_id = await PayMethodApi.getIdByName(pgClient,req.body.pay_method);

    //If the pay_method_id returned is -1, the pay_method in the body is invalid
    if(pay_method_id===-1){
        //400 Bad Request
        return res.status(400).send(generateError("The pay method is invalid"));
    }

    //Then check if the payable with the current barcode exists

    let payable = await PayableApi.getPayableByBarcode(pgClient,req.body.barcode);

    //If the payable is an empty object, the payable with that barcode does not exist, so a 404 error is returned
    if(Object.keys(payable).length===0){
        return res.status(404).send(generateError("The payable with the current barcode does not exist"));
    }

    //Also we have to check if the current payable has not been paid yet. Otherwise a 409 error is returned

    let statusId = await PayableApi.getPayableStatusByBarcode(pgClient,req.body.barcode);
    let paidId = await StatusApi.getIdByName(pgClient,'paid');

    if(statusId===paidId){
        return res.status(409).send(generateError("Payables can not be paid twice"));
    }

    //If it is pending, we have to check if the due date has not passed. Otherwise, a 400 error is returned
    if(Date.now()>Date.parse(payable.due_date)){
        return res.status(400).send(generateError("A payable whose due date has passed can not be paid"));
    }

    //Lastly, unless pay method is 'cash', we have to check if the card number is not undefined and if it is a number. Otherwise, a 400 error is returned
    //Also, if it is a number we have to check if its positive or not.
    let newPayMethodName = req.body.pay_method.trim().toLowerCase();
    let cardNumber = null;
    if(newPayMethodName!=='cash'){
        if(req.body.card_number===undefined){
            return res.status(400).send(generateError("The card number is required"));
        }
        if(isNaN(req.body.card_number)){
            return res.status(400).send(generateError("The card number must be a number of 16 digits"));
        }
        cardNumber = parseInt(req.body.card_number);
        if(cardNumber<0){
            return res.status(400).send(generateError("Card number must be positive"));
        }
    }

    //If all its ok, the transaction is created

    try{

        await TransactionApi.insertTransaction(pgClient,req.body.barcode,cardNumber,req.body.payment,Date.now(),pay_method_id);

        //Also, we have to change the payable state to 'paid'

        await PayableApi.changePayableStatus(pgClient,paidId);

        res.status(201); //Created
        res.send();
    }
    catch(e){
        return res.status(409).send(generateError("The transaction already exists"));
    }

});

 //List payables (Filter the pending ones and the service with query params)

app.get("/api/payables",async (req,res)=>{
    res.setHeader("content-type", "application/json");

    //First of all, we check if the query param status is defined and is valid

    let statusId = undefined; 

    if(req.query.status!==undefined){
        statusId = await StatusApi.getIdByName(pgClient,req.query.status);
        
        //If statusId is -1, then the status name passed in the query param is invalid, so a 400 error is returned
        if(statusId===-1){
            return res.status(400).send(generateError("The status is invalid"));
        }
    }

    //Then, we ask for the respective payables and we return them in the response

    const payables = await PayableApi.getPayablesByStatusAndByService(pgClient,statusId,req.query.service);

    res.send(payables);

});

 //List transactions between dates (Query params are required for this endpoint)

app.get("/api/transactions",async (req,res)=>{
    res.setHeader("content-type", "application/json");
    
    //First of all, we validate the query params
    const {error} = TransactionApi.validateTransaction(req.query,1);

    if(error){
        //400 Bad Request
        return res.status(400).send(generateError(error.details[0].message));
    }

    //Then we have to check that the final date comes after the start date
    if(Date.parse(req.query.finalDate)<=Date.parse(req.query.startDate)){
        return res.status(400).send(generateError("The final date should come after the start date"));
    }

    //Then, we check if both dates are in format YYYY-MM-DD. If anyone of these does not fulfil this format, a 400 error is returned
    let validStartDate = TransactionApi.vaidateTransactionFormatDate(req.query.startDate);
    let validFinalDate = TransactionApi.vaidateTransactionFormatDate(req.query.finalDate);

    if(!validStartDate || !validFinalDate){
        return res.status(400).send(generateError("Start and final dates must be in format YYYY-MM-DDDD"));
    }

    //Then, we have to check that the final date is not after the actual date. Otherwise a 400 error is returned
    if(Date.now()<Date.parse(req.query.finalDate)){
        return res.status(400).send(generateError("The final date should not come after the current date"));
    }
    
    //Finally, we ask for the transactions that fulfil this requirement

    let startDate = new Date(req.query.startDate);
    let finalDate = new Date(req.query.finalDate);

    //Removing time from the dates
    let stringStartDate = startDate.toISOString().split("T")[0];
    let stringFinalDate = finalDate.toISOString().split("T")[0];

    const transactions = await TransactionApi.getTransactionsBetweenDates(pgClient,stringStartDate,stringFinalDate);
    res.send(transactions);
    
});


//PORT
const port = process.env.PORT || 3000 ;
app.listen(port, ()=>console.log(`Listening to port ${port} . . .`));