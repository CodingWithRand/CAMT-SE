# Lecture
Normalization helps increase efficiency on the queries/operations, reduce redundancy, maintenance, storage usages, and prevent anomalies.
1. Insertion anomaly: When inserting, required to insert data already appear in other rows (data duplication)
2. Deletion anomaly: When deleting, some data may be permanently disappeared, because the entire row, which also composed of others/different category of data, is deleted. (E.g. one row contains Order, Product, and Customer data, delete this row and all data's gone. Next time the Product data is needed elsewhere, it's no longer in the system.)
3. Modification anomaly: Changing data in one row forces you to update other rows as well. (Cuz the data duplication in insertion anomaly)

Functional Dependency is a relationship between 2 attributes. It usually be PK or Key attributes and other attributes. Notation: X -> Y, when X is the determinant and Y is the dependent.

All 1NF, 2NF, and 3NF are explained below.
# Rules of Thumb
- Functional Dependency: Knowing the left side gives me exactly one value on the right **OR** If you know X, there can be only one matching value of Y. (X -> Y) This is many-to-one or one-to-one (as from X)
- 1NF: One value per cell.
- 2NF: Facts depend on the whole key. (No partial dependency)
- 3NF: Non-key facts don’t depend on other non-key facts. (No transitive dependency)
## TLDR;
### My understanding
1nf is atomic value in each field, 2nf is a table must have one value depend on all the key in there (full dep, no partial dep. like from the previous example, employee_id and session_id are pk, all the attribute in that table must depend on both key, so department_id that only depend on employee_id must go elsewhere), and 3nf is no transitive dependency. (potentially a key that is still depended on the PK)
### AI (Matthew - GPT 6.1) adjustment
Yes—**you’ve got the main ideas!** Just a few wording fixes:

### 1NF: one value per cell
Correct. No lists or repeating groups inside a cell.

### 2NF: depend on the whole key
Correct—with this wording:

> **Every non-key attribute must depend on the whole candidate key, not just part of it.**

In `Enrollments`, **`(employee_id, session_id)` is one combined key**, not two separate primary keys.

- `result` needs both → stays.
- `department_id` needs only `employee_id` → moves elsewhere.

Technically, we check **all candidate keys**, not only the chosen primary key.

### 3NF: remove transitive dependencies
That’s the right practical idea for our training example. But rather than “a key that depends on the PK,” think:

> **A non-key fact depends on another non-key fact.**

For example, inside the original Employees table:

```text
employee_id → department_id → department_name
```

Move the department details into `Departments`, but **keep `department_id` in Employees as a foreign key**. A foreign key is fine—it links the tables.

### Your memory shortcut
- **1NF:** One value per cell.
- **2NF:** Facts depend on the whole key.
- **3NF:** Non-key facts don’t depend on other non-key facts.

*Extra detail: The exact 3NF rule allows `X → Y` when X is a superkey or Y belongs to a candidate key—that exception explains our 3NF-but-not-BCNF example.*
# Easy — a wildlife rescue center 🦉
## 1NF
| animal_id | animal_name | species_id | species_name | checkup_date | vet_id | vet_name | vet_phone | animal_weight_in_grams |
|---|---|---|---|---|---|---|---|---|
| A01 | Pip | S01 | Barn Owl | 2026-10-20 | V01 | Maya | 0801111111 | 450 |
| A01 | Pip | S01 | Barn Owl | 2026-10-22 | V02 | Leo | 0802222222 | 460 |
| A02 | Moss | S02 | Hedgehog | 2026-10-20 | V01 | Maya | 0801111111 | 700 |
| A03 | Luna | S01 | Barn Owl | 2026-10-22 | V02 | Leo | 0802222222 | 510 |
## Functional Dependencies
animal_id → animal_name, species_id
species_id → species_name
vet_id → vet_name, vet_phone
(animal_id, checkup_date) → vet_id, animal_weight_in_grams
## 2NF
| Table | Primary key | Other columns |
|---|---|---|
| Checkups | `(animal_id, checkup_date)` | `vet_id`, `animal_weight_in_grams` |
| Animals | `animal_id` | `animal_name`, `species_id`, `species_name` |
| Vets | `vet_id` | `vet_name`, `vet_phone` |

**Why it works:** You moved the animal details out of `Checkups`. They depend on `animal_id` alone—only **part** of its combined key.

One small distinction: separating `Vets` is usually part of the **3NF step**, because:

```text
(animal_id, checkup_date) → vet_id → vet_name, vet_phone
```

But doing that early is completely fine. **2NF doesn’t forbid you from fixing a 3NF issue too.**

There’s still one dependency to fix before all your tables reach 3NF:

```text
animal_id → species_id → species_name
```

## 3NF

Your final **3NF** tables are:

```text
Animals
- animal_id       PK
- animal_name
- species_id      FK → Species

Species
- species_id      PK
- species_name

Checkups
- animal_id       PK, FK → Animals
- checkup_date    PK
- vet_id          FK → Vets
- animal_weight_in_grams

Vets
- vet_id          PK
- vet_name
- vet_phone
```

`Checkups` has **one combined primary key: `(animal_id, checkup_date)`**. A foreign key (FK) is a column that links to another table.

The key idea: **the animal tells us its species ID; the species table tells us that species’ name.** No need to repeat the species name for every animal. ✅

