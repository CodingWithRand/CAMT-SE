-- Lab 9	|	Name: Thanwisit Angsachon	|	SID: 682115018
USE om;
-- ===== 1.1 Orders with customer =====
select o.order_id, o.order_date, c.customer_last_name, c.customer_first_name
from orders o join customers c on o.customer_id = c.customer_id order by o.order_date desc;
-- rows: 47	newest order by: '2011-08-02'
-- ===== 1.2 Order 829 contents =====
select i.title, i.artist, od.order_qty, i.unit_price, (od.order_qty * i.unit_price) as line_total
from orders o
join order_details od on od.order_id = o.order_id
join items i on i.item_id = od.item_id
where o.order_id = 829;

-- find lts

select o.order_id, sum(order_qty * unit_price) as lts
from orders o
join order_details od on od.order_id = o.order_id
join items i on i.item_id = od.item_id
where o.order_id = 829;

-- order total: '65.40'

-- ===== 1.3 Everything Randall bought =====
select c.customer_last_name, o.order_id, o.order_date, i.title, od.order_qty
from customers as c 
join orders as o on c.customer_id = o.customer_id
join order_details as od on o.order_id = od.order_id
join items as i on od.item_id = i.item_id
where c.customer_last_name = 'Randall'
order by o.order_id, i.title;
-- rows: 5

-- ===== 1.4 Revenue per item =====
select i.title, sum(od.order_qty) as units_sold, sum(od.order_qty * i.unit_price) as revenue
from orders o
join order_details od on od.order_id = o.order_id
join items i on i.item_id = od.item_id
group by i.item_id
order by revenue desc
limit 3;
-- top item:
-- Umami In Concert, 233.35
-- More Songs About Structures and Comestibles, 143.60
-- Etcetera, 136.00

-- ===== 1.5 Order with no lines =====
-- inner join
select * from orders join order_details on orders.order_id = order_details.order_id;
-- rows: 68	

-- outer left join
select * from orders left join order_details on orders.order_id = order_details.order_id;
-- rows: 69	
-- because: Inner join returns 68 rows, while Left join returns 69 rows. Because inner join will return only rows with match items in both columns of the ON clause, excluding the NULL on both table, while left join will only exclude NULL on the left table (table in FROM clause), but for the right table, if there is no match from the fk from left table it allows to join with NULL. (Inner join will not allow this and exclude this row from the return rows.)

USE ex;

-- ===== 2.1 Inner join =====
select e.employee_id, e.last_name, e.first_name, d.department_name
from employees e join departments d on e.department_number = d.department_number
order by e.employee_id;
-- rows: 7	missing: Denise Watson and Paulo Locario, because: Because the missing 2 rows has the department_number = 6. There is no department with department_number = 6 in the departments table, so the inner join logic excludes those 2 rows.

-- select all employees and departments to check
-- select * from employees;
-- select * from departments;

-- ===== 2.2 Left join =====
select e.employee_id, e.last_name, e.first_name, d.department_name
from employees e left join departments d on e.department_number = d.department_number
order by e.employee_id;
-- changed: added ‘left’ before ‘join’, left table: employees

-- ===== 2.3 Department with no employees =====
select d.department_number, d.department_name
from employees e right join departments d on e.department_number = d.department_number
where e.employee_id is NULL;
-- Department with no employees -> Department number 3: Operations

-- ===== 2.4 Self join =====
select e.employee_id, e.last_name as employee, m.last_name as manager
from employees e left join employees m on e.manager_id = m.employee_id;
