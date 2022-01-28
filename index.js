const express = require('express');
const app = express();
const cors = require('cors');


app.use(express.json());
app.use(cors());

//IMPORTS

const ApiUtils = require('./apiUtils');
const PayableApi = require('./payable');
const StatusApi = require('./status');
const { status } = require('express/lib/response');


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

    //Validate
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
        console.log(e);
        return res.status(409).send(generateError("The payable already exists"));
    }


});

app.get("/api/status", async (req,res)=>{
    res.setHeader("content-type", "application/json");
    try{
        const results = await pgClient.query(`SELECT * FROM status`);
        res.send(results.rows);
    }
    catch(e){
        console.log(e);
    }
});

//PORT
const port = process.env.PORT || 3000 ;
app.listen(port, ()=>console.log(`Listening to port ${port} . . .`));