# Hard — company training system 
## 1NF
| employee_id | employee_name | department_id | department_name | manager_id | manager_name | session_id | course_id | course_title | course_hours | instructor_id | instructor_name | room_id | room_name | room_capacity | session_date | result |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E01 | Ava | D01 | Engineering | M01 | Nora | S01 | C01 | First Aid | 4 | I01 | Sam | R01 | Oak Room | 20 | 2026-11-02 | Pass | 
| E01 | Ava | D01 | Engineering | M01 | Nora | S02 | C02 | Cyber Safety | 2 | I02 | Kai | R02 | Pine Room | 30 | 2026-11-03 | Pass |
| E02 | Ben | D01 | Engineering | M01 | Nora | S01 | C01 | First Aid | 4 | I01 | Sam | R01 | Oak Room | 20 | 2026-11-02 | Pending |
| E03 | Cleo | D02 | Finance | M02 | Omar | S02 | C02 | Cyber Safety | 2 | I02 | Kai | R02 | Pine Room | 30 | 2026-11-03 | Pass |
| E03 | Cleo | D02 | Finance | M02 | Omar | S03 | C01 | First Aid | 4 | I03 | Lee | R01 | Oak Room | 20 | 2026-11-05 | Pending |
## Functional Dependencies
employee_id -> employee_name, department_id
department_id  -> department_name, manager_id
manager_id -> manager_name
session_id -> course_id, instructor_id, room_id, session_date
course_id -> course_title, course_hours
instructor_id -> instructor_name
room_id -> room_name, room_capacity
(employee_id, session_id) -> result
## 2NF
| Table | Primary key | Other columns |
|---|---|---|
| Enrollments | `(employee_id, session_id)` | `result` |
| Employees | `employee_id` | `employee_name`, `department_id`, `department_name`, `manager_id`, `manager_name` |
| Sessions | `session_id` | `course_id`, `course_title`, `course_hours`, `instructor_id`, `instructor_name`, `room_id`, `room_name`, `room_capacity`, `session_date` |

### Why this satisfies 2NF
- Employee details depend on **only `employee_id`** → moved to Employees.
- Session details depend on **only `session_id`** → moved to Sessions.
- `result` needs **both employee and session** → stays in Enrollments.

There are still **indirect dependencies**, which is fine at this stage. For example:

```text
employee_id → department_id → department_name
session_id → course_id → course_title
```
## 3NF
**Yes—that’s correct!** ✅ Each dependency you listed becomes its own table, with the left side as its primary key.

Keep your **Enrollments** table from 2NF, too. Your complete 3NF design is:

```text
Employees(employee_id PK, employee_name, department_id FK)

Departments(department_id PK, department_name, manager_id FK)

Managers(manager_id PK, manager_name)

Sessions(session_id PK, course_id FK, instructor_id FK,
         room_id FK, session_date)

Courses(course_id PK, course_title, course_hours)

Instructors(instructor_id PK, instructor_name)

Rooms(room_id PK, room_name, room_capacity)

Enrollments(employee_id FK, session_id FK, result)
    PK: (employee_id, session_id)
```

**FK** means *foreign key*: a column that points to a record in another table.

You’ve now completed the whole process:
- **1NF:** One value per cell.
- **2NF:** Remove dependencies on only part of the combined key.
- **3NF:** Remove the transitive dependencies we identified.

**Eight tables, with each fact stored in the right place.** 🎉
# Extra - Beyond 3NF
You mean **Boyce–Codd Normal Form (BCNF)** 😊 These are rules for handling trickier kinds of repeated information.

You don’t always need to go higher. **3NF or BCNF is often enough for everyday database design.**

### BCNF: a stricter version of 3NF
For every meaningful dependency:

```text
X → Y
```

**X must be able to identify an entire row.** Technically, X must be a *superkey*.

Your training system already satisfies BCNF under our rules. ✅

### 4NF: separate independent lists
Imagine an employee has:
- Several skills.
- Several spoken languages.

If skills and languages are independent, combining them creates every possible pairing:

| Employee | Skill | Language |
|---|---|---|
| Ava | Coding | English |
| Ava | Coding | Thai |
| Ava | Drawing | English |
| Ava | Drawing | Thai |

Instead, use:

```text
EmployeeSkills(employee_id, skill)
EmployeeLanguages(employee_id, language)
```

**Idea: don’t mix two unrelated lists in one table.**

### 5NF: handle more complicated combinations
Imagine a table containing:

```text
Supplier, Part, Project
```

Sometimes the business rules let us split it into three pair tables:

```text
Supplier–Part
Supplier–Project
Part–Project
```

But this is safe **only if joining them recreates exactly the original valid combinations**, without inventing any.

**Idea: split complicated relationships only when nothing is lost or falsely added.**

### 6NF: no further lossless splitting
A table is broken into pieces so small that it cannot be split further without losing information.

This can be useful when tracking facts that change separately over time—for example, an employee’s department and salary.

**Idea: keep separately changing facts separate.**

### 7NF?
**There is no widely accepted standard “7NF.”** Some sources use the name for special proposals, so you would need to check their definition.

### Quick memory guide

| Form | Main idea |
|---|---|
| BCNF | Every meaningful determinant is a superkey |
| 4NF | Separate independent lists |
| 5NF | Handle complex combinations without false rows |
| 6NF | No further lossless splitting |
| 7NF | No widely accepted standard definition |

*Extra detail: Higher normal forms are not automatically better for every application—more tables can also make queries harder to write.*