# Database Labs (953212)
## Lab1 & Lab2
Revise OOP and accessing file data (file-based database) [Lab Folder](./Lab0102/)
## Lab3
Design database -> Traditional ER Diagram [Lab File](./Lab3.docx)
## Lab4
ER Diagram again with composite entity and weak entity. [Lab Folder](./Lab4/)
## Lab5
Guided ER Diagram and EER Diagram (WARNING: HUGE AND COMPLEX AS F***)

## Midterm Practice
### EER Diagram
Given the business rules, draw the eer diagram.

**Scenario: TechEdu Academy Management System**
TechEdu Academy is an online learning platform that needs a database system to manage its courses, instructors, students, assignments, and learning resources.

1. People at the Academy
    - The system tracks all Users at the academy. For every user, the system records a unique User ID, Name (consisting of First Name and Last Name), Email (must be unique), and one or more Phone Numbers.

    - A User can be specialized into two types: Instructor or Student.

        - A user can be an instructor, a student, or both at the same time (e.g., a student who also teaches an introductory workshop). Every registered user must belong to at least one of these two roles.

    - For Instructors, the system records their Office Location and Hiring Date.

    - For Students, the system records their Enrollment Date and current GPA. Students are further categorized into two types:

        - Undergraduate Students: Must record their Major and Academic Year (e.g., Freshman, Sophomore).

        - Graduate Students: Must record their Research Topic and Advisor Name.

        - A student must be either an undergraduate or a graduate student, but cannot be both simultaneously.

2. Courses and Sections
    - An Instructor can create multiple Courses, but a course is created by exactly one instructor. Each course has a unique Course Code (e.g., CS201), a Course Name, and Credits.

    - Courses are offered as specific Sections in different semesters.

        - A section cannot exist without its parent course. A section is identified by a Section Number (e.g., Sec 01) combined with its Course Code, alongside the Semester and Year.

    - A Student can enroll in multiple sections, and a section can have many enrolled students. The system must record the Final Grade a student receives when they complete a section.

3. Assignments and Submissions
    - Each Section has multiple Assignments. Each assignment has an Assignment ID (unique within that section), a Title, a Due Date, and Max Score.

    - When a Student submits work for an Assignment in a specific Section, the system records the Submission Date, Submitted File URL, and the Score Received. (Hint: Think about the relationship between Student, Assignment, and Section/Submission).

4. Projects and Equipment
    - The academy funds various Research Projects. Each project has a unique Project ID, Title, and Budget.

    - A Graduate Student can be assigned to work on multiple projects, and a project can have multiple graduate students assigned to it. The system tracks the Hours Worked per week for each graduate student on each project.

    - Projects utilize specialized Equipment. Equipment items have an Asset Tag ID (unique), Model Name, and Purchase Cost. An equipment item is owned by exactly one project, but a project can own zero or many equipment items.

[Click to view answer](./Midterm%20Practice%20EER.drawio.png)

### Construct Relations
From the your EER diagram work, map it into relations.

[Click to view answer](./Midterm%20Practice%20Table%20Map.drawio.png)

### Extract Business Rules
Given some kinds of scenario, raw, extract business rules.

Transcript: System Discovery Call with TechCargo CEO
CEO: "Hey, thanks for jumping on. So yeah, we’re expanding fast and our current software is a total mess. Basically, we need a database to handle our core operations—clients, shipments, fleet, and warehousing.

First off, our clients. We work with all kinds of businesses. We track their company name, email, and obviously give them a Client ID in our system. Most of them give us two or three phone numbers for different departments, so we need to save those. Anyone can sign up on our portal, but they might not actually book a shipment right away. Once they do create a shipment order, we track the order number, order date, and total cost. An order only ever belongs to the client who placed it.

Now, an order isn't just one big blob. It’s made up of individual packages. Like, order #8099 might have Package 1 and Package 2. We tag them locally within the order as PKG-1, PKG-2, and so on, and track their weight and declared value. Obviously, you can’t have a package floating in the database without an order attached to it.

Inside those packages are actual inventory items—like electronic parts or apparel. We have a master catalog of items with an Item Code, description, and unit weight. One item code, say 'RES-10K', can be packed into hundreds of different packages across different orders. And a single package usually holds multiple items. We need to know exactly how many of each item are inside a specific package, otherwise customs gives us a hard time.

Moving on to our transport fleet. Everything we drive or fly has a unique VIN number and a license plate—well, planes have tail numbers, but we just store them as license plates in the system. Now, a vehicle is either a Cargo Truck or a Cargo Plane. Period. It can't be both, and every vehicle in our system fits into one of those two. For trucks, we legally have to track max axle weight and trailer type. For planes, our dispatchers need max altitude and flight certification numbers.

