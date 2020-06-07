// access database, create path, allow console.log-in, need express, global variable.
// to access database 
const mysql = require("mysql");
// need path for filename paths
const path = require("path");
// to allow console.log-ing a table to the CLI
const cTable = require("console.table");
// need express to have a conversation with the user on the CLI
const inquirer = require("inquirer");
// initialize global variables
const init = require("./intialization");

// set up connection to db
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "12261974",
  database: "employeedb"
});

// open connection to db
connection.connect(function(err) {
  if (err) console.log(err);
});

// build a table of all employees with job title, department name, annual salary, manager's name;
//   and display it on the console
//   Uses allemployees as a working table in the database 
//          (probably wouldn't do this in "real life", 
//             since it's slower...but since it's practice with SQL queries...)
//   allemployees table has the layout to display the table of all employees to the user in the console.
//
// Don't display the table in this function because 
//   the calling function may modify it before displaying it to the user.
// create function get AllEmployess.
function getAllEmployees() {
  // clear out working (scrap) table to load it with current data
  // set up the query
  let query = "DELETE FROM allemployees;";
  // execute the query
  connection.query(query, function(deleteErr, deleteRes) {
    if (deleteErr) console.log(deleteErr);
  });

  // get data from joining employees & role tables
  // initially, we have the manager id, which later gets updated to the manager's name

  // set up the query(all)
  query =
    "INSERT INTO allemployees (id, first, last, title, dept, salary, manager)";
  query +=
    " SELECT employees.id, first_name, last_name, title, department_name, salary, manager_id";
  query += " FROM employees";
  query += " LEFT JOIN roles ON (employees.role_id = roles.id)";
  query += " LEFT JOIN departments ON (departments.id = roles.dept_id);";
  // execute the query
  connection.query(query, function(insertErr, insertRes) {
    if (insertErr) console.log(insertErr);
  });

  // replace manager id number with the first and last name
  // get the manager's name from the employees table
  // set up the query
  query = "UPDATE allemployees a, employees e";
  query += " SET a.manager = CONCAT(e.first_name, ' ', e.last_name)";
  query += " WHERE a.manager = e.id;";
  // execute the query
  connection.query(query, function(updateErr, updateRes) {
    if (updateErr) console.log(updateErr);
  });

  // We now have all the information in the working table ready to display to the user.

} // end getallemployees


// gets the table of all the employees in the given department to display to the user.
// the calling function is responsible for displaying the table
// create function getEmployeeByDept.
function getEmployeesByDept(department) {
  // get all employees
  getAllEmployees();

  // erase all employees except those in the given department
  query = "DELETE FROM allemployees WHERE dept <> ?  OR dept IS NULL;";
  connection.query(query, department, function(err, res) {
    if (err) console.log(err);
  });
} // end of getemployeesbydept

// gets the table of all the employees with a given manager to display to the user.
// the calling function getEmployeesByM is responsible for displaying the table
function getEmployeesByMgr(mgr) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE manager <> ? OR manager IS NULL;";
  connection.query(query, mgr, function(err, res) {
    if (err) console.log(err);
  });
} // end of getemployeesbymgr

// Displays the working table allemployees to the user
//  Previously called functions displayTable have built this table with the information the user requested.
function displayTable() {
  // select table data to send to CLI
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) console.log(err);
    // Sent stringified results to the CLI after a couple blank lines.
    console.log("\n\n");
    console.table(JSON.parse(JSON.stringify(res)));
  });
} // end of displaytable


// Deletes an record from the employees table, given the employee name.
// If it's a manager, the manager id is set to null for all the employees under him.
//   - this is done in the database with ON DELETE SET NULL (not explicitly done here)
// create function deleteEmployee
function deleteEmployee(emp_name) {
  // delete given employees
  query = "DELETE FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?;";
  connection.query(query, emp_name, function(err, res) {
    if (err) console.log(err);
    console.log("\n\n" + emp_name + " was successfully deleted.");
  });

  findEmployees();  // update employeeList 
  findMgrs();  // update mgrs, in case a manager was deleted.
}  // end of deleteEmployee


