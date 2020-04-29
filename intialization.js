// initial global variables

let continueApp = true;   // continuing or exiting the application
let depts = [];           // list of department names
let mgrs = [];            // list of managers names
let employeeList = [];    // list of employees names
let roles = [];           // list of job titles

  // choices for inquirer prompt - what can the user do?
const actionChoices = [
  "View all employees",
  "View employees by department",
  "View employees by manager",
  "Add an employee",
  "Remove an employee",
  "Update an employee's title",
  "Update an employee's manager",
  "Exit"
];

// make available to other modules
module.exports = {
    continueApp: continueApp,
    depts: depts,
    mgrs: mgrs,
    employeeList: employeeList,
    roles: roles,
    actionChoices: actionChoices
    }