We hire drivers to operate these. Drivers have a Driver License ID and their full name. Over time, a driver moves around and operates different vehicles in our fleet, and a single truck gets driven by multiple drivers depending on the shift. We need to keep a historical log of when a driver was assigned to a vehicle, so we record that assignment date.

Finally, our warehouses. Each facility has a unique Warehouse Code and total storage capacity. Every warehouse is run by one Warehouse Manager. A manager is just an employee with an Employee ID and name. Here’s the thing: every warehouse must have a manager assigned to it, and a manager only runs that single warehouse—we don't let them oversee multiple sites. A manager can't exist in our manager directory unless they're actively managing a warehouse."

### My answer (What is yours?)
- Client has client id, company name, email, and multiple phone number.

- Shipment has order number, order date and total cost.

- Shipment belongs to one client, the client may or may not order a shipment.

- Package has a package number, weight and value.

- Package must be in an order.

- Item has item code, description, unit weight

- A package may holds multiple items, which we track the amount in the package, while a kind of item may be in different packages.

- Transportation vehicle records VIN and License Plate number

- There are 2 types of the vehicle. Cargo truck and cargo plane. All vehicles fit into these 2 categories and they can be only one of them.

- Cargo truck tracks max axle weight and trailer type.

- Cargo plane tracks max altitude and flight certification number.

- Driver operate the transportation vehicle. Record their driver license id, and their full name.

- Overtime driver may switch to operate different vehicles and the vehicles will be operated by different driver as well.

- The system keeps track the assignment date for when that vehicle is operated by whom.

- Warehouse has warehouse code, total storage capacity.

- Manager is an employee with employee id and name. They run a warehouse.

- A warehouse is run by a manager, and every warehouse must have a manager.

- Manager is a nobody outside warehouse management. They must actively manage the warehouse to keep being a manager. (Manager depends on the warehouse)

### AI Grading (Gemini 3.6 Flash)
**Business Rules Extraction Grade: 98 / 100**

You parsed the raw interview transcript accurately and converted all the conversational ambiguity into formal EER logic.

---

#### **Detailed Analysis & Grading Breakdown**

##### **1. Entities & Keys (Score: 25/25)**

* **Client:** Strong entity (`client_id` = PK). `phone_number` correctly identified as a multivalued attribute.
* **Shipment:** Strong entity (`order_number` = PK).
* **Package:** **Weak entity** (`package_number` = partial key) dependent on `Shipment`.
* **Item:** Strong entity (`item_code` = PK).
* **Vehicle:** Strong entity (`VIN` = PK).
* **Driver:** Strong entity (`driver_license_id` = PK).
* **Warehouse:** Strong entity (`warehouse_code` = PK).
* **Manager:** Identified correctly as an entity dependent on `Warehouse`.

---

##### **2. Specialization / Subtype Hierarchies (Score: 25/25)**

* **`Vehicle` $\rightarrow$ `Cargo Truck` / `Cargo Plane`:**
* **Disjointness:** Disjoint `{D}` (You noted: *"they can be only one of them"*).
* **Completeness:** Total `{Total}` (You noted: *"All vehicles fit into these 2 categories"*).



---

##### **3. Relationships & Cardinalities (Score: 24/25)**

* **`Client` — `Shipment`:** $1:N$, Optional at `Shipment` side (Client can exist without orders), Mandatory at `Client` side.
* **`Shipment` — `Package`:** $1:N$, Mandatory on `Package` side (Identifying relationship for weak entity).
* **`Package` — `Item`:** $M:N$, Optional/Mandatory depends on inventory rules, but correctly identified as $M:N$.
* **`Driver` — `Vehicle`:** $M:N$, Both sides optional over time.
* **`Warehouse` — `Manager`:** $1:1$, Mandatory on both sides.

---

##### **4. Relationship / Associative Attributes (Score: 24/25)**

* **`Quantity`:** Correctly placed on the $M:N$ link between `Package` and `Item`.
* **`Assignment Date`:** Correctly placed on the $M:N$ link between `Driver` and `Vehicle`.

---

#### **One Minor Refinement for Exam Perfection**

* **`Manager` as an Entity vs. Role:**
You wrote: *"Manager is a nobody outside warehouse management. They must actively manage the warehouse to keep being a manager."*
* **Database Interpretation:** Since the relationship between `Warehouse` and `Manager` is total $1:1$ on both ends, you can either model `Manager` as a **Weak Entity** dependent on `Warehouse`, or model it as a $1:1$ relationship between `Employee` and `Warehouse` with mandatory total participation on the `Manager` side. You caught the total participation constraint perfectly!



---

#### **Final Verdict**

You have mastered the entire pipeline: **Extracting Rules from Raw Specs $\rightarrow$ Designing ER/EER Diagrams $\rightarrow$ Relational Schema Table Mapping.** You are 100% ready for your exam!