// Updates an employees job title, given the employee's name and the new title name
// make function updateEmployeerole 
function updateEmployeeRole(employee_name, new_role) {
  // update an employee's role
  // get the new role_id first from the roles table, using the role name (job title) to retrieve it.
  // should only be one, but just in case, it'll take the first
  query = "SELECT id FROM roles WHERE title = ? LIMIT 1;";
  connection.query(query, new_role, function(selectErr, selectRes) {
    if (selectErr) console.log(selectErr);

    // set up the update query statement
    query =
      "UPDATE employees SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";
    // execute the update query statement
    connection.query(query, [selectRes[0].id, employee_name], function(updateErr, updateRes) {
      if (updateErr) console.log(updateErr);
      findEmployees();   // to update init.employeeList
      // NOTE:  no need to call findMgrs() because even if the new role is a manager,
      //   the app doesn't recognize someone as a manager unless they have people working under them.
      // let the user know the job title was successfully updated.
      console.log("\n\n" + employee_name + "'s job title has been updated to " 
          + new_role + ".");   
    });  // end if connection.query to update
  });  // end of connection.query to select
} // end of updateemployeerole

// update an employee's manager given the employee's name and the new manager's name
// start updateEmployee function.
function updateEmployeeMgr(employee_name, new_mgr) {

  // get the new manager_id from the employees table (using the manager's full name)
  // should only be one, but just in case, it'll take the first (LIMIT 1)
  query = "SELECT id FROM employees WHERE CONCAT(first_name, ' ', last_name) = ? LIMIT 1;";
  connection.query(query, new_mgr, function(selectErr, selectRes) {
    if (selectErr) console.log(selectErr);

    // then do the update to change the manager id for the given employee to the manager id just found.
    query = "UPDATE employees SET manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";
    connection.query(query, [selectRes[0].id, employee_name], function(updateErr, updateRes) {
      if (updateErr) console.log(updateErr);
      findMgrs();   // update init.mgrs, since this will have changed.
      console.log(
        "\n\n" + employee_name + "'s manager has been updated to " + new_mgr + "."
      );
    });
  });
} // end of updateemployeemgr


