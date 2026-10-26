-- SQL 2 (Scroll to line 130-ish)
DROP DATABASE IF EXISTS company_training; 
CREATE DATABASE company_training; 
USE company_training;

CREATE TABLE Managers (
    manager_id   VARCHAR(10) PRIMARY KEY,
    manager_name VARCHAR(100) NOT NULL
);

CREATE TABLE Departments (
    department_id   VARCHAR(10) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    manager_id      VARCHAR(10) NOT NULL,

    FOREIGN KEY (manager_id)
        REFERENCES Managers(manager_id)
);

CREATE TABLE Employees (
    employee_id   VARCHAR(10) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(10) NOT NULL,

    FOREIGN KEY (department_id)
        REFERENCES Departments(department_id)
);

CREATE TABLE Courses (
    course_id    VARCHAR(10) PRIMARY KEY,
    course_title VARCHAR(100) NOT NULL,
    course_hours INTEGER NOT NULL CHECK (course_hours > 0)
);

CREATE TABLE Instructors (
    instructor_id   VARCHAR(10) PRIMARY KEY,
    instructor_name VARCHAR(100) NOT NULL
);

CREATE TABLE Rooms (
    room_id       VARCHAR(10) PRIMARY KEY,
    room_name     VARCHAR(100) NOT NULL,
    room_capacity INTEGER NOT NULL CHECK (room_capacity > 0)
);

CREATE TABLE _Sessions (
    session_id    VARCHAR(10) PRIMARY KEY,
    course_id     VARCHAR(10) NOT NULL,
    instructor_id VARCHAR(10) NOT NULL,
    room_id       VARCHAR(10) NOT NULL,
    session_date  DATE NOT NULL,

    FOREIGN KEY (course_id)
        REFERENCES Courses(course_id),

    FOREIGN KEY (instructor_id)
        REFERENCES Instructors(instructor_id),

    FOREIGN KEY (room_id)
        REFERENCES Rooms(room_id)
);

CREATE TABLE Enrollments (
    employee_id VARCHAR(10) NOT NULL,
    session_id  VARCHAR(10) NOT NULL,
    result      VARCHAR(10) NOT NULL DEFAULT 'Pending',

    PRIMARY KEY (employee_id, session_id),

    FOREIGN KEY (employee_id)
        REFERENCES Employees(employee_id),

    FOREIGN KEY (session_id)
        REFERENCES _Sessions(session_id),

    CHECK (result IN ('Pass', 'Fail', 'Pending'))
);

INSERT INTO Managers (manager_id, manager_name)
VALUES
    ('M01', 'Nora'),
    ('M02', 'Omar');

INSERT INTO Departments (
    department_id, department_name, manager_id
)
VALUES
    ('D01', 'Engineering', 'M01'),
    ('D02', 'Finance', 'M02');

INSERT INTO Employees (
    employee_id, employee_name, department_id
)
VALUES
    ('E01', 'Ava', 'D01'),
    ('E02', 'Ben', 'D01'),
    ('E03', 'Cleo', 'D02'),
    ('E04', 'Claire', 'D02'),
    ('E05', 'Dan', 'D01');

INSERT INTO Courses (
    course_id, course_title, course_hours
)
VALUES
    ('C01', 'First Aid', 4),
    ('C02', 'Cyber Safety', 2);

INSERT INTO Instructors (instructor_id, instructor_name)
VALUES
    ('I01', 'Sam'),
    ('I02', 'Kai'),
    ('I03', 'Lee');

INSERT INTO Rooms (room_id, room_name, room_capacity)
VALUES
    ('R01', 'Oak Room', 20),
    ('R02', 'Pine Room', 30);

INSERT INTO _Sessions (
    session_id, course_id, instructor_id, room_id, session_date
)
VALUES
    ('S01', 'C01', 'I01', 'R01', '2026-11-02'),
    ('S02', 'C02', 'I02', 'R02', '2026-11-03'),
    ('S03', 'C01', 'I03', 'R01', '2026-11-05');

INSERT INTO Enrollments (employee_id, session_id, result)
VALUES
    ('E01', 'S01', 'Pass'),
    ('E01', 'S02', 'Pass'),
    ('E02', 'S01', 'Pending'),
    ('E03', 'S02', 'Pass'),
    ('E03', 'S03', 'Pending');

