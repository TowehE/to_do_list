//import express
const express = require("express");
const bodyParser = require('body-parser');


//import confg
require("./dbConfig/toDoListConfg")

require("dotenv").config();

// import routers
const userRouter  = require("./router/userRouter");
const todolistRouter = require("./router/todoListRouters");


// create an app from express module
const app = express();

// use the express middleware
app.use(express.json());

// Middleware
app.use(bodyParser.json());


const port = process.env.port

app.get("/", (req,res)=>{
    res.send("You're welcome to the Todo List API")
})

app.use("/api/v1", userRouter)
app.use("/api/v1", todolistRouter)


//listen to  the port
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})