// main method that controls the flow of the application
//   called iteratively to keep asking the user what they want to do 
//     until they choose to exit
function whatToDo() {


  // all the questions that the user can be asked
  //  type is the type of input expected from the user:
  //    list:  choose from a list displayed
  //    input: use types text in
  //    confirm: yes or no response
  //  name:  name of the variable answer will be stored in
  //  messege:  text used to query the user
  //  when:  only ask the question when true (functions return boolean)
  //  choices: list of choices in an array of strings
   
  const questions = [
    // Asks initial question - what do you want to do
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: init.actionChoices           // list of what the user can do
    },
    // Asks which dept, if viewing employees by dept
    {
      type: "list",
      name: "dept",
      message: "Which department would you like to see?",
      // only show this question when this action is chosen
      when: actionIs("View employees by department"),  
      choices: init.depts  // list of departments
    },

    // Asks which mgr, if viewing employees by dept
    {
      type: "list",
      name: "mgr",
      message: "Which manager would you like to see the employees for?",
      // only show this question when this action is chosen
      when: actionIs("View employees by manager"),
      choices: init.mgrs  // list of managers
    },

    // Asks employee first name, if adding an employee
    {
      type: "input",
      name: "addFirst",
      message: "What is the employee's first name?",
      // only show this question when this action is chosen
      when: actionIs("Add an employee")
    },

    // Asks employee last name, if adding an employee
    {
      type: "input",
      name: "addLast",
      message: "What is the employee's last name?",
      // only show this question when this action is chosen
      when: actionIs("Add an employee")
    },

    // Asks which mgr, if adding an employee
    {
      type: "list",
      name: "addMgr",
      message: "Which manager will this employee be working for?",
      // only show this question when this action is chosen
      when: actionIs("Add an employee"),
      choices: init.mgrs             //  list of managers
    },

    // Asks which role, if adding an employee
    {
      type: "list",
      name: "addRole",
      message: "What will be this new employee's title?",
      // only show this question when this action is chosen
      when: actionIs("Add an employee"),
      choices: init.roles        // list of job titles
    },

    // Asks which employee, if removing an employee
    {
      type: "list",
      name: "removeEmp",
      message: "Which employee would you like to fire?",
      // only show this question when this action is chosen
      when: actionIs("Remove an employee"),
      choices: init.employeeList      // list of current employees
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpForRole",
      message: "Which employee would you like to update the title for?",
      // only show this question when this action is chosen
      when: actionIs("Update an employee's title"),
      choices: init.employeeList        // list of current employees
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpRole",
      message: "What is the employee's new title?",
      // only show this question when this action is chosen
      when: actionIs("Update an employee's title"),
      choices: init.roles           // list of job titles
    },

    // Asks which employee is getting a new manager (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpForNewMgr",
      message: "Which employee is getting a new manager?",
      // only show this question when this action is chosen
      when: actionIs("Update an employee's manager"),
      choices: init.employeeList        // list of current employees
    },

    // Asks who the new manager is (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpNewMgr",
      message: "Who is the new manager?",
      // only show this question when this action is chosen
      when: actionIs("Update an employee's manager"),
      choices: init.mgrs         // list of current managers
    },

    // Asks are you sure you want to exit?  Leaves if yes.
    {
      type: "confirm",
      name: "exitApp",
      message: "Are you sure you want to quit?",
      // only show this question when this action is chosen
      when: actionIs("Exit")
    }
  ];


  // asks the questions, gets answers in results variable
  inquirer.prompt(questions).then(results => {
    // call functions to do each action as requested
    switch (results.action) {
      case "View all employees":
        getAllEmployees();
        displayTable();
        break;

      case "View employees by department":
        getEmployeesByDept(results.dept);
        displayTable();
        break;

      case "View employees by manager":
        getEmployeesByMgr(results.mgr);
        displayTable();
        break;

      case "Add an employee":
        insertNewEmployee(results);
        break;

      case "Remove an employee":
        deleteEmployee(results.removeEmp);
        break;

      case "Update an employee's title":
        updateEmployeeRole(results.updateEmpForRole, results.updateEmpRole);
        break;

      case "Update an employee's manager":
        updateEmployeeMgr(results.updateEmpForNewMgr, results.updateEmpNewMgr);
        break;

      case "Exit":
        // If the user doesn't want to leave, start over.  Otherwise, quit.
        if (results.exitApp) {
          // thank user
          console.log(
            "\nThank you for using 'Employee Manager'!  Have a good day.");
          init.continueApp = false;
          // close connection before leaving.
          connection.end();
        }
        break;

        fault: console.log(
          "\nNot all action choices accounted for - see inquirer.then in server.js.");
    } // end of switch stmt

    // start again with initial menu, when task is complete.
    if (init.continueApp) {
      setTimeout(whatToDo, 250);
    }
  }); // end of .then block
}


// returns true if the action passed in matches the action entered
//   to determine what action-specific question to ask & action to take
function actionIs(action) {
  return function(answers) {
    return answers.action == action;
  };
}

// returns an array of strings, where each string is a dept name
async function findDepts() {
  // clear out from last query.
  init.depts = [];
  const query = "SELECT department_name FROM departments;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      init.depts.push(res[i].department_name);
    }
  });
} // end of findDepts

// returns an array of strings, where each string has a manager name
async function findMgrs() {
  // clear out from last query.
  init.mgrs = [];
  let query = "SELECT DISTINCT";
  query += " CONCAT(m.first_name, ' ', m.last_name)";
  query += " AS mgr_name";
  query += " FROM employees e";
  query += " INNER JOIN  employees m";
  query += " ON e.manager_id = m.id;";
  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      init.mgrs.push(res[i].mgr_name);
    }
  });
} // end of findMgrs

