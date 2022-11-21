const Sequelize = require('sequelize');

var sequelize = new Sequelize('wmmnewyg', 'wmmnewyg', 'l2Wi3V_GP5earUExO35ddfvRoDvBM5gw', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
    query:{raw: true} // update here, you. Need this
});

sequelize.authenticate().then(()=> console.log('Connection success.')) 
.catch((err)=>console.log("Unable to connect to DB.", err));

const Employee = sequelize.define('employee', {
    employeeNum: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    firstName:Sequelize.STRING,
    lastName:Sequelize.STRING,
    email:Sequelize.STRING,
    SSN:Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addressCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    maritalStatus:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    department:Sequelize.INTEGER,
    hireDate:Sequelize.STRING
});

const Department = sequelize.define('department', {
    departmentId: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    departmentName:Sequelize.STRING
});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(resolve())
        .catch(reject('unable to sync the database'));
    })
}

function getAllEmployees() {
    return new Promise ((resolve,reject) => {
        Employee.findAll()
        .then(resolve(Employee.findAll()))
        .catch(reject('no results returned'));      
    })
}

function getEmployeesByStatus (status) {
    return new Promise((resolve,reject) => {
        Employee.findAll({
            where:{
                status: status
            }
        })
        .then(resolve(Employee.findAll({ where: { status: status }})))
        .catch(reject('no results returned'))
    })
}

function getEmployeesByDepartment (department) {
    return new Promise ((resolve,reject) => {
        Employee.findAll({
            where: {
                department:department
            }
        })
        .then(resolve(Employee.findAll({ where: { department:department }})))
        .catch(reject('no results returned'))
    })
}

function getEmployeesByManager (manager) {
    return new Promise ((resolve,reject) => {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        })
        .then(resolve(Employee.findAll({ where: { employeeManagerNum: manager }})))
        .catch(reject('no results returned'))
    })
}

function getEmployeeByNum (num) {
    return new Promise((resolve,reject) => {
        Employee.findAll({
            where: {
                employeeNum:num
            }
        })
        .then(resolve(Employee.findAll({ where: { employeeNum:num }})))
        .catch('no results returned')
    })
}

function getManagers() {
    return new Promise ((resolve, reject) => {
        Employee.findAll({
            where: {
                isManager:true
            }
        })
        .then(resolve(Employee.findAll({ where: { isManager: true }})))
        .catch('no results returned')
    })
}

function getDepartments() {
    return new Promise((resolve,reject) => {
        Department.findAll()
        .then(resolve(Department.findAll()))
        .catch(reject('no results returned'));    
    })
}

function addEmployee (employeeData) {
    return new Promise((resolve,reject) => {
        employeeData.isManager = employeeData.isManager ? true : false;
        for (var i in employeeData) {
            if (employeeData[i] == "") { 
                employeeData[i] = null;
            }
        }

        Employee.create(employeeData)
        .then(resolve(Employee.findAll()))
        .catch(reject('unable to create employee'))
    })
};

function updateEmployee (employeeData) {
    return new Promise((resolve,reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;    
        for (var i in employeeData) {
            if (employeeData[i] == "") { 
                employeeData[i] = null; 
            }
        }

        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        })
        .then(resolve(Employee.update(employeeData, { 
            where: { 
                employeeNum: employeeData.employeeNum 
            }
        })))
        .catch(reject('unable to update employee'))
    })   
};

function addDepartment (departmentData) {
    return new Promise((resolve,reject) => {
        for (var i in departmentData) {
            if (departmentData[i] == "") { 
                departmentData[i] = null; 
            }
        }

        Department.create(departmentData)
        .then(resolve(Department.findAll()))
        .catch(reject('unable to create department'))
    })
};

function updateDepartment (departmentData) {
    return new Promise((resolve,reject) => {
        for (var i in departmentData) {
            if (departmentData[i] == "") {
                departmentData[i] = null; 
            }
        }

        Department.update(departmentData, {
            where: { 
                departmentId: departmentData.departmentId
            }
        })
        .then(resolve(Department.update(departmentData, {
            where: { 
                departmentId:departmentData.departmentId 
            }
        })))
        .catch(reject('unable to update department'))
    })
};

function getDepartmentById (id) {
    return new Promise((resolve,reject) => {
        Department.findAll({ 
            where: {
                departmentId: id
            }
        })
        .then(resolve(Department.findAll({ 
            where: { 
                departmentId: id 
            }
        })))
        .catch(reject('no results returned'))
    })
};

function deleteEmployeeByNum (empNum) {
    return new Promise((resolve,reject) => {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        })
        .then(resolve(Employee.destroy({ 
            where: { 
                employeeNum: empNum 
            } 
        })))
        .catch(reject('unable to delete employee'))
    })
};

module.exports = {
    initialize,
    getAllEmployees,
    getManagers,
    getDepartments,
    addEmployee,
    getEmployeesByStatus,
    getEmployeesByDepartment,
    getEmployeesByManager,
    getEmployeeByNum,
    updateEmployee,
    addDepartment,
    updateDepartment,
    getDepartmentById,
    deleteEmployeeByNum
}