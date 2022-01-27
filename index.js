const express = require('express');
const app = express();
const cors = require('cors');


app.use(express.json());
app.use(cors());

//IMPORTS

const ApiUtils = require('./apiUtils');


//BD CONNECTION FUNCTION

let pgClient;

startDbConnection();

async function startDbConnection(){
    pgClient = await ApiUtils.getPostgreSQLConnection();
}

//ENDPOINTS

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