SELECT * FROM employees;
SELECT * FROM departments;
SELECT * FROM managers;
SELECT * FROM enrollments;
SELECT * FROM _sessions;
SELECT * FROM courses;
SELECT * FROM instructors;
SELECT * FROM rooms;

-- Select with Wildcard
-- Select employee with their name that start with 'Cl'
SELECT * FROM employees WHERE employee_name LIKE 'Cl%';
-- Similar to matching employee_name with regex ^Cl.*
-- %Text% means match with any string with 'Text' inside
-- % mean any character for any amount of it. Similar to .* regex pattern
-- _ mean any character, but _ count as one character. Similar to . regex pattern.
-- E.g. '%c_' will match "i343o4k234c1" but not 243423c3oi

-- Select with aggregated function
-- There are COUNT(), SUM(), MIN(), MAX(), AVG(), ROUND() <--- math function not aggregated.
-- Aggregated function ignore NULLs.
-- Use with GROUP BY
-- E.g. Select total number of sessions that will be held at each room
SELECT room_id, COUNT(room_id) as total_session_num FROM _sessions
GROUP BY room_id;
SELECT room_id, COUNT(*) as total_session_num FROM _sessions
GROUP BY room_id;
-- notice that COUNT(*) will return the same thing as COUNT(room_id), cuz it count from the row number.
-- SELECT room_id, instructor_id, COUNT(room_id) as total_session_num FROM _sessions
-- GROUP BY room_id;
-- adding another column that's not in GROUP BY will cause error because of the only_full_group_by mode.
SELECT room_id, instructor_id, COUNT(room_id) as total_session_num FROM _sessions
GROUP BY room_id, instructor_id;
-- The above query work, but lost its business purpose.

-- select the result in enrollments with number of the employee in that result more than 2. (Use HAVING)
-- I mean like if there are 3 employees with result pass, show that, but if there are 2 employees with result pending, don't show that.
SELECT result FROM enrollments
GROUP BY result HAVING COUNT(result) > 2;
-- Should only see Pass.

-- ORDER BY. The default order is ascending (from small to big)
-- Select total number of sessions that will be held at each room in 'ascending' order
SELECT room_id, COUNT(room_id) as total_session_num FROM _sessions
GROUP BY room_id ORDER BY COUNT(room_id);
-- you can explicitly specify ASC at the end as well.
SELECT room_id, COUNT(room_id) as total_session_num FROM _sessions
GROUP BY room_id ORDER BY COUNT(room_id) ASC;
-- Select total number of sessions that will be held at each room in 'descending' order
SELECT room_id, COUNT(room_id) as total_session_num FROM _sessions
GROUP BY room_id ORDER BY COUNT(room_id) DESC;

-- LIMIT
-- select first employee in the enrollments data with result 'pass'
SELECT employee_id, result FROM enrollments
WHERE result = "Pass" LIMIT 1;

-- Note:
-- 1. You cannot use column alias in WHERE, use its real name.
-- 2. Aggregate on HAVING only, not WHERE

-- UPDATE - DON'T FORGET THE WHERE CLAUSE OR ELSE EVERYTHING WILL ALL GET UPDATED!!
UPDATE enrollments SET result = "Pass" WHERE employee_id = 'E02' and session_id = 'S01';
SELECT * FROM enrollments;
-- No where clause, every result field = Pending now.
-- UPDATE enrollments SET result = "Pending";
-- SELECT * FROM enrollments;

-- DELETE - Same warning as UPDATE
DELETE FROM employees WHERE employee_id = 'E05';
SELECT * FROM employees;

-- Referential Integrity can affect UPDATE and DELETE queries.

-- Join TABLE
-- Types of join
-- 1. Inner join: Output only the rows that satisfies ON clause on both tale.
-- 2. Left (OUTER) join: Mainly output the left table (SELECT side), output the data from the right table as well when ON clause is satisfied, otherwise output NULL.
-- 3. Right (OUTER) join: Mainly output the right table (JOIN side), output the data from the left table as well when ON clause is satisfied, otherwise output NULL.
-- 4. Full (OUTER) join: left join UNION right join. 
-- 5. Natural join: Inner join but no ON clause and duplicated column used in ON clause. In fact, it does inner join on whatever attributes that have matching column name in both table. 
-- 6. Cross join: Cartesian product. Number of return row = table1_row * table2_row * ...
--      first row of the 2nd table pair with every row in the first table, then goes on.

