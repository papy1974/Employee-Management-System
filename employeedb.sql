DROP DATABASE IF EXISTS employeedb;
CREATE DATABASE employeedb;
USE employeedb;

CREATE TABLE departments (
id INT PRIMARY KEY AUTO_INCREMENT,
department_name VARCHAR(30) NOT NULL UNIQUE);

CREATE TABLE roles (
id INT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(30) NOT NULL UNIQUE,
salary DECIMAL(10,2) NOT NULL,
dept_id INT,
CONSTRAINT fk_roles_dept_id FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL);

CREATE TABLE employees (
id INT PRIMARY KEY AUTO_INCREMENT,
first_name VARCHAR(30),
last_name VARCHAR(30) NOT NULL,
role_id INT,
manager_id INT,
CONSTRAINT fk_employee_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
CONSTRAINT fk_employee_mgr_id FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
UNIQUE KEY `unique_first_last` (`first_name`, `last_name`));

INSERT INTO departments
(department_name) 
VALUES
("Warehouse Systems"),
("Manufacturing Systems"),
("Systems");

INSERT INTO roles
(title, salary, dept_id)
VALUES
("WS manager", 100000.00, 1),
("WS programmer", 50000.00, 1),
("WS senior programmer", 70000, 1),
("MS manager", 110000.00, 2),
("MS programmer", 55000.00, 2),
("MS senior programmer", 75000, 2),
("second line manager", 150000.00, 3);

INSERT INTO employees 
(first_name, last_name, role_id, manager_id) 
VALUES
("Duane", "Stewart", 7, NULL);

INSERT INTO employees 
(first_name, last_name, role_id, manager_id) 
VALUES
("Emil", "Pignetti", 1, 1),
("Jim", "Tyger", 4, 1);

INSERT INTO employees 
(first_name, last_name, role_id, manager_id) 
VALUES
("Maura", "Clifford", 2, 2),
("Mike", "Slavin", 3, 3),
("Alyssa", "Quinn", 5, 2);

CREATE TABLE allemployees (
	id INT,
    first VARCHAR(30),
    last VARCHAR(30),
    title VARCHAR(30),
    dept VARCHAR(30),
    salary DECIMAL(9,2),
    manager VARCHAR(255)
    );
