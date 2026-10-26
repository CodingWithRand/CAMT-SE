# Miscellaneous - Step Increment Value setting in MySQL real way.

Yes—**MySQL doesn’t support `INCREMENT = 10` in an `ALTER TABLE` statement.** Your lecture may be mixing syntax from another database.

These are two separate settings:

### Set the next ID to 100
```sql
ALTER TABLE test AUTO_INCREMENT = 100;
```
This works if 100 is above the existing IDs.

### Set the step to 10
```sql
SET SESSION auto_increment_increment = 10;
```

**To get exactly `100, 110, 120…`, also set the offset:**

```sql
SET SESSION auto_increment_increment = 10;
SET SESSION auto_increment_offset = 10;

ALTER TABLE test AUTO_INCREMENT = 100;
```

Then insert without supplying the ID:

```sql
INSERT INTO test (top_tower_accronym)
VALUES ('AAA'), ('BBB'), ('CCC');

SELECT * FROM test
ORDER BY top_tower_index;
```

Assuming the existing IDs are below 100, the new rows get **100, 110, 120**.

The offset matters: with the default offset of `1`, a step of `10` follows **1, 11, 21…**, so requesting a next ID of 100 would lead to **101**, not 100.

**Remember:** `ALTER TABLE ... AUTO_INCREMENT` changes one table’s next number; the session settings affect all auto-increment tables in your current connection.

# Answers

Sure! Here are **five business questions** for your training database. They start simple, then combine the clauses you mentioned.

### 1. Who is enrolled in each training session?
**Uses:** `JOIN`, `ORDER BY`

```sql
SELECT
    e.employee_name,
    d.department_name,
    s.session_id,
    c.course_title,
    s.session_date,
    en.result
FROM Enrollments AS en
JOIN Employees AS e
    ON en.employee_id = e.employee_id
JOIN Departments AS d
    ON e.department_id = d.department_id
JOIN Sessions AS s
    ON en.session_id = s.session_id
JOIN Courses AS c
    ON s.course_id = c.course_id
ORDER BY s.session_date, e.employee_name;
```

`JOIN` connects the records. `ORDER BY` sorts them by date, then employee name.

### 2. How many employees are enrolled in each session?
**Uses:** `LEFT JOIN`, `GROUP BY`, `ORDER BY`

```sql
SELECT
    s.session_id,
    c.course_title,
    COUNT(en.employee_id) AS enrollment_count
FROM Sessions AS s
JOIN Courses AS c
    ON s.course_id = c.course_id
LEFT JOIN Enrollments AS en
    ON s.session_id = en.session_id
GROUP BY s.session_id, c.course_title
ORDER BY enrollment_count DESC, s.session_id;
```

`LEFT JOIN` keeps sessions even if nobody enrolled. `COUNT(en.employee_id)` gives those sessions a count of zero.

### 3. Which departments have at least two different employees enrolled?
**Uses:** `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`

```sql
SELECT
    d.department_id,
    d.department_name,
    COUNT(DISTINCT e.employee_id) AS employee_count
FROM Departments AS d
JOIN Employees AS e
    ON d.department_id = e.department_id
JOIN Enrollments AS en
    ON e.employee_id = en.employee_id
GROUP BY d.department_id, d.department_name
HAVING COUNT(DISTINCT e.employee_id) >= 2
ORDER BY employee_count DESC, d.department_name;
```

`DISTINCT` prevents counting an employee twice when they attend multiple sessions.

**`HAVING` filters groups after counting them.**

### 4. Which employees have passed the most training hours?
**Uses:** `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`

```sql
SELECT
    e.employee_id,
    e.employee_name,
    SUM(c.course_hours) AS passed_training_hours
FROM Employees AS e
JOIN Enrollments AS en
    ON e.employee_id = en.employee_id
JOIN Sessions AS s
    ON en.session_id = s.session_id
JOIN Courses AS c
    ON s.course_id = c.course_id
WHERE en.result = 'Pass'
GROUP BY e.employee_id, e.employee_name
ORDER BY passed_training_hours DESC, e.employee_id
LIMIT 3;
```

This returns **up to three employees**. It counts hours for each passed session, including repeat sessions of the same course.

### 5. What are the three most popular courses with at least two enrollments?
**Uses all five:** `JOIN`, `GROUP BY`, `ORDER BY`, `HAVING`, `LIMIT`

```sql
SELECT
    c.course_id,
    c.course_title,
    COUNT(*) AS enrollment_count
FROM Courses AS c
JOIN Sessions AS s
    ON c.course_id = s.course_id
JOIN Enrollments AS en
    ON s.session_id = en.session_id
GROUP BY c.course_id, c.course_title
HAVING COUNT(*) >= 2
ORDER BY enrollment_count DESC, c.course_id
LIMIT 3;
```

Here, popularity means **total enrollments across all sessions**, not unique employees.

### Quick reminder

| Clause | What it does |
|---|---|
| `JOIN` | Connects tables |
| `WHERE` | Filters individual rows |
| `GROUP BY` | Puts rows into groups |
| `HAVING` | Filters those groups |
| `ORDER BY` | Sorts the results |
| `LIMIT` | Returns only a set number of rows |

**Try this:** Change query 5 to count **different employees per course**, rather than enrollments. Which expression would you replace with `COUNT(DISTINCT ...)`?