-- Business query: Who teaches which course, which session?
SELECT s.session_id, i.instructor_name, c.course_title
FROM _sessions AS s -- Alias can also be applied to table name to shorten its name for faster use. (AS is optional btw)
INNER JOIN instructors i ON s.instructor_id = i.instructor_id -- INNER keyword is optional (default join is inner join)
JOIN courses c ON s.course_id = c.course_id;

-- Business query: Who is not enrolling? Layout each employee enrollment.
SELECT em.employee_name, e.session_id, c.course_title
FROM employees em
LEFT OUTER JOIN enrollments e ON em.employee_id = e.employee_id -- OUTER keyword is optional.
LEFT OUTER JOIN _sessions s ON e.session_id = s.session_id
LEFT OUTER JOIN courses c ON s.course_id = c.course_id;
-- Now only select who isn't enrolled in.
SELECT em.employee_name, e.session_id, c.course_title
FROM employees em
LEFT JOIN enrollments e ON em.employee_id = e.employee_id
LEFT JOIN _sessions s ON e.session_id = s.session_id
LEFT JOIN courses c ON s.course_id = c.course_id
WHERE s.session_id IS NULL; -- Use IS NULL to check if a field is NULL or not.

-- Business query: I want full info of each employee
SELECT *
FROM employees em
NATURAL JOIN departments d
NATURAL JOIN managers m;
-- No duplicated column (The PK), now, try it with normal INNER JOIN.
SELECT *
FROM employees em
JOIN departments d ON em.department_id = d.department_id
JOIN managers m ON d.manager_id = m.manager_id;
-- Although JOIN with USING(FK) surprisingly work like NATURAL JOIN.
SELECT *
FROM employees em
JOIN departments d USING(department_id)
JOIN managers m USING(manager_id);

-- Cross Join. Rare use case. I can't think of any business query. So just see the demo.
-- Department CROSS Manager
SELECT d.department_id, d.department_name, m.manager_id, m.manager_name
FROM departments d CROSS JOIN managers m;
-- This query will also give the same result.
SELECT d.department_id, d.department_name, m.manager_id, m.manager_name
FROM departments d, managers m;
-- (D02, M01), (D01, M01), (D02, M02), (D01, M02)
-- m x d

-- Miscellaneous -> Select table from other database <database_name>.<table_name>
SELECT * FROM wildlife_rescue_center.animals;

-- Miscellaneous -> INCREMENT
-- INCREMENT means the default value of an INT column (must be PK) will step up every time new data is inserted in.
-- Default initial value is 1, as well as the incremental value.
-- A way to make unique
DROP TABLE IF EXISTS test;
create table TEST(
    top_tower_index INT PRIMARY KEY AUTO_INCREMENT,
    top_tower_accronym VARCHAR(10) UNIQUE -- Almost forgot to mentioned the UNIQUE constraint. Data in this column are unique in every row/field 
);
INSERT INTO test(top_tower_accronym) VALUES
('ToTQTP'),
('ToTCR'),
('STONE:R'),
('ToID'),
-- ('ToW'), -- Duplicated data will cause error becaue of UNIQUE.
('ToW');

select * from test ORDER BY top_tower_index; -- You'll see the index from 1-5

-- You can also change the increment data.

ALTER TABLE test AUTO_INCREMENT = 100;
INSERT INTO test(top_tower_accronym) VALUES
('ToCP'),
('ToCR');
select * from test ORDER BY top_tower_index; -- ToCP will start at 100 now.

-- To change the step up value. The lecture is wrong, here is the real solution (I won't try it tho.)
-- <I moved it to SQL Practice Answers.md file, go read it there.>

-- Exercises (Regard to this company_training database)
-- 1. Who is enrolled in each training session?
-- 2. How many employees are enrolled in each session?
-- 3. Which departments have at least two different employees enrolled?
-- 4. Which employees have passed the most training hours?
-- 5. What are the three most popular courses with at least two enrollments?