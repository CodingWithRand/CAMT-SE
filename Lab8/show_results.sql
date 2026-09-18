-- Part 1
use se212_university;
select * from student;
select * from course;
select * from section;
select * from enrollment;

-- Part 2
-- ===== 2.2 Vendors in NJ ===== 
use ap_extra;
select vendor_name, vendor_city, vendor_phone from vendors
where vendor_state = 'NJ' ORDER BY vendor_name ASC;

-- ===== 2.3 Orders per customer ===== 
use om;
select orders.customer_id, customers.customer_last_name, count(orders.order_id) as number_of_orders
from orders RIGHT join customers on customers.customer_id = orders.customer_id
group by customers.customer_id ORDER BY number_of_orders DESC;
