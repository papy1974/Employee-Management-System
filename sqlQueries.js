// to access database
const mysql = require("mysql");
// to allow console.log-ing a table to the CDL
const cTable = require("console.table");



exports.getAllEmployees = getAllEmployees;
exports.getEmployeesByDept = getEmployeesByDept;
exports.getEmployeesByRole = getEmployeesByRole;
exports.displayTable = displayTable;
