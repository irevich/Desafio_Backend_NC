class StatusApi{
    static async getIdByName(client,name){
       
        //Take away beginning and final spaces,and convert to lowercase
        let newStatusName = name.trim().toLowerCase();
        try{
            const results = await client.query(`SELECT status_id FROM status WHERE lower(status_name)='${newStatusName}'`);
            if(results.rows.length===0){
                return -1;
            }
            return results.rows[0].status_id;
        }
        catch(e){
            console.log(e);
        }
    }
}

module.exports = StatusApi;