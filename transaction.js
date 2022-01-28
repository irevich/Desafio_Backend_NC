const Joi = require('joi');

class TransactionApi{

    static async insertTransaction(client,barcode,card_number,payment,creation_date_millis,pay_method){
        try{
            await client.query(`insert into transaction(barcode, card_number, payment, creation_date, pay_method) values('${barcode}',${card_number},${payment},to_timestamp(${creation_date_millis}/1000.0),${pay_method})`);
        }
        catch(e){
            throw e;
        }
    }

    //Validate transaction
    static validateTransaction(transaction){
        let schema = {
            barcode : Joi.string().required().max(13),
            card_number : Joi.string().max(16).min(16),
            payment : Joi.number().positive().required(),
            pay_method : Joi.string().required()
        };

        return Joi.validate(transaction,schema);
    }
}

module.exports = TransactionApi;