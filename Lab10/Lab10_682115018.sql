-- Lab 10 | Name: Thanwisit Angsachon | SID: 682115018
USE ap_extra;
-- ===== 1.1 =====
-- Q: Which invoices are not fully paid yet? For each, show the vendor, the invoice number, the invoice date and how much we still owe. Biggest amount first
select v.vendor_name, i.invoice_number, i.invoice_date, (i.invoice_total - i.payment_total - i.credit_total) as owe_amount
from invoices i join vendors v on i.vendor_id = v.vendor_id
where (i.invoice_total - i.payment_total - i.credit_total) > 0
order by owe_amount desc;
-- ===== 1.2.a =====
-- Q: The auditor wants every invoice from a vendor with “Inc” anywhere in its name: vendor, invoice number and amount, sorted by vendor.
select v.vendor_name, i.invoice_number, i.invoice_total
from invoices i join vendors v on i.vendor_id = v.vendor_id
where v.vendor_name like '%Inc%'
order by v.vendor_name;
-- ===== 1.2.b =====
-- Q: Zylka Design numbers its invoices 97/ followed by exactly three characters. List them. One Zylka invoice starting with 97/ does not follow that rule. Which one? Answer in a comment.
select i.invoice_number
from invoices i join vendors v on i.vendor_id = v.vendor_id
where v.vendor_name = 'Zylka Design';
-- A: Invoice number '97/553B' doesn't follow such rule. (97/ followed by exactly 3 characters)
-- ===== 1.3 =====
-- Q: Marketing wants every invoice line charged to an advertising account: the vendor, the invoice number, what the line was for, the account name and the amount. Biggest first. Take a screenshot (S1).
select v.vendor_name, i.invoice_number, il.line_item_description, gla.account_description, il.line_item_amount
from invoice_line_items il 
join invoices i on i.invoice_id = il.invoice_id 
join general_ledger_accounts gla on gla.account_number = il.account_number
join vendors v on v.vendor_id = i.vendor_id
where gla.account_description like '%Advertising%'
order by il.line_item_amount desc;

-- ===== 2.1 =====
-- Q: For every vendor in Ohio, show the city and how many invoices they have sent us. Vendors that never sent one must show 0. Most active first.
select v.vendor_name, count(i.invoice_number) as invoice_sent
from invoices i right join vendors v on v.vendor_id = i.vendor_id
where vendor_state = 'OH'
group by v.vendor_name
order by invoice_sent desc;
-- ===== 2.2 =====
-- Q: Accounting wants to clean up the chart of accounts. Which accounts with “Tax” in their description
-- have never been used on any invoice line? How many accounts in total (tax or not) have never been used? One
-- account with “Tax” in its description is not in your list: which one, and why? Answer both in comments.
select gla.account_description, count(il.account_number) as n_used
from invoice_line_items il right join general_ledger_accounts gla on gla.account_number = il.account_number
where gla.account_description like '%Tax%'
group by il.account_number, gla.account_description
-- having n_used = 0; -- all never used
-- having n_used = 0; -- tax never used
having n_used > 0; -- tax used at least once
-- A: 
-- 1. Employee FICA Taxes Payable, Employee SDI Taxes Payable, Employer FICA Taxes Payable, Employer FUTA Taxes Payable, Employer UCI Taxes Payable,
-- Federal Corporation Income Taxes, Income Taxes Payable, Medicare Taxes Payable, Sales Tax, Sales Taxes Payable, State Corporation Income Taxes, 
-- State Payroll Taxes Payable. These are 'Tax' accounts that have never been used.
-- 2. 54 accounts in total have never been used.
-- 3. The only 'Tax' account that has been used is 'Business Licenses and Taxes'
-- ===== 2.3 =====
-- Q: Customer service wants one list with every person in the old vendor contact list, even if their
-- vendor never invoiced us, and every invoice, even if we have no contact person for that vendor, matched up where
-- possible. Show the vendor id and last name of the contact, and the invoice id. How many rows are in the list?
-- Answer in a comment. (MySQL does not support FULL OUTER JOIN.)
select vc.vendor_id, vc.last_name, i.invoice_number 
from vendor_contacts vc
left join invoices i on i.vendor_id = vc.vendor_id
union
select vc.vendor_id, vc.last_name, i.invoice_number 
from vendor_contacts vc
right join invoices i on i.vendor_id = vc.vendor_id;
-- A: There are 120 rows

