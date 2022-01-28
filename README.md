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
            -[Parameters](#parameters-post-api-payables)
            -[Return values](#return-values-post-api-payables)
        - [POST /api/transactions](#post-api-transactions)
            -[Parameters](#parameters-post-api-transactions)
            -[Return values](#return-values-post-api-transactions)
        - [GET /api/payables](#get-api-payables)
            -[Parameters](#parameters-get-api-payables)
            -[Return values](#return-values-get-api-payables)
        - [GET /api/transactions](#get-api-transactions)
            -[Parameters](#parameters-get-api-transactions)
            -[Return values](#return-values-get-api-transactions)
    - [Postman collection for executing endpoints](#postman-collection-for-executing-endpoints)

## Persistency

### Database used and previous considerations

The database used was PostgreSQL

To execute the project, first of all you must have Postgres installed locally, and there create a database called "ncChallengeDB", where all the data that the API is going to manage will be storaged. You can do it by executing these commands on a terminal (Linux) or CMD (Windows) :
 - psql -U postgres -h localhost (Then you put your password) (If your user is not "postgres", you have to put your user)
 - create database ncChallengeDB;
 - \l ( to check if it was created succesfully)

After you have done that, you will have to go to the js file "api_utils", and in the function "getPostgreSQLConnection()", who is responsible of connecting the API with the database that we have just created, you have to put your password, your user, and in case you run postgres in a different port than 5432, you have to change that to.

After doing that, we are ready for the next step that is creating the tables and the default data of the database.

### Database's tables creation

First of all, you must have node installed to go on with the execution of the project.

If you do, in the terminal of the IDE where you have opened the project, and in the root folder of these one, execute the following commands:
 - cd .\import_tables_db\
 - npm install
 - node .\import_postgres.js

This commands will create the tables in database, and store basic information (like pay methods or payable's status). To see the tables and their fields more in detail, you can go to the file "create_tables_postgres.sql" in the "import_tables_db" folder. The "import_postgres.js" script basically executes that SQL file.

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

Having all the things mentionated in mind, after running the node commands explaines previously, you will see in the console a message that says "Listening to port PORT . . .", where PORT=3000 or the one defined as a enviroment variable like I have just said. This message indicates that the API is in execution and ready to use.

### Endpoints

#### POST /api/payables

##### Parameters

##### Return values

#### POST /api/transactions

##### Parameters

##### Return values

#### GET /api/payables

##### Parameters

##### Return values

#### GET /api/transactions

##### Parameters

##### Return values







        
