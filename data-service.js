const fs = require('fs');
const path = require('path');

var employees = [];
var departments = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err) reject("Failure to read file employees.json!");
            employees = JSON.parse(data);
        });
        fs.readFile('./data/departments.json',(err,data)=>{
            if (err) reject("Failure to read file departments.json!");
            departments = JSON.parse(data);
        });
    } catch (ex) {
      console.log("unable to read file");
      reject("unable to read file");
    }
    resolve();
  });
}

function getAllEmployees() {
    return new Promise((resolve, reject) => {
        if (employees.length === 0) {
            reject("no results returned");
        } else {
            resolve(employees.filter(() => { 
                return true; 
            }));
        }
    });
}

function getManagers() {
    return new Promise((resolve, reject) => {
        const managers = employees.filter((employee) => {
            return employee.isManager === true;
        });
        if (managers.length > 0) {
            resolve(managers);
        } else {
            reject("no results returned");
        }
    });
}

function getDepartments() {
    return new Promise((resolve, reject) => {
        if (departments.length === 0) {
            reject("No results found");
        } else {
            resolve(departments.filter(() => { 
                return true; 
            }));
        }
    });
}

module.exports = {
    initialize,
    getAllEmployees,
    getManagers,
    getDepartments
}