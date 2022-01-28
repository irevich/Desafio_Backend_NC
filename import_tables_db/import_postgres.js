const ApiUtils = require('../api_utils');
const fs = require('fs');

let pgClient;

initImport();

function initImport(){
    (async() => {
        await importToPostgres().then(async() =>{
            pgClient.end();
        })
    })();
}

async function importToPostgres(){

    var createTableQueries = fs.readFileSync('create_tables_postgres.sql').toString();
    pgClient = await ApiUtils.getPostgreSQLConnection();

    console.log('Connected to PostgreSQL database');

    await pgClient.query(createTableQueries)
    .catch((e) => {
        console.log(`Error on creating tables: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    console.log('Tables created successfully');

}