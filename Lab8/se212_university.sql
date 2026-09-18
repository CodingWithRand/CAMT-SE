-- Lab 8	|	Name: Thanwisit Angsachon	|	SID: 682115018

-- ===== 1.1 DDL =====

drop database if exists se212_university;
create database se212_university;

use se212_university;

create table student (
    student_id int not null,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    email varchar(100) not null unique,
    birth_date date,
    major varchar(50),
    constraint student_pk primary key (student_id)
);

create table course (
    course_id char(6) not null,
    course_name varchar(100) not null,
    credits int not null 
        check(
            credits between 1 and 4
        ),
    department varchar(50) not null,
    constraint course_pk primary key (course_id)
);

create table section (
    section_id int auto_increment,
    course_id char(6) not null,
    semester int not NULL
        check (
            semester between 1 and 2
        ),
    year int not null,
    instructor_name varchar(100) not null,
    room varchar(20),
    constraint section_pk PRIMARY KEY (section_id),
    constraint section_fk1 foreign key (course_id) references course(course_id) on delete cascade
);

create table enrollment (
    student_id int,
    section_id int,
    enroll_date date not null,
    grade char(2)
        check (
            grade in ('A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F')
        ),
    constraint enrollment_pk PRIMARY KEY (student_id, section_id),
    constraint enrollment_fk1 foreign key (student_id) references student(student_id) on delete cascade,
    constraint enrollment_fk2student_id foreign key (section_id) references section(section_id) on delete cascade
);

-- ===== 1.2 INSERT =====
insert into student values 
    (640110001, 'Nattapong', 'Srisuwan', 'nattapong.s@cmu.ac.th', STR_TO_DATE('2004-03-12', '%Y-%m-%d'), 'SE'),
    (640110002, 'Kanokwan', 'Chaiyasit', 'kanokwan.c@cmu.ac.th', STR_TO_DATE('2003-11-30', '%Y-%m-%d'), 'SE'),
    (640110003, 'Peeraphat', 'Wongsa', 'peeraphat.w@cmu.ac.th', STR_TO_DATE('2004-07-08', '%Y-%m-%d'), 'MMIT');

insert into course VALUES
    (953212, 'Database System and Database System Design', 3, 'SE'),
    (953211, 'Software Engineering Fundamentals', 3, 'SE');

insert into section (course_id, semester, year, instructor_name, room) VALUES
    (953212, 1,	2026, 'Pree Thiengburanathum', 'CAMT 413'),	
    (953211, 1,	2026, 'Somchai Jaidee', 'CAMT 212');

insert into enrollment values
    (640110001,	1,	STR_TO_DATE('2026-06-15', '%Y-%m-%d'),	NULL),
    (640110002,	1,	STR_TO_DATE('2026-06-15', '%Y-%m-%d'),	NULL),
    (640110003,	1,	STR_TO_DATE('2026-06-16', '%Y-%m-%d'),	NULL),
    (640110001,	2,	STR_TO_DATE('2026-06-15', '%Y-%m-%d'),	NULL);

-- after insert
select * from enrollment;

-- ===== 1.3 UPDATE / DELETE =====
update enrollment set grade = 'B+' where student_id = 640110001 and section_id = 1;
-- proper delete
delete from enrollment where student_id = 640110003 and section_id = 1;
-- 1.3.b
-- delete from enrollment where section_id = 1;
-- after update and delete
select * from enrollment;

-- ===== 1.4 Short answers =====
-- a.	Why must COURSE be created before SECTION, and STUDENT and SECTION before ENROLLMENT?

-- = Because there are keys that those latter created tables need to refer to (foreign keys) in the prior created tables, so when writing the code, if you didn’t define the prior tables, it cannot find those keys to refer to. (Code executes sequentially.)

-- b.	Try DELETE FROM section WHERE section_id = 1; What message does MySQL give and why? Which constraint stops it?
-- = OK, 3 rows affected in 1.796ms
-- Which means, all the row with section_id = 1 are deleted, no one is enrolled in that course anymore. So, we need to check for the student_id as well, in order to only remove 1 student from the course, it stops everyone else from being removed too.


-- c.	Try to insert a course with credits = 5. What happens and which constraint is responsible?
-- = MySQL Error (3819): Check constraint 'course_chk_1' is violated.
-- 	This constraint is responsible
-- 	…
--     credits int not null 
--         check(
--             credits between 1 and 4
--         ),
--     …

-- 1.5
-- insert into course values (953999, 'Successful Software Engineer Roadmap', 5, 'SE')