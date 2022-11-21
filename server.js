/************************************************************************* 
* WEB322– Assignment 5
* I declare that this assignment is my own work in accordance with Seneca 
* Academic Policy. No part of this assignment has been copied manually or 
* electronically from any other source (including 3rd party web sites) or 
* distributed to other students. 
*
* Name: __Jiaheng Wang__ Student ID: _180562217_ Date: _Nov 21, 2022_ 
* 
* Online (Heroku Cyclic) Link:
* 
* 
*************************************************************************/
const express = require("express");
const app = express();

const path = require("path");
const multer = require("multer");
const fs = require("fs");
const exphbs = require('express-handlebars');
const data_service = require("./data-service.js");
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next) {
    let route = req.baseUrl+req.path;
    app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
    next();
});

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});
  
const upload = multer({ storage: storage });

app.engine('.hbs', exphbs.engine({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
            },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }           
    } 
}));

app.set('view engine', '.hbs');

// setup a 'route' to listen on the default url path (http://localhost:8080)
app.get("/", (req,res) =>{
    res.render("home");
});

app.get('/home', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"));
});

// setup another route to listen on /about
app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/employees/add',(req,res) => {
    data_service.getDepartments()
    .then(data => res.render("addEmployee", {departments: data}))
    .catch(err => res.render("addEmployee", {departments: []}));
});

app.post("/employees/add", (req,res) => {
    data_service.addEmployee(req.body)
    .then(() => {
        res.redirect("/employees");
    })
    .catch((err) => {
        res.status(500).send("Unable to Add Employee");
    });
});

app.get('/employees/delete/:empNum', (req,res) => {
    data_service.deleteEmployeeByNum(req.params.empNum)
    .then(res.redirect("/employees"))
    .catch(err => res.status(500).send("Unable to Remove Employee / Employee not found"))
});

app.post('/employee/update', (req, res) => {
    data_service.updateEmployee(req.body)
    .then(() => {
        res.redirect("/employees");
    })
    .catch((err) => {
        res.status(500).send("Unable to Update Employee");
    });
});

app.get("/images/add", (req,res) =>{
    res.render("addImage");
});

// Adding additional routes
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", function(req, res) {
    fs.readdir("./public/images/uploaded", function(err, items){
        res.render("images", { data: items });
    });
});

app.get("/employees", (req,res) =>{
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {    
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { "message": "no results" })
            }
        }).catch((err) => { 
            res.render("employees", { "message": "no results" }) 
        })    
    }
    else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { "message": "no results" })
            }
        }).catch((err) => { 
            res.render("employees", { "message": "no results" }) 
        })
    }
    else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { "message": "no results" })
            }
        }).catch((err) => { 
            res.render("employees", { "message": "no results" }) 
        })
    }
    else {
        data_service.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            } 
            else {
                res.render("employees", { "message": "no results" })
            }
        }).catch((err) => {
            res.render("employees", { "message": "no results" })
        });
    }
});

app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
    
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

app.get("/managers", (req,res) => {
    data_service.getManagers()
    .then(data => res.render("employees", {employees: data}))
    .catch(err => res.status(404).send("managers data not found"))
});

app.get("/departments", (req,res) => {
    data_service.getDepartments().then((data) => {
        if (data.length > 0) {
            res.render("departments", { departments: data })
        }
        else {
            res.render("departments", { "message": "no results" })
        }
    }).catch((err) => { 
        res.render("departments", { "message": "no results" }) 
    })
});

app.get("/departments/add", (req,res) => {
    res.render("addDepartment");
});

app.post("/departments/add", (req,res) => {
    data_service.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Add department");
    })
});

app.post("/department/update", (req,res) => {
    data_service.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update Department");
    })
});

app.get("/department/:departmentId", (req, res) =>{
    data_service.getDepartmentById(req.params.departmentId)
    .then((data) => {res.render("department", { department: data })})
    .catch(err => res.status(404).send("Department Not Found"))
});

app.use((req, res) => {
    res.status(404).send("Error 404: Page Not Found.");
});

data_service.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("Error: " + err);
});