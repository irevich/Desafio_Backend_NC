const {Client} = require('pg');

class ApiUtils{

    static async getPostgreSQLConnection(){
        
        // USE LOCAL BD (PUT PASSWORD)

        const client = new Client({
            user: "postgres",
            password: "",
            host: "localhost",
            port: 5432,
            database: "ncchallengedb"
        });

        try{
            await client.connect();
            return client;
        }
        catch(e){
            console.error(`Failed to connect ${e}`)
        }


    }

}

module.exports = ApiUtils;