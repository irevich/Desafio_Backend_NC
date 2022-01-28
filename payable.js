const Joi = require('joi');

class PayableApi{

    static async getPayablesByStatusAndByService(client,status_id,service){
        let query = "SELECT * FROM payable ";
        let paramsQuantity = 0;
        if(status_id!==undefined){
            query = query.concat(`WHERE status = ${status_id} `);
            paramsQuantity++;
        }
        if(service!==undefined){
            if(paramsQuantity===0){
                query = query.concat(`WHERE lower(service) = '${service.trim().toLowerCase()}' `); 
            }
            else{
                query = query.concat(`AND lower(service) = '${service.trim().toLowerCase()}' `); 
            }
        }
        //We order the payables from the closest due_date to the farthest
        query = query.concat("ORDER BY due_date");

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }
    }
    
    static async getPayableByBarcode(client,barcode){
        try{
            const results = await client.query(`SELECT * FROM payable WHERE barcode = '${barcode}'`);
            if(results.rows.length===0){
                return {};
            }
            return results.rows[0];
        }
        catch(e){
            console.log(e);
        }
    }

    static async getPayableStatusByBarcode(client,barcode){
        try{
            const results = await client.query(`SELECT status FROM payable WHERE barcode = '${barcode}'`);
            return results.rows[0].status;
        }
        catch(e){
            console.log(e);
        }
    }
    
    static async insertPayable(client,barcode, description, due_date, payment, service, status){
        try{
            let millis = Date.parse(`'${due_date}`);
            await client.query(`insert into payable(barcode, description, due_date, payment, service, status) values('${barcode}','${description}',to_timestamp(${millis}/1000.0),${payment},'${service}',${status})`);
        }
        catch(e){
            throw e;
        }
    }

    static async changePayableStatus(client,status_id){
        try{
            await client.query(`update payable set status=${status_id}`);
        }
        catch(e){
            throw e;
        }
    }

    static validatePayable(payable){
        let schema = {
            barcode : Joi.string().required().max(13),
            description: Joi.string().required().max(100),
            due_date : Joi.date().required().min("now"),
            payment : Joi.number().positive().required(),
            service : Joi.string().required(),
            status : Joi.string().required()
        };

        return Joi.validate(payable,schema);
    }
}


module.exports = PayableApi;