// returns an array of strings, where each string has role (or title) name
async function findRoles() {
  // clear out from last query.
  init.roles = [];
  const query = "SELECT DISTINCT title FROM roles;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      init.roles.push(res[i].title);
    }
  });
} // end of findRoles

// returns an array with two string elements, the first name and the last name by using insertNewEmployee
async function insertNewEmployee(results) {
  // get manager first & last name, first

  // need to create object with data needed to insert into the employees table
  let employee_insert_obj = {
    first_name: results.addFirst,
    last_name: results.addLast,
    role_id: null, // to be retrieved from roles table based on role title
    manager_id: null // to be retrieved from the employees table from the manager name
  };

  // need to get manager id and employee's role id, and put them in the employee_insert_obj.
  // then insert new record in database table

  // do query to get manager's first & last so we can get their id
  let query =
    "SELECT first_name, last_name FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?";

  await connection.query(query, results.addMgr, function(selectFirstLastErr, selectFirstLastRes) {
    if (selectFirstLastErr) console.log(selectFirstLastErr);

    // get the managers's id from the employees table to put in the new record as the employee's manager id
    query =
      "SELECT id FROM employees WHERE first_name = ? AND last_name = ?;";
    connection.query(query, [selectFirstLastRes[0].first_name, selectFirstLastRes[0].last_name], 
      function(selectIdFrEmpErr, selectIdFrEmpRes) {
      if (selectIdFrEmpErr) console.log(selectIdFrEmpErr);

      // put the manager's role id in the object to be inserted in the db for the new employee
      employee_insert_obj.manager_id = selectIdFrEmpRes[0].id;

      // get the role id for the employee from the roles table
      query = "SELECT id FROM roles WHERE title = ?;";
      connection.query(query, results.addRole, function(selectIdFrRolesErr, selectIdFrRolesRes) {
        if (selectIdFrRolesErr) console.log(selectIdFrRolesErr);

        // replace the name in the role object to be inserted with the dept_id
        employee_insert_obj.role_id = selectIdFrRolesRes[0].id;

        //   Now we can have all the needed information, we can insert the new employee
        query = "INSERT INTO employees SET ?;";
        connection.query(query, employee_insert_obj, function(insertErr, insertRes) {
          if (insertErr) console.log(insertErr);

          console.log("\n\nThe new employee " + 
          employee_insert_obj.first_name + " " + employee_insert_obj.last_name 
          + " has been successfully inserted.");
          // this is done in this block to make sure INSERT query is done before list is updated.
          findEmployees();  // update init.employeeList to make sure new employee is included.
          
          // no need to call findMgrs because there isn't a way to make a new employee a manager.
        });  // end of connection.query for INSERT
      });   // end of connection.query for SELECT id FROM roles
    });   // end of connection.query for SELECT id from employees
  });  // end of connection.query for SELECT first_name last_name

} // end of insertnewemployee

// returns an array of strings, where each string is an employee name (first & last)
async function findEmployees() {
  // clear out from last query.
  init.employeeList = [];
  const query =
    "SELECT CONCAT(first_name, ' ', last_name) as emp_name FROM employees;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      init.employeeList.push(res[i].emp_name);
    }
  });
} // end of findEmployees



// get list of depts for "View employees by dept"
// initializes the global "init.depts"
findDepts();

// get list of managers for "View employees by manager" & "Add an employee"
// a manager is defined as someone who has people working for them.
// doesn't handle the case where a new manager doesn't have anyone working for them, yet.
// initializes the global "init.mgrs"
findMgrs();

// get list of roles (titles) for "Add an employee"
// initializes the global "init.roles"
findRoles();

// get list of employees for "Remove an employee"
// initializes the global "init.employeeList"
findEmployees();

// Ask what to do
whatToDo();