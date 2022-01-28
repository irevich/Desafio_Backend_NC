class PayMethodApi{
    static async getIdByName(client,name){
       
        //Take away beginning and final spaces,and convert to lowercase
        let newPayMethodName = name.trim().toLowerCase();
        try{
            const results = await client.query(`SELECT pay_method_id FROM pay_method WHERE lower(pay_method_name)='${newPayMethodName}'`);
            if(results.rows.length===0){
                return -1;
            }
            return results.rows[0].pay_method_id;
        }
        catch(e){
            console.log(e);
        }
    }
}

module.exports = PayMethodApi;