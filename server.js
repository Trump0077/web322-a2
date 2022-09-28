/************************************************************************* 
* WEB322– Assignment 2 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students. 
*
* Name: __Jiaheng Wang__ Student ID: _180562217_ Date: _September 28, 2022_ 
* 
* Your app’s URL (from Cyclic) :_______________________________________________
* 
*************************************************************************/
var express = require("express");
var app = express();

var path = require("path");
var data_service = require("./data-service.js")
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost:8080)
app.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", (req,res) =>{
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Adding additional routes
app.get("/employees", (req,res) =>{
    data_service.getAllEmployees().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.json({ message: err });
    });
});


app.get("/managers", (req,res)=>{
    data_service.getManagers().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.json({ message: err });
    });
});

app.get("/departments", (req,res)=>{
    data_service.getDepartments().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.json({ message: err });
    });
});

app.use((req, res) => {
    res.status(404).send("Error 404: Page Not Found.");
});

data_service.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("Error: " + err);
});