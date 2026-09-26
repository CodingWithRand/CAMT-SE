-- Workshop

USE om;

SELECT customers.customer_id, order_id from orders join customers on orders.customer_id = customers.customer_id;

select o.order_id, o.order_date, c.customer_last_name from customers as c join orders as o on c.customer_id = o.customer_id where c.customer_last_name = 'Randall';

select o.order_id, i.title, od.order_qty, i.unit_price
from orders o
join order_details od on od.order_id = o.order_id
join items i on i.item_id = od.item_id
where o.order_id = 829;

select c.customer_last_name, o.order_id, i.title, od.order_qty
from customers c
join orders o on o.customer_id = c.customer_id
join order_details od on od.order_id = o.order_id
join items i on i.item_id = od.item_id
where o.order_id = 829;

select o.order_id, o.order_date, c.customer_last_name, c.customer_phone
from orders o
join customers c on o.customer_id = c.customer_id
where o.shipped_date is NULL
order by o.order_date;

SELECT i.title, SUM(od.order_qty) as toqty, i.unit_price
FROM orders o 
JOIN order_details od ON o.order_id = od.order_id 
JOIN items i ON od.item_id = i.item_id 
GROUP BY i.title, i.unit_price, i.item_id
ORDER BY i.item_id;

