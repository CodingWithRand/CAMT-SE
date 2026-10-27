-- SQL
-- Structured Query Language used in RDBMS
-- Terms
-- 1. Catalog -> Set of schemas that describe the database
-- 2. Schemas -> Tables, views, constraints
-- 3. DDL -> Data Definition Language defines database/schemas/tables (Create, Alter, Drop)
-- 4. DML -> Data Manipulation Language maintains and queries (Select, Insert, Update, Delete)
-- 5. DCL -> Data Control Language deals with priviledge, authorization, and security on accessing data (Grant, Revoke)

-- DDL
-- Let's refer to the 2 practice problems, and created the table here.
-- But before that, we need to create the database first.
-- The syntaxes are pretty self explanatory, but if there is any need of clarification, I'll put after the code.
-- btw, each statement must end with ';', and don't bother the inconsistent of capital and lower case syntaxes, SQL is case insensitive for those keywords.
-- and SQL is an interpreted language, which mean order of the code matter. (can't refer to something that's not been created yet)

DROP DATABASE IF EXISTS wildlife_rescue_center; 
-- Drop = delete. work with table, database, view, etc. IF EXISTS check if the dropping one exists or not.
-- Cuz if we drop something that doesn't exist, sql will throw error.
-- Maybe you considered CREATE OR REPLACE, but in SQL that only work with view, function, procedure. It doesn't work with table and database.
CREATE DATABASE wildlife_rescue_center; 
USE wildlife_rescue_center; -- from now on, sql code will only have effect within this database

DROP TABLE IF EXISTS Species;
create table Species (
    species_id      CHAR(3) NOT NULL, -- Define a column in the table.
    species_name    VARCHAR(100),
    constraint species_id_pk PRIMARY KEY (species_id) 
    -- 1st way to specify PK, through 'constraint', and give the constraint a name <attribute>_pk after.
    -- then follow with PRIMARY KEY (<attribute>)
);

DROP TABLE IF EXISTS Animals;
create table Animals (
    animal_id   CHAR(3) PRIMARY KEY NOT NULL, -- 2nd way to specify PK, directly after the attribute itself.
    animal_name VARCHAR(20),
    species_id  CHAR(3),
    constraint species_id_fk FOREIGN KEY (species_id) 
        REFERENCES Species (species_id)
        ON DELETE SET NULL ON UPDATE CASCADE
    -- Defining FK: 
    -- constraint <attribute>_fk FOREIGN KEY (<attribute>) 
    --     REFERENCES <ref_table> (<attribute_in_ref_table)
    --     <referential integrity (optional)>
    -- Referential Integrity
    -- 2 actions, on delete and on update (Default values are RESTRICT / NO ACTION)
    -- 1. RESTRICT / NO ACTION: Not allow the query when fk update or delete
    -- 2. CASCADE: Update fk in every tables / Delete every row with that fk in it.
    -- 3. SET NULL: Change to NULL when that fk is changed or delete (It no longer exists)
    -- 4. SET DEFAULT: Change to default value of that column (Not allowed in MySQL)
);

DROP TABLE IF EXISTS Vets;
create table Vets (
    vet_id     CHAR(3) PRIMARY KEY, -- No need to specify NOT NULL, PK is already set to NOT NULL by default.
    vet_name   TEXT,
    vet_phone  TEXT
);

