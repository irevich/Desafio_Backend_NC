const Joi = require('joi');

class TransactionApi{

    static async getTransactionsBetweenDates(client,start_date,final_date){
        try{
            let results = await client.query(`SELECT creation_date, sum(payment) as total_payment, count(barcode) as transactions_count FROM transaction where creation_date
            between '${start_date}' AND '${final_date}' GROUP BY creation_date ORDER BY creation_date DESC;`);

            //We remove the time of the different creation dates

            results.rows.forEach(transaction=>{
                transaction.creation_date = transaction.creation_date.toISOString().replace(/T.+/, '') ; 
            });
            return results.rows;

        }
        catch(e){
            console.log(e);
        }
    }

    static async insertTransaction(client,barcode,card_number,payment,creation_date_millis,pay_method){
        try{
            await client.query(`insert into transaction(barcode, card_number, payment, creation_date, pay_method) values('${barcode}',${card_number},${payment},to_timestamp(${creation_date_millis}/1000.0),${pay_method})`);
        }
        catch(e){
            throw e;
        }
    }

    static vaidateTransactionFormatDate(dateString){
        let formatRegEx = /^\d{4}-\d{2}-\d{2}$/;
        return dateString.match(formatRegEx);
    }

    //Validate transaction
    //0- POST /api/transactions
    //1- GET /api/transactions
    static validateTransaction(transaction,index){

        let schema;

        switch(index){
            case 0:
                schema = {
                    barcode : Joi.string().required().max(13),
                    card_number : Joi.string().max(16).min(16),
                    payment : Joi.number().positive().required(),
                    pay_method : Joi.string().required()
                };
                break;
            case 1:
                schema = {
                    startDate : Joi.date().required(),
                    finalDate : Joi.date().required()
                }
        }

        return Joi.validate(transaction,schema);
    }

}

module.exports = TransactionApi;