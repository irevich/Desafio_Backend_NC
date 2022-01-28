const Joi = require('joi');

class PayableApi{
    static async insertPayable(client,barcode, description, due_date, payment, service, status){
        try{
            let millis = Date.parse(`'${due_date}`);
            await client.query(`insert into payable(barcode, description, due_date, payment, service, status) values('${barcode}','${description}',to_timestamp(${millis}/1000.0),${payment},'${service}',${status})`);
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