DROP TABLE IF EXISTS Checkups;
create table Checkups (
    animal_id               CHAR(3),
    checkup_date            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- set default value of this column to now() when the insert query doesn't specify this field.
    vet_id                  CHAR(3),
    animal_weight_in_grams  DECIMAL(5, 3),
    constraint checkups_pk PRIMARY KEY (animal_id, checkup_date), -- Composite PK
    constraint animal_id_fk FOREIGN KEY (animal_id)
        REFERENCES Animals (animal_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    constraint vet_id_fk FOREIGN KEY (vet_id)
        REFERENCES Vets (vet_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- SQL Datatype
-- Learn more: https://www.w3schools.com/sql/sql_datatypes.asp
-- Most used one
-- 1. CHAR(size): Fixed size string. E.g. CHAR(3) only allowed 'abc', but not 'abcd' or 'ab'
-- 2. VARCHAR(size): Variable size string with maximum size capped. E.g. VARCHAR(3) allowed 'abc', 'ab' but not 'abcd'
-- 3. TINYINT, SMALLINT, MEDIUMINT, INT, BIGINT or INT1, 2, 3, 4, 8: byte, short, ???, int, long in java
-- 4. DATE: Present year, month, and day (the date on calendar), format is YYYY-MM-DD
-- 5. TEXT: Normal string, no max size capped
-- 6. BOOLEAN / BOOL
-- 7. DECIMAL or DEC(number_of_digit_before_dot, number_of_digit_after_dot): E.g. DEC(5, 3) will allow 10.023, but not 344.3211
-- 8. TIMESTAMP: DATE + TIME (hh:mm:ss)

-- Alter Table -> Change the table structure
-- 1.1 Change or add default value of the column.
ALTER TABLE Checkups
ALTER COLUMN animal_weight_in_grams SET DEFAULT 50.0;
-- 1.2 Remove default value.
ALTER TABLE Checkups
ALTER COLUMN checkup_date DROP DEFAULT;
-- 2. Redefine the column
ALTER TABLE Checkups
MODIFY COLUMN animal_weight_in_grams INT;
ALTER TABLE Checkups
MODIFY COLUMN checkup_date DATE;
-- 3. Add new column
ALTER TABLE Checkups
ADD COLUMN test INT DEFAULT 67;
-- 4. Change column name + (2)
ALTER TABLE Checkups
CHANGE COLUMN test removing_test VARCHAR(2);
-- 5. Remove a column
ALTER TABLE Checkups
DROP COLUMN removing_test;
-- 6. Add/Remove constraint
ALTER TABLE Checkups
ADD CONSTRAINT heavy CHECK(animal_weight_in_grams > 1000);
ALTER TABLE Checkups
DROP CONSTRAINT heavy;

-- DML
INSERT INTO species VALUES -- Insert every column and multiple row at once.
('S01',	'Barn Owl'),
('S02', 'Hedgehog');

INSERT INTO animals VALUES('A01', 'Pip', "S01"); -- Insert one column at a time.
INSERT INTO animals (animal_id, animal_name, species_id) VALUES('A02', 'Moss', "S02"); 
INSERT INTO animals (animal_id, animal_name, species_id) VALUES('A03', 'Luna', "S01"); 
-- Specify table column of which value to insert in which column.
-- animal_id -> 'A01'
-- animal_name -> 'Pip'
-- species_id -> 'S01'
-- Good practice.
-- Required when you don't want to insert every column in the table. (Default or Null take care of it.)

-- Case that insert fails: Duplicated PK, Null in NOT NULL, Insert non-existence FK (No PK in other table to reference to yet), doesn't match CHECK constraint.
-- I'll demo the check thing.
ALTER TABLE Vets
ADD COLUMN vet_gender INT2 CHECK(vet_gender in (1, 2));
-- CHECK will only accept value that pass the condition inside
-- In this case, i'll only allow male (1) or female (2) vet. Sorry to the LGBTQ community.
-- The condition can be written in smth like vet_gender = 1 or vet_gender = 2 as well.
-- vet_gender in (1, 2) mean the value of vet_gender is either 1 or 2 inside the parenthesis.
-- Equal operator in SQL is = not == or ===
-- and = &&, or = || in java.
-- and evaluate before or, so parenthesis is a good practice. (do in parenthesis first)
-- False or True and True evaluate to True instead of False. It is False or (True and True) not (False or True) and True

INSERT INTO Vets VALUES
('V01',	'Maya',	'0801111111', 2),
('V02',	'Leo',	'0802222222', 1);
-- ('V03',	'Elevenz',	'08069420911', 67);  -- <- this line will cause error

INSERT INTO checkups VALUES
('A01', '2026-10-20', 'V01', '450'),
('A01', '2026-10-22', 'V02', '460'),
('A02', '2026-10-20', 'V01', '700'),
('A03', '2026-10-22', 'V02', '510');

-- Select structure
-- SELECT column_name1, column_name2, ... or * FROM table(s) <--- JOIN
-- WHERE condition
-- GROUP BY column_name1, column_name2, ...
-- HAVING condition_after_group_by
-- ORDER BY column_name1, column_name2, ...
-- LIMIT number_of_rows

-- Order of process: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT

-- Select every table in the database
SHOW TABLES;
-- Select everything in every table.
SELECT * FROM animals;
SELECT * FROM checkups;
SELECT * FROM species;
SELECT * FROM vets;
-- Select vet info (only vet_name and vet_phone)
SELECT vet_name, vet_phone FROM vets;
-- Perform arithmatic in SELECT + Alias column name (show this after query instead of the original column name)
SELECT animal_weight_in_grams / 1000.0 AS animal_weight_in_kg FROM checkups;
-- Usage of DISTINCT (exclude duplicated data).
-- Below queries will give different results.
SELECT DISTINCT animal_id FROM checkups;
SELECT DISTINCT animal_id, checkup_date FROM checkups;

-- Select with condition (WHERE clause)
-- Select every checkup with the weight more than 500 grams.
SELECT * FROM checkups WHERE animal_weight_in_grams > 500;
-- Select every checkup with the weight between than 450 and 500 grams.
SELECT * FROM checkups WHERE animal_weight_in_grams BETWEEN 450 AND 500;

-- End of practice problem 1 --
