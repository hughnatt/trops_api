# TROPS API Server

## Introduction
This is the backend API for TROPS Application and TROPS Admin Panel written in Javascript and based on [Express](https://expressjs.com) framework.

The API covers the following services:
- User authentication
- Admin authentication
- Advert fetch/creation/modification
- Category fetch/creation/modification

Compatible with any [MongoDB](https://www.mongodb.com) database.   
See the [SETUP ENVIRONMENT](#setup-environment) section for how to connect with database.  

Connection to the database is done using [Mongoose](https://mongoosejs.com/).   
Documentation is available [here](https://mongoosejs.com/docs/guide.html).


You can get some information about how authentication is done [here](https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122)

## Swagger Documentation
The [swagger.yml]() file contains a Swagger 2.0 compatible API description.
Copy the content of the file in [Swagger online editor](https://editor.swagger.io/) to get a detailed overview of all of the endpoints.


## How to use

#### SETUP ENVIRONMENT  
Before anything else, you need to create a .env file at the root of the cloned repository which must contain the following environment variables

- _MONGODB\_URL_ = The URL to reach the mongodb database. Can also be localhost if you're using the API on the same server where the database is located
- _JWT\_KEY_ and _JWT\_ADMIN\_KEY_ = Secret for JWT authentication. 
- _PORT_ = 80
- _ANALYSED\_PARTITION_ = The partition where all the images will be stored
- _DOMAIN_ = The base domain name for the API. This is used to return the URL for an uploaded image.

For example, a sample _.env_ file can be 

    MONGODB_URL=mongodb+srv://admin:password@cluster0-xxxxx.mongodb.net
    JWT\_KEY=user-jwt-key
    JWT\_ADMIN_KEY=admin-jwt-key
    PORT=80
    ANALYSED_PARTITION=/dev/sda1
    DOMAIN=https://api.trops.space


#### INSTALL NODE AND PACKAGES

You need NodeJS and NPM installed on your machine.
Check if you have them using the following commands (output should be the software version)
    
    node --version
    npm --version

Once everything is ready, install the dependencies for this project

    npm install

#### START THE API SERVER

###### DEVELOPMENT


Use any of the following equivalent command to start the API 
    
    npm start
    npm run start

This will run the _start_ script from [package.json]() which will source the environment from the .env file and start the server.
NB: we are running the server with _nodemon_ which means it will automatically restart on file changes.


###### PRODUCTION

There is no script to start the API in production mode. Use the development script instead

#### DOCKER

A simple node based [Dockerfile]() is available for this server. Please refer to the docker documentation for how to use it.


## Micro-services

Each router file can be separated in order to provide a micro-service architecture for the API.