-- ===== 3.1 =====
-- Q: The name of each vendor’s contact person is stored in two different places. Write a query with a
-- NATURAL JOIN that shows both names side by side with the vendor name. For how many vendors do the two
-- names disagree, and which column did the NATURAL JOIN use? Answer in a comment
select v.vendor_name, v.vendor_contact_last_name, v.vendor_contact_first_name, vc.last_name, vc.first_name
from vendors v natural join vendor_contacts vc
where v.vendor_contact_last_name != vc.last_name OR v.vendor_contact_first_name != vc.first_name;
-- A: There are 8 vendors that the name in both tables are conflicting (consider both first name and last name). Natural join use column 'vendor_id'
-- ===== 3.2 =====
-- Q: Purchasing wants a planning sheet with every contact person paired with every payment term we offer. How many rows, and why exactly that number? Answer in a comment.
select v.vendor_contact_last_name, v.vendor_contact_first_name, t.terms_description
from vendors v
cross join terms t;
-- A: 610 rows returned. There are 122 vendors in the database, and 5 term plans, so the number of rows from cross join (so we pair everyone to every plan) is 122 * 5 = 610
-- ===== 3.3 =====
-- Q: A colleague wanted to count vendors with their default payment term and wrote:
-- SELECT COUNT(*) FROM vendors NATURAL JOIN terms;
-- Write the correct query. In a comment: what number does the colleague’s query give, what is the correct number, and why is the colleague’s query wrong?
SELECT terms.terms_description, COUNT(terms.terms_id) 
FROM vendors JOIN terms ON terms.terms_id = vendors.default_terms_id
GROUP BY terms.terms_id, terms.terms_description;
-- A: 
-- - The colleague's query give 610 as the output, which is over the number of vendors in the database. The correct output should be number of vendors in each term
--   (12, 30, 69, 9, 2 for due in 10, 20, 30, 60, 90 days), which must be summed up to 122 (the number of vendors in the database).
-- - The reason the query is wrong is because there are no common attribute between 2 tables, so natural join will act like cross join instead.

-- ===== 4.1 =====
-- Q: Who are our biggest suppliers? For every vendor that sent us more than one invoice, show how many invoices,
-- the total amount invoiced and how much we still owe them. Biggest total first. Take a screenshot (S2).
select v.vendor_name, count(i.invoice_id) as invoice_sent, sum((i.invoice_total - i.payment_total - i.credit_total)) as total_owed
from invoices i join vendors v using(vendor_id)
group by v.vendor_id
having invoice_sent > 1
order by invoice_sent desc, total_owed desc;
-- (order by invoice_sent first, then total_owed)
-- ===== 4.2 =====
-- Q: Where does our money go? For each account, show how many invoice lines were charged to it and
-- the total amount. Only accounts with more than 5,000 in total, biggest first.
select gla.account_description, count(il.account_number) as n_invoice_lines_charged, sum(il.line_item_amount) as total_amount_charged
from invoice_line_items il join general_ledger_accounts gla using(account_number)
group by gla.account_number
having total_amount_charged > 5000
order by total_amount_charged desc;
-- ===== 4.3 =====
-- Q: Which vendors do we pay late? For every vendor we have paid after the due date at least once,
-- show how many of its invoices we paid late and, on average, how many days late. Most late invoices first. How
-- many invoices did we pay late in total? Answer in a comment.
select v.vendor_name, count(i.invoice_id) as late_invoices, avg(datediff(i.payment_date, i.invoice_due_date)) as late_days
from invoices i join vendors v using(vendor_id)
group by v.vendor_id
having late_days > 0
order by late_days desc;
-- A: 14 invoices was paid late
-- ===== 4.4 =====
-- My Question: What do we pay for the most from which vendor and their phone number contact?
-- For each item we pay for, list how much money we spent on it, along with the vendor name and phone number contact.
select 
    v.vendor_name, 
    v.vendor_phone, 
    il.line_item_description, 
    sum(il.line_item_amount) as total_amount_paid
from invoice_line_items il join invoices i using(invoice_id) join vendors v using(vendor_id)
group by v.vendor_name, v.vendor_phone, il.line_item_description
order by total_amount_paid desc;
-- Answer: It might not mean much, but there are 2 takeaways from this data.
-- 1. We know on which service/fee/part our budget is being spent on the most. So, we can manage our budget.
-- Maybe we can spend less on this item, or spending more on this item may improve the work/product quality.
-- And also about picking/considering moving to another vendor (you will need to add this right after 'order by' though -> 'il.line_item_description asc).
-- 2. On the vendor that we buy from, we may still not have their phone number. Knowing this, we can ask for their phone number contact
-- the next time we meet up as it's easier and more professional to contact through phone call (disregard of the modern era social app in this context.)