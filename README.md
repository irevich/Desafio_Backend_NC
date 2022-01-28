# Desafio_Backend_NC

## Autor

- [Revich, Igal Leonel](https://github.com/irevich)

## Index
- [Autor](#autor)
- [Index](#index)
- [Persistency](#persistency)
    - [Database used and previous considerations](#database-used-and-previous-considerations)
    - [Database's tables creation](#database-creation)
- [Backend(API)](#backend(api))
    - [Execution](#execution)
    - [Endpoints](#endpoints)
        - [POST /api/payables](#post-api-payables)
            -[Goal](#goal-post-api-payables)
            -[Parameters](#parameters-post-api-payables)
            -[Answer codes](#answer-codes-post-api-payables)
            -[Example](#example-post-api-payables)
        - [POST /api/transactions](#post-api-transactions)
            -[Goal](#goal-post-api-transactions)
            -[Parameters](#parameters-post-api-transactions)
            -[Answer codes](#answer-codes-post-api-transactions)
            -[Example](#example-post-api-transactions)
        - [GET /api/payables](#get-api-payables)
            -[Goal](#goal-get-api-payables)
            -[Parameters](#parameters-get-api-payables)
            -[Answer codes](#answer-codes-get-api-payables)
            -[Example](#example-get-api-payables)
        - [GET /api/transactions](#get-api-transactions)
            -[Goal](#goal-get-api-transactions)
            -[Parameters](#parameters-get-api-transactions)
            -[Answer codes](#answer-codes-get-api-transactions)
            -[Example](#example-get-api-transactions)
    - [Postman collection for executing endpoints](#postman-collection-for-executing-endpoints)

## Persistency

### Database used and previous considerations

The database used was PostgreSQL

To execute the project, first of all you must have Postgres installed locally, and there create a database called "ncChallengeDB", where all the data that the API is going to manage will be storaged. You can do it by executing these commands on a terminal (Linux) or CMD (Windows) :
 - psql -U postgres -h localhost (Then you put your password) (If your user is not "postgres", you have to put your user)
 - create database ncChallengeDB;
 - \l ( to check if it was created succesfully)

After you have done that, you will have to go to the js file "api_utils", and in the function "getPostgreSQLConnection()", who is responsible of connecting the API with the database that we have just created, you have to put your password, your user, and in case you run postgres in a different port than 5432, you have to change that too.

After doing that, we are ready for the next step that is creating the tables and the default data of the database.

### Database's tables creation

First of all, you must have node installed to go on with the execution of the project.

If you do, in the terminal of the IDE where you have opened the project, and in the root folder of these one, execute the following commands:
 - cd .\import_tables_db\
 - npm install
 - node .\import_postgres.js

This commands will create the tables in database, and store basic information (like pay methods or payable's status). To see the tables and their fields more in detail, you can go to the file "create_tables_postgres.sql" in the "import_tables_db" folder. The "import_postgres.js" script basically executes that SQL file.

Once you have executed this commands, you will see in the terminal the following messages :
- "Connected to PostgreSQL database"
- "Tables created successfully"

These mean that the operation was succesful

Having this done, we have our database ready to use, so now we have to execute our API

## Backend(API)

The API is made with Node.js. Now we are going through the execution of this one, and the different endpoints that it contains

### Execution

To execute the API in the terminal of the IDE and in the root folder of the project you have to run these commands :
- npm install
- node index.js

Once you have done that, the API will be available at port 3000 by default, or in the port where it was defined by terminal the enviroment variable "PORT". For example, if you want to execute the API on http://localhost:5000, run one of these two commands, depending of the operating system that the computer where you are going to execute the API has :
- $env:PORT=5000 (Windows)
- export PORT=5000 (Linux/Mac)

If you do not define that enviroment variable, by default the API runs on http://localhost:3000.

Having all the things mentionated in mind, after running the node commands explained previously, you will see in the console a message that says "Listening to port PORT . . .", where PORT=3000 or the one defined as a enviroment variable like I have just said. This message indicates that the API is in execution and ready to use.

### Endpoints

#### POST /api/payables

##### Goal

Create a payable

##### Parameters

Receives this data in the body as a JSON object mandatorily:

- barcode : A string of 13 characters maximum. Represents the barcode of the payable that is created
- description : A string of 100 characters maximum. Represents the description of the service that the payable pays.
- due_date : A date in the format "yyyy-mm-dd", that represents the last day for paying the payable. It must be after the current date.
- payment : A positive float. Represents the amount that is required to pay in the payable.
- service : A string that represents the service that is payed in the payable.
- status : A string that represents the status of the payable. The basic ones are "pending" and "paid".

##### Answer codes

The possible answer codes are :
- 201 : In case the payable was created succesfully
- 400 : In case any of these scenarios has happened
    - Any of the required parameters has been omited, or the data type o length of anyone is wrong (for example a description with a length longer than 100 characters or passing this one as a integer)
    - Passing an invalid status
- 409 : In case you want to create a payable with an existing barcode

##### Example

- Body : 
{
    "barcode" : "123ABC",
    "description" : "Edesur",
    "due_date" : "2022-02-13",
    "payment" : 50000,
    "service" : "Light",
    "status" : "Pending"
}
- Answer code : 
    201 (created)

#### POST /api/transactions

##### Goal

Create a transaction

##### Parameters

Receive this data in the body as a JSON object mandatorily:

- barcode : A string of 13 characters maximum. Represents the barcode of the payable that is being payed in the transaction.
- payment : A positive float. Represents the amount that is required to pay in the transaction.
- pay_method : A string that represents the pay method that is being used to pay the transaction. The basic ones are "debit_card","credit_card" and "cash"

The card number is not a mandatory field, but in case the pay method is not cash, this will be required in the body in case it is
not present. So if the pay method is "debit_card" or "credit_card", you must put this field to :

- card_number : A string of 16 characters that represents the number of the credit card. It is important to keep in mind that despite being a string, it must represent an integer and positive number, so in case this field is for example "abcdabcdabcdabcd" or "-123456789876543", an error code will be returned.

The creation date is not passed as a parameter, because is always the current date.

##### Answer codes

The possible answer codes are :
- 201 : In case the transaction was created succesfully
- 400 : In case any of these scenarios has happened
    - Any of the required parameters has been omited, or the data type o length of anyone is wrong (for example a card number with a length different than 16 characters or passing the barcode as a integer)
    - Passing an invalid pay method
    - Trying to pay a payable whose due_date has passed
    - If the pay method was not cash
        - The card number was ommited
        - The card number is not a positive number
- 404 : In case you want to pay a payable which barcode does not exist
- 409 : In case you want to pay a payable that has been payed previously

##### Example

Assuming there is a payable with barcode "123ABC" with due date "2022-03-27"

- Body : 
{
    "barcode" : "123ABC",
    "payment" : 9000,
    "pay_method" : "credit_card",
    "card_number" : "1123456789098765"
}
- Answer code : 
    201 (created)

#### GET /api/payables

##### Goal

List all the payables, filtering by status and service, and returning the service (in case it was not filtered by this category),
the due date, the payment and the barcode

##### Parameters

This endpoint has two query params (neither of them are mandatory, in case of not using them, it will return all the payables). These are :

- status : The status of the payables you want to list
- service : The service of the payables you want to list

##### Answer codes

The possible answer codes are :
- 200 : In case the respective payables were listed succesfully (Have in mind that this answer code does not mean necessarily that a list of payables is returned. For example, if you want all the payables with the service "Light", and there is none of them with that service, the answer code of the API will be 200 because it has made the operation successfully, but an empty list will be returned )
- 400 : In case any of these scenarios has happened
    - The status is invalid

##### Example

Assuming there is only one pending payable with barcode "123ABCD", with service "Light", due date "2022-02-13" and a payment of 50000, and the API is running by default in port 3000.

- To list all the pending payables
    - Endpoint : http://localhost:3000/api/payables?status=pending
        - Query params
            - "status" : pending
            - "service" : undefined
    - Answer code : 200 (OK)
    - Return value :
        [
            {
                "due_date": "2022-02-13",
                "payment": 50000,
                "barcode": "123ABCD",
                "service": "Light"
            }
        ]
- To list all the pending payables with service "Light"
    - Endpoint : http://localhost:3000/api/payables?status=pending&service=Light
        - Query params
            - "status" : pending
            - "service" : Light
    - Answer code : 200 (OK)
    - Return value :
        [
            {
                "due_date": "2022-02-13",
                "payment": 50000,
                "barcode": "123ABCD"
            }
        ]


#### GET /api/transactions

##### Goal

Return the transactions made between two dates, showing the following information for each group of payables:
    - Creation date
    - Total payment
    - Count
They are ordered from the recent creation date to the oldest

##### Parameters

This endpoint has two query params, both mandatory. These are :

- startDate : The starting date with format "YYYY-MM-DD"
- finalDate : The final date with format "YYYY-MM-DD"

##### Answer codes

The possible answer codes are :
- 200 : In case the respective transactions were listed succesfully (Have in mind that this answer code does not mean necessarily that a list of transactions is returned. For example, if there is not any transaction that has been made between the dates you have put as parameters, the answer code will be 200 because the operation was made successfully, but an empty list will be returned )
- 400 : In case any of these scenarios has happened
    - The query params has been ommited or they are not dates (for example, passing startDate as "abc")
    - The start date is equal or after the final date
    - Any of the dates does not fulfil the format "YYYY-MM-DD"
    - The final date is after the current date

##### Example

Assuming you have the different transactions separated by creation date :

- 2022-01-28
    - Transaction #1
        - barcode : "1245ABC"
        - payment : 9000
    - Transaction #2
        - barcode : "1245CDE"
        - payment : 9000
    - Transaction #3
        - barcode : "1245FGH"
        - payment : 9000
    - Transaction #4
        - barcode : "1245IJK"
        - payment : 9000
- 2000-02-03
    - Transaction #5
        - barcode : "ABC123"
        - payment : 10000

And also assuming that the API is running by default in port 3000

- To list the transactions between "1999-02-03" and "2022-03-04"
    - Endpoint : http://localhost:3000/api/transactions?startDate=1999-02-03&finalDate=2022-03-04
        - Query params
            - "startDate" : 1999-02-03
            - "finalDate" : 2022-03-04
    - Answer code : 200 (OK)
    - Return value :
        [
            {
                "creation_date": "2022-01-28",
                "total_payment": 36000,
                "transactions_count": "4"
            },
            {
                "creation_date": "2000-02-03",
                "total_payment": 10000,
                "transactions_count": "1"
            }
        ]

### Postman collection for executing endpoints

Finally, to execute this endpoints (although it can be done by terminal using curl), I have created a collection in postman to do this. It has the 4 endpoints with an example body (in case of the post methods), and the query params empty and ready to complete (in case of the get methods)

If you have the Postman desktop application, go to :

File --> import --> Link , and then on the text field put the following link :

https://www.getpostman.com/collections/4aede3f6709d5a0cb870

Putting "Continue", it will show a message that you want to import the collection "NC Backend Challenge API" (which is correct), so to finalize the operation you must click on "import"

In case you do not have the desktop application, you can use the Google Chrome extension. In that case, having downloaded previously that extension, it is enough to place the previous link in the browser


Keep in mind that all the endpoints have the default port (3000), but if the API is executed on a different one, this must be modified in all the endpoints of the collection.







        
