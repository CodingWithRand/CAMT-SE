-- *****************************************************
-- This script creates all 3 databases (AP, EX, and OM) 
-- for Murach's MySQL by Joel Murach 
-- *****************************************************

-- ********************************************
-- CREATE THE AP DATABASE
-- *******************************************

-- create the database
DROP DATABASE IF EXISTS ap_extra;
CREATE DATABASE ap_extra;

-- select the database
USE ap_extra;

-- create the tables
CREATE TABLE general_ledger_accounts
(
  account_number        INT            PRIMARY KEY,
  account_description   VARCHAR(50)    UNIQUE
);

CREATE TABLE terms
(
  terms_id              INT            PRIMARY KEY   AUTO_INCREMENT,
  terms_description     VARCHAR(50)    NOT NULL,
  terms_due_days        INT            NOT NULL
);

CREATE TABLE vendors
(
  vendor_id                     INT            PRIMARY KEY   AUTO_INCREMENT,
  vendor_name                   VARCHAR(50)    NOT NULL      UNIQUE,
  vendor_address1               VARCHAR(50),
  vendor_address2               VARCHAR(50),
  vendor_city                   VARCHAR(50)    NOT NULL,
  vendor_state                  CHAR(2)        NOT NULL,
  vendor_zip_code               VARCHAR(20)    NOT NULL,
  vendor_phone                  VARCHAR(50),
  vendor_contact_last_name      VARCHAR(50),
  vendor_contact_first_name     VARCHAR(50),
  default_terms_id              INT            NOT NULL,
  default_account_number        INT            NOT NULL,
  CONSTRAINT vendors_fk_terms
    FOREIGN KEY (default_terms_id)
    REFERENCES terms (terms_id),
  CONSTRAINT vendors_fk_accounts
    FOREIGN KEY (default_account_number)
    REFERENCES general_ledger_accounts (account_number)
);

CREATE TABLE invoices
(
  invoice_id            INT            PRIMARY KEY   AUTO_INCREMENT,
  vendor_id             INT            NOT NULL,
  invoice_number        VARCHAR(50)    NOT NULL,
  invoice_date          DATE           NOT NULL,
  invoice_total         DECIMAL(9,2)   NOT NULL,
  payment_total         DECIMAL(9,2)   NOT NULL      DEFAULT 0,
  credit_total          DECIMAL(9,2)   NOT NULL      DEFAULT 0,
  terms_id              INT            NOT NULL,
  invoice_due_date      DATE           NOT NULL,
  payment_date          DATE,
  CONSTRAINT invoices_fk_vendors
    FOREIGN KEY (vendor_id)
    REFERENCES vendors (vendor_id),
  CONSTRAINT invoices_fk_terms
    FOREIGN KEY (terms_id)
    REFERENCES terms (terms_id)
);

CREATE TABLE invoice_line_items
(
  invoice_id              INT            NOT NULL,
  invoice_sequence        INT            NOT NULL,
  account_number          INT            NOT NULL,
  line_item_amount        DECIMAL(9,2)   NOT NULL,
  line_item_description   VARCHAR(100)   NOT NULL,
  CONSTRAINT line_items_pk
    PRIMARY KEY (invoice_id, invoice_sequence),
  CONSTRAINT line_items_fk_invoices
    FOREIGN KEY (invoice_id)
    REFERENCES invoices (invoice_id),
  CONSTRAINT line_items_fk_acounts
    FOREIGN KEY (account_number)
    REFERENCES general_ledger_accounts (account_number)
);

-- create the indexes
CREATE INDEX invoices_invoice_date_ix
  ON invoices (invoice_date DESC);

-- create some test tables that aren't explicitly
-- related to the previous five tables
CREATE TABLE vendor_contacts
(
  vendor_id       INT          PRIMARY KEY,
  last_name       VARCHAR(50)  NOT NULL,
  first_name      VARCHAR(50)  NOT NULL
);

CREATE TABLE invoice_archive
(
  invoice_id          INT          NOT NULL,
  vendor_id           INT          NOT NULL,
  invoice_number      VARCHAR(50)  NOT NULL,
  invoice_date        DATE         NOT NULL,
  invoice_total       DECIMAL(9,2) NOT NULL,
  payment_total       DECIMAL(9,2) NOT NULL,
  credit_total        DECIMAL(9,2) NOT NULL,
  terms_id            INT          NOT NULL,
  invoice_due_date    DATE         NOT NULL,
  payment_date        DATE
);

-- insert rows into the tables
INSERT INTO general_ledger_accounts VALUES 
(100,'Cash'), 
(110,'Accounts Receivable'), 
(120,'Book Inventory'), 
(150,'Furniture'), 
(160,'Computer Equipment'), 
(162,'Capitalized Lease'), 
(167,'Software'), 
(170,'Other Equipment'), 
(181,'Book Development'), 
(200,'Accounts Payable'), 
(205,'Royalties Payable'), 
(221,'401K Employee Contributions'), 
(230,'Sales Taxes Payable'), 
(234,'Medicare Taxes Payable'), 
(235,'Income Taxes Payable'), 
(237,'State Payroll Taxes Payable'), 
(238,'Employee FICA Taxes Payable'), 
(239,'Employer FICA Taxes Payable'), 
(241,'Employer FUTA Taxes Payable'), 
(242,'Employee SDI Taxes Payable'), 
(243,'Employer UCI Taxes Payable'), 
(251,'IBM Credit Corporation Payable'), 
(280,'Capital Stock'), 
(290,'Retained Earnings'), 
(300,'Retail Sales'), 
(301,'College Sales'), 
(302,'Trade Sales'), 
(306,'Consignment Sales'), 
(310,'Compositing Revenue'), 
(394,'Book Club Royalties'), 
(400,'Book Printing Costs'), 
(403,'Book Production Costs'), 
(500,'Salaries and Wages'), 
(505,'FICA'), 
(506,'FUTA'), 
(507,'UCI'), 
(508,'Medicare'), 
(510,'Group Insurance'), 
(520,'Building Lease'), 
(521,'Utilities'), 
(522,'Telephone'), 
(523,'Building Maintenance'), 
(527,'Computer Equipment Maintenance'), 
(528,'IBM Lease'), 
(532,'Equipment Rental'), 
(536,'Card Deck Advertising'), 
(540,'Direct Mail Advertising'), 
(541,'Space Advertising'), 
(546,'Exhibits and Shows'), 
(548,'Web Site Production and Fees'), 
(550,'Packaging Materials'), 
(551,'Business Forms'), 
(552,'Postage'), 
(553,'Freight'), 
(555,'Collection Agency Fees'), 
(556,'Credit Card Handling'), 
(565,'Bank Fees'), 
(568,'Auto License Fee'), 
(569,'Auto Expense'), 
(570,'Office Supplies'), 
(572,'Books, Dues, and Subscriptions'), 
(574,'Business Licenses and Taxes'), 
(576,'PC Software'), 
(580,'Meals'), 
(582,'Travel and Accomodations'), 
(589,'Outside Services'), 
(590,'Business Insurance'), 
(591,'Accounting'), 
(610,'Charitable Contributions'), 
(611,'Profit Sharing Contributions'), 
(620,'Interest Paid to Banks'), 
(621,'Other Interest'), 
(630,'Federal Corporation Income Taxes'), 
(631,'State Corporation Income Taxes'), 
(632,'Sales Tax');

INSERT INTO terms VALUES
(1,'Net due 10 days',10),
(2,'Net due 20 days',20),
(3,'Net due 30 days',30),
(4,'Net due 60 days',60),
(5,'Net due 90 days',90);

INSERT INTO vendors VALUES 
(1,'US Postal Service','Attn:  Supt. Window Services','PO Box 7005','Madison','WI','53707','(800) 555-1205','Alberto','Francesco',1,552), 
(2,'National Information Data Ctr','PO Box 96621',NULL,'Washington','DC','20090','(301) 555-8950','Irvin','Ania',3,540), 
(3,'Register of Copyrights','Library Of Congress',NULL,'Washington','DC','20559',NULL,'Liana','Lukas',3,403), 
(4,'Jobtrak','1990 Westwood Blvd Ste 260',NULL,'Los Angeles','CA','90025','(800) 555-8725','Quinn','Kenzie',3,572), 
(5,'Newbrige Book Clubs','3000 Cindel Drive',NULL,'Washington','NJ','07882','(800) 555-9980','Marks','Michelle',4,394), 
(6,'California Chamber Of Commerce','3255 Ramos Cir',NULL,'Sacramento','CA','95827','(916) 555-6670','Mauro','Anton',3,572), 
(7,'Towne Advertiser''s Mailing Svcs','Kevin Minder','3441 W Macarthur Blvd','Santa Ana','CA','92704',NULL,'Maegen','Ted',3,540), 
(8,'BFI Industries','PO Box 9369',NULL,'Fresno','CA','93792','(559) 555-1551','Kaleigh','Erick',3,521), 
(9,'Pacific Gas & Electric','Box 52001',NULL,'San Francisco','CA','94152','(800) 555-6081','Anthoni','Kaitlyn',3,521), 
(10,'Robbins Mobile Lock And Key','4669 N Fresno',NULL,'Fresno','CA','93726','(559) 555-9375','Leigh','Bill',2,523), 
(11,'Bill Marvin Electric Inc','4583 E Home',NULL,'Fresno','CA','93703','(559) 555-5106','Hostlery','Kaitlin',2,523), 
(12,'City Of Fresno','PO Box 2069',NULL,'Fresno','CA','93718','(559) 555-9999','Mayte','Kendall',3,574), 
(13,'Golden Eagle Insurance Co','PO Box 85826',NULL,'San Diego','CA','92186',NULL,'Blanca','Korah',3,590), 
(14,'Expedata Inc','4420 N. First Street, Suite 108',NULL,'Fresno','CA','93726','(559) 555-9586','Quintin','Marvin',3,589), 
(15,'ASC Signs','1528 N Sierra Vista',NULL,'Fresno','CA','93703',NULL,'Darien','Elisabeth',1,546), 
(16,'Internal Revenue Service',NULL,NULL,'Fresno','CA','93888',NULL,'Aileen','Joan',1,235), 
(17,'Blanchard & Johnson Associates','27371 Valderas',NULL,'Mission Viejo','CA','92691','(214) 555-3647','Keeton','Gonzalo',3,540), 
(18,'Fresno Photoengraving Company','1952 "H" Street','P.O. Box 1952','Fresno','CA','93718','(559) 555-3005','Chaddick','Derek',3,403), 
(19,'Crown Printing','1730 "H" St',NULL,'Fresno','CA','93721','(559) 555-7473','Randrup','Leann',2,400), 
(20,'Diversified Printing & Pub','2632 Saturn St',NULL,'Brea','CA','92621','(714) 555-4541','Lane','Vanesa',3,400), 
(21,'The Library Ltd','7700 Forsyth',NULL,'St Louis','MO','63105','(314) 555-8834','Marques','Malia',3,540), 
(22,'Micro Center','1555 W Lane Ave',NULL,'Columbus','OH','43221','(614) 555-4435','Evan','Emily',2,160), 
(23,'Yale Industrial Trucks-Fresno','3711 W Franklin',NULL,'Fresno','CA','93706','(559) 555-2993','Alexis','Alexandro',3,532), 
(24,'Zee Medical Service Co','4221 W Sierra Madre #104',NULL,'Washington','IA','52353',NULL,'Hallie','Juliana',3,570), 
(25,'California Data Marketing','2818 E Hamilton',NULL,'Fresno','CA','93721','(559) 555-3801','Jonessen','Moises',4,540), 
(26,'Small Press','121 E Front St - 4th Floor',NULL,'Traverse City','MI','49684',NULL,'Colette','Dusty',3,540), 
(27,'Rich Advertising','12 Daniel Road',NULL,'Fairfield','NJ','07004','(201) 555-9742','Neil','Ingrid',3,540), 
(29,'Vision Envelope & Printing','PO Box 3100',NULL,'Gardena','CA','90247','(310) 555-7062','Raven','Jamari',3,551), 
(30,'Costco','Fresno Warehouse','4500 W Shaw','Fresno','CA','93711',NULL,'Jaquan','Aaron',3,570), 
(31,'Enterprise Communications Inc','1483 Chain Bridge Rd, Ste 202',NULL,'Mclean','VA','22101','(770) 555-9558','Lawrence','Eileen',2,536), 
(32,'RR Bowker','PO Box 31',NULL,'East Brunswick','NJ','08810','(800) 555-8110','Essence','Marjorie',3,532), 
(33,'Nielson','Ohio Valley Litho Division','Location #0470','Cincinnati','OH','45264',NULL,'Brooklynn','Keely',2,541), 
(34,'IBM','PO Box 61000',NULL,'San Francisco','CA','94161','(800) 555-4426','Camron','Trentin',1,160), 
(35,'Cal State Termite','PO Box 956',NULL,'Selma','CA','93662','(559) 555-1534','Hunter','Demetrius',2,523), 
(36,'Graylift','PO Box 2808',NULL,'Fresno','CA','93745','(559) 555-6621','Sydney','Deangelo',3,532), 
(37,'Blue Cross','PO Box 9061',NULL,'Oxnard','CA','93031','(800) 555-0912','Eliana','Nikolas',3,510), 
(38,'Venture Communications Int''l','60 Madison Ave',NULL,'New York','NY','10010','(212) 555-4800','Neftaly','Thalia',3,540), 
(39,'Custom Printing Company','PO Box 7028',NULL,'St Louis','MO','63177','(301) 555-1494','Myles','Harley',3,540), 
(40,'Nat Assoc of College Stores','500 East Lorain Street',NULL,'Oberlin','OH','44074',NULL,'Bernard','Lucy',3,572), 
(41,'Shields Design','415 E Olive Ave',NULL,'Fresno','CA','93728','(559) 555-8060','Kerry','Rowan',2,403), 
(42,'Opamp Technical Books','1033 N Sycamore Ave.',NULL,'Los Angeles','CA','90038','(213) 555-4322','Paris','Gideon',3,572), 
(43,'Capital Resource Credit','PO Box 39046',NULL,'Minneapolis','MN','55439','(612) 555-0057','Maxwell','Jayda',3,589), 
(44,'Courier Companies, Inc','PO Box 5317',NULL,'Boston','MA','02206','(508) 555-6351','Antavius','Troy',4,400), 
(45,'Naylor Publications Inc','PO Box 40513',NULL,'Jacksonville','FL','32231','(800) 555-6041','Gerald','Kristofer',3,572), 
(46,'Open Horizons Publishing','Book Marketing Update','PO Box 205','Fairfield','IA','52556','(515) 555-6130','Damien','Deborah',2,540), 
(47,'Baker & Taylor Books','Five Lakepointe Plaza, Ste 500','2709 Water Ridge Parkway','Charlotte','NC','28217','(704) 555-3500','Bernardo','Brittnee',3,572), 
(48,'Fresno County Tax Collector','PO Box 1192',NULL,'Fresno','CA','93715','(559) 555-3482','Brenton','Kila',3,574), 
(49,'Mcgraw Hill Companies','PO Box 87373',NULL,'Chicago','IL','60680','(614) 555-3663','Holbrooke','Rashad',3,572), 
(50,'Publishers Weekly','Box 1979',NULL,'Marion','OH','43305','(800) 555-1669','Carrollton','Priscilla',3,572), 
(51,'Blue Shield of California','PO Box 7021',NULL,'Anaheim','CA','92850','(415) 555-5103','Smith','Kylie',3,510), 
(52,'Aztek Label','Accounts Payable','1150 N Tustin Ave','Anaheim','CA','92807','(714) 555-9000','Griffin','Brian',3,551), 
(53,'Gary McKeighan Insurance','3649 W Beechwood Ave #101',NULL,'Fresno','CA','93711','(559) 555-2420','Jair','Caitlin',3,590), 
(54,'Ph Photographic Services','2384 E Gettysburg',NULL,'Fresno','CA','93726','(559) 555-0765','Cheyenne','Kaylea',3,540), 
(55,'Quality Education Data','PO Box 95857',NULL,'Chicago','IL','60694','(800) 555-5811','Misael','Kayle',2,540), 
(56,'Springhouse Corp','PO Box 7247-7051',NULL,'Philadelphia','PA','19170','(215) 555-8700','Maeve','Clarence',3,523), 
(57,'The Windows Deck','117 W Micheltorena Top Floor',NULL,'Santa Barbara','CA','93101','(800) 555-3353','Wood','Liam',3,536), 
(58,'Fresno Rack & Shelving Inc','4718 N Bendel Ave',NULL,'Fresno','CA','93722',NULL,'Baylee','Dakota',2,523), 
(59,'Publishers Marketing Assoc','627 Aviation Way',NULL,'Manhatttan Beach','CA','90266','(310) 555-2732','Walker','Jovon',3,572), 
(60,'The Mailers Guide Co','PO Box 1550',NULL,'New Rochelle','NY','10802',NULL,'Lacy','Karina',3,540), 
(61,'American Booksellers Assoc','828 S Broadway',NULL,'Tarrytown','NY','10591','(800) 555-0037','Angelica','Nashalie',3,574), 
(62,'Cmg Information Services','PO Box 2283',NULL,'Boston','MA','02107','(508) 555-7000','Randall','Yash',3,540), 
(63,'Lou Gentile''s Flower Basket','722 E Olive Ave',NULL,'Fresno','CA','93728','(559) 555-6643','Anum','Trisha',1,570), 
(64,'Texaco','PO Box 6070',NULL,'Inglewood','CA','90312',NULL,'Oren','Grace',3,582), 
(65,'The Drawing Board','PO Box 4758',NULL,'Carol Stream','IL','60197',NULL,'Mckayla','Jeffery',2,551), 
(66,'Ascom Hasler Mailing Systems','PO Box 895',NULL,'Shelton','CT','06484',NULL,'Lewis','Darnell',3,532), 
(67,'Bill Jones','Secretary Of State','PO Box 944230','Sacramento','CA','94244',NULL,'Deasia','Tristin',3,589), 
(68,'Computer Library','3502 W Greenway #7',NULL,'Phoenix','AZ','85023','(602) 547-0331','Aryn','Leroy',3,540), 
(69,'Frank E Wilber Co','2437 N Sunnyside',NULL,'Fresno','CA','93727','(559) 555-1881','Millerton','Johnathon',3,532), 
(70,'Fresno Credit Bureau','PO Box 942',NULL,'Fresno','CA','93714','(559) 555-7900','Braydon','Anne',2,555), 
(71,'The Fresno Bee','1626 E Street',NULL,'Fresno','CA','93786','(559) 555-4442','Colton','Leah',2,572), 
(72,'Data Reproductions Corp','4545 Glenmeade Lane',NULL,'Auburn Hills','MI','48326','(810) 555-3700','Arodondo','Cesar',3,400), 
(73,'Executive Office Products','353 E Shaw Ave',NULL,'Fresno','CA','93710','(559) 555-1704','Danielson','Rachael',2,570), 
(74,'Leslie Company','PO Box 610',NULL,'Olathe','KS','66061','(800) 255-6210','Alondra','Zev',3,570), 
(75,'Retirement Plan Consultants','6435 North Palm Ave, Ste 101',NULL,'Fresno','CA','93704','(559) 555-7070','Edgardo','Salina',3,589), 
(76,'Simon Direct Inc','4 Cornwall Dr Ste 102',NULL,'East Brunswick','NJ','08816','(908) 555-7222','Bradlee','Daniel',2,540), 
(77,'State Board Of Equalization','PO Box 942808',NULL,'Sacramento','CA','94208','(916) 555-4911','Dean','Julissa',1,631), 
(78,'The Presort Center','1627 "E" Street',NULL,'Fresno','CA','93706','(559) 555-6151','Marissa','Kyle',3,540), 
(79,'Valprint','PO Box 12332',NULL,'Fresno','CA','93777','(559) 555-3112','Warren','Quentin',3,551), 
(80,'Cardinal Business Media, Inc.','P O Box 7247-7844',NULL,'Philadelphia','PA','19170','(215) 555-1500','Eulalia','Kelsey',2,540), 
(81,'Wang Laboratories, Inc.','P.O. Box 21209',NULL,'Pasadena','CA','91185','(800) 555-0344','Kapil','Robert',2,160), 
(82,'Reiter''s Scientific & Pro Books','2021 K Street Nw',NULL,'Washington','DC','20006','(202) 555-5561','Rodolfo','Carlee',2,572), 
(83,'Ingram','PO Box 845361',NULL,'Dallas','TX','75284',NULL,'Yobani','Trey',2,541), 
(84,'Boucher Communications Inc','1300 Virginia Dr. Ste 400',NULL,'Fort Washington','PA','19034','(215) 555-8000','Carson','Julian',3,540), 
(85,'Champion Printing Company','3250 Spring Grove Ave',NULL,'Cincinnati','OH','45225','(800) 555-1957','Clifford','Jillian',3,540), 
(86,'Computerworld','Department #1872','PO Box 61000','San Francisco','CA','94161','(617) 555-0700','Lloyd','Angel',1,572), 
(87,'DMV Renewal','PO Box 942894',NULL,'Sacramento','CA','94294',NULL,'Josey','Lorena',4,568), 
(88,'Edward Data Services','4775 E Miami River Rd',NULL,'Cleves','OH','45002','(513) 555-3043','Helena','Jeanette',1,540), 
(89,'Evans Executone Inc','4918 Taylor Ct',NULL,'Turlock','CA','95380',NULL,'Royce','Hannah',1,522), 
(90,'Wakefield Co','295 W Cromwell Ave Ste 106',NULL,'Fresno','CA','93711','(559) 555-4744','Rothman','Nathanael',2,170), 
(91,'McKesson Water Products','P O Box 7126',NULL,'Pasadena','CA','91109','(800) 555-7009','Destin','Luciano',2,570), 
(92,'Zip Print & Copy Center','PO Box 12332',NULL,'Fresno','CA','93777','(233) 555-6400','Javen','Justin',2,540), 
(93,'AT&T','PO Box 78225',NULL,'Phoenix','AZ','85062',NULL,'Wesley','Alisha',3,522), 
(94,'Abbey Office Furnishings','4150 W Shaw Ave',NULL,'Fresno','CA','93722','(559) 555-8300','Francis','Kyra',2,150), 
(95,'Pacific Bell',NULL,NULL,'Sacramento','CA','95887','(209) 555-7500','Nickalus','Kurt',2,522), 
(96,'Wells Fargo Bank','Business Mastercard','P.O. Box 29479','Phoenix','AZ','85038','(947) 555-3900','Damion','Mikayla',2,160), 
(97,'Compuserve','Dept L-742',NULL,'Columbus','OH','43260','(614) 555-8600','Armando','Jan',2,572), 
(98,'American Express','Box 0001',NULL,'Los Angeles','CA','90096','(800) 555-3344','Story','Kirsten',2,160), 
(99,'Bertelsmann Industry Svcs. Inc','28210 N Avenue Stanford',NULL,'Valencia','CA','91355','(805) 555-0584','Potter','Lance',3,400), 
(100,'Cahners Publishing Company','Citibank Lock Box 4026','8725 W Sahara Zone 1127','The Lake','NV','89163','(301) 555-2162','Jacobsen','Samuel',4,540), 
(101,'California Business Machines','Gallery Plz','5091 N Fresno','Fresno','CA','93710','(559) 555-5570','Rohansen','Anders',2,170), 
(102,'Coffee Break Service','PO Box 1091',NULL,'Fresno','CA','93714','(559) 555-8700','Smitzen','Jeffrey',4,570), 
(103,'Dean Witter Reynolds','9 River Pk Pl E 400',NULL,'Boston','MA','02134','(508) 555-8737','Johnson','Vance',5,589), 
(104,'Digital Dreamworks','5070 N Sixth Ste. 71',NULL,'Fresno','CA','93711',NULL,'Elmert','Ron',3,589), 
(105,'Dristas Groom & McCormick','7112 N Fresno St Ste 200',NULL,'Fresno','CA','93720','(559) 555-8484','Aaronsen','Thom',3,591), 
(106,'Ford Motor Credit Company','Dept 0419',NULL,'Los Angeles','CA','90084','(800) 555-7000','Snyder','Karen',3,582), 
(107,'Franchise Tax Board','PO Box 942857',NULL,'Sacramento','CA','94257',NULL,'Prado','Anita',4,507), 
(108,'Gostanian General Building','427 W Bedford #102',NULL,'Fresno','CA','93711','(559) 555-5100','Bragg','Walter',4,523), 
(109,'Kent H Landsberg Co','File No 72686','PO Box 61000','San Francisco','CA','94160','(916) 555-8100','Stevens','Wendy',3,540), 
(110,'Malloy Lithographing Inc','5411 Jackson Road','PO Box 1124','Ann Arbor','MI','48106','(313) 555-6113','Regging','Abe',3,400), 
(111,'Net Asset, Llc','1315 Van Ness Ave Ste. 103',NULL,'Fresno','CA','93721',NULL,'Kraggin','Laura',1,572), 
(112,'Office Depot','File No 81901',NULL,'Los Angeles','CA','90074','(800) 555-1711','Pinsippi','Val',3,570), 
(113,'Pollstar','4697 W Jacquelyn Ave',NULL,'Fresno','CA','93722','(559) 555-2631','Aranovitch','Robert',5,520), 
(114,'Postmaster','Postage Due Technician','1900 E Street','Fresno','CA','93706','(559) 555-7785','Finklestein','Fyodor',1,552), 
(115,'Roadway Package System, Inc','Dept La 21095',NULL,'Pasadena','CA','91185',NULL,'Smith','Sam',4,553), 
(116,'State of California','Employment Development Dept','PO Box 826276','Sacramento','CA','94230','(209) 555-5132','Articunia','Mercedez',1,631), 
(117,'Suburban Propane','2874 S Cherry Ave',NULL,'Fresno','CA','93706','(559) 555-2770','Spivak','Harold',3,521), 
(118,'Unocal','P.O. Box 860070',NULL,'Pasadena','CA','91186','(415) 555-7600','Bluzinski','Rachael',3,582), 
(119,'Yesmed, Inc','PO Box 2061',NULL,'Fresno','CA','93718','(559) 555-0600','Hernandez','Reba',2,589), 
(120,'Dataforms/West','1617 W. Shaw Avenue','Suite F','Fresno','CA','93711',NULL,'Church','Charlie',3,551), 
(121,'Zylka Design','3467 W Shaw Ave #103',NULL,'Fresno','CA','93711','(559) 555-8625','Ronaldsen','Jaime',3,403), 
(122,'United Parcel Service','P.O. Box 505820',NULL,'Reno','NV','88905','(800) 555-0855','Beauregard','Violet',3,553), 
(123,'Federal Express Corporation','P.O. Box 1140','Dept A','Memphis','TN','38101','(800) 555-4091','Bucket','Charlie',3,553);

INSERT INTO vendor_contacts VALUES
(5,'Davison','Michelle'),
(12,'Mayteh','Kendall'),
(17,'Onandonga','Bruce'),
(44,'Antavius','Anthony'),
(76,'Bradlee','Danny'),
(94,'Suscipe','Reynaldo'),
(101,'O''Sullivan','Geraldine'),
(123,'Bucket','Charles');

INSERT INTO invoices VALUES
(1,122,'989319-457','2011-04-08','3813.33','3813.33','0.00',3,'2011-05-08','2011-05-07'),
(2,123,'263253241','2011-04-10','40.20','40.20','0.00',3,'2011-05-10','2011-05-14'),
(3,123,'963253234','2011-04-13','138.75','138.75','0.00',3,'2011-05-13','2011-05-09'),
(4,123,'2-000-2993','2011-04-16','144.70','144.70','0.00',3,'2011-05-16','2011-05-12'),
(5,123,'963253251','2011-04-16','15.50','15.50','0.00',3,'2011-05-16','2011-05-11'),
(6,123,'963253261','2011-04-16','42.75','42.75','0.00',3,'2011-05-16','2011-05-21'),
(7,123,'963253237','2011-04-21','172.50','172.50','0.00',3,'2011-05-21','2011-05-22'),
(8,89,'125520-1','2011-04-24','95.00','95.00','0.00',1,'2011-05-04','2011-05-01'),
(9,121,'97/488','2011-04-24','601.95','601.95','0.00',3,'2011-05-24','2011-05-21'),
(10,123,'263253250','2011-04-24','42.67','42.67','0.00',3,'2011-05-24','2011-05-22'),
(11,123,'963253262','2011-04-25','42.50','42.50','0.00',3,'2011-05-25','2011-05-20'),
(12,96,'I77271-O01','2011-04-26','662.00','662.00','0.00',2,'2011-05-16','2011-05-13'),
(13,95,'111-92R-10096','2011-04-30','16.33','16.33','0.00',2,'2011-05-20','2011-05-23'),
(14,115,'25022117','2011-05-01','6.00','6.00','0.00',4,'2011-06-10','2011-06-10'),
(15,48,'P02-88D77S7','2011-05-03','856.92','856.92','0.00',3,'2011-06-02','2011-05-30'),
(16,97,'21-4748363','2011-05-03','9.95','9.95','0.00',2,'2011-05-23','2011-05-22'),
(17,123,'4-321-2596','2011-05-05','10.00','10.00','0.00',3,'2011-06-04','2011-06-05'),
(18,123,'963253242','2011-05-06','104.00','104.00','0.00',3,'2011-06-05','2011-06-05'),
(19,34,'QP58872','2011-05-07','116.54','116.54','0.00',1,'2011-05-17','2011-05-19'),
(20,115,'24863706','2011-05-10','6.00','6.00','0.00',4,'2011-06-19','2011-06-15'),
(21,119,'10843','2011-05-11','4901.26','4901.26','0.00',2,'2011-05-31','2011-05-29'),
(22,123,'963253235','2011-05-11','108.25','108.25','0.00',3,'2011-06-10','2011-06-09'),
(23,97,'21-4923721','2011-05-13','9.95','9.95','0.00',2,'2011-06-02','2011-05-28'),
(24,113,'77290','2011-05-13','1750.00','1750.00','0.00',5,'2011-07-02','2011-07-05'),
(25,123,'963253246','2011-05-13','129.00','129.00','0.00',3,'2011-06-12','2011-06-09'),
(26,123,'4-342-8069','2011-05-14','10.00','10.00','0.00',3,'2011-06-13','2011-06-13'),
(27,88,'972110','2011-05-15','207.78','207.78','0.00',1,'2011-05-25','2011-05-27'),
(28,123,'963253263','2011-05-16','109.50','109.50','0.00',3,'2011-06-15','2011-06-10'),
(29,108,'121897','2011-05-19','450.00','450.00','0.00',4,'2011-06-28','2011-07-03'),
(30,123,'1-200-5164','2011-05-20','63.40','63.40','0.00',3,'2011-06-19','2011-06-24'),
(31,104,'P02-3772','2011-05-21','7125.34','7125.34','0.00',3,'2011-06-20','2011-06-24'),
(32,121,'97/486','2011-05-21','953.10','953.10','0.00',3,'2011-06-20','2011-06-22'),
(33,105,'94007005','2011-05-23','220.00','220.00','0.00',3,'2011-06-22','2011-06-26'),
(34,123,'963253232','2011-05-23','127.75','127.75','0.00',3,'2011-06-22','2011-06-18'),
(35,107,'RTR-72-3662-X','2011-05-25','1600.00','1600.00','0.00',4,'2011-07-04','2011-07-09'),
(36,121,'97/465','2011-05-25','565.15','565.15','0.00',3,'2011-06-24','2011-06-24'),
(37,123,'963253260','2011-05-25','36.00','36.00','0.00',3,'2011-06-24','2011-06-26'),
(38,123,'963253272','2011-05-26','61.50','61.50','0.00',3,'2011-06-25','2011-06-30'),
(39,110,'0-2058','2011-05-28','37966.19','37966.19','0.00',3,'2011-06-27','2011-06-30'),
(40,121,'97/503','2011-05-30','639.77','639.77','0.00',3,'2011-06-29','2011-06-25'),
(41,123,'963253255','2011-05-31','53.75','53.75','0.00',3,'2011-06-30','2011-06-27'),
(42,123,'94007069','2011-05-31','400.00','400.00','0.00',3,'2011-06-30','2011-07-01'),
(43,72,'40318','2011-06-01','21842.00','21842.00','0.00',3,'2011-07-01','2011-06-29'),
(44,95,'111-92R-10094','2011-06-01','19.67','19.67','0.00',2,'2011-06-21','2011-06-24'),
(45,122,'989319-437','2011-06-01','2765.36','2765.36','0.00',3,'2011-07-01','2011-06-28'),
(46,37,'547481328','2011-06-03','224.00','224.00','0.00',3,'2011-07-03','2011-07-04'),
(47,83,'31359783','2011-06-03','1575.00','1575.00','0.00',2,'2011-06-23','2011-06-21'),
(48,123,'1-202-2978','2011-06-03','33.00','33.00','0.00',3,'2011-07-03','2011-07-05'),
(49,95,'111-92R-10097','2011-06-04','16.33','16.33','0.00',2,'2011-06-24','2011-06-26'),
(50,37,'547479217','2011-06-07','116.00','116.00','0.00',3,'2011-07-07','2011-07-07'),
(51,122,'989319-477','2011-06-08','2184.11','2184.11','0.00',3,'2011-07-08','2011-07-08'),
(52,34,'Q545443','2011-06-09','1083.58','1083.58','0.00',1,'2011-06-19','2011-06-23'),
(53,95,'111-92R-10092','2011-06-09','46.21','46.21','0.00',2,'2011-06-29','2011-07-02'),
(54,121,'97/553B','2011-06-10','313.55','313.55','0.00',3,'2011-07-10','2011-07-09'),
(55,123,'963253245','2011-06-10','40.75','40.75','0.00',3,'2011-07-10','2011-07-12'),
(56,86,'367447','2011-06-11','2433.00','2433.00','0.00',1,'2011-06-21','2011-06-17'),
(57,103,'75C-90227','2011-06-11','1367.50','1367.50','0.00',5,'2011-07-31','2011-07-31'),
(58,123,'963253256','2011-06-11','53.25','53.25','0.00',3,'2011-07-11','2011-07-07'),
(59,123,'4-314-3057','2011-06-11','13.75','13.75','0.00',3,'2011-07-11','2011-07-15'),
(60,122,'989319-497','2011-06-12','2312.20','2312.20','0.00',3,'2011-07-12','2011-07-09'),
(61,115,'24946731','2011-06-15','25.67','25.67','0.00',4,'2011-07-25','2011-07-26'),
(62,123,'963253269','2011-06-15','26.75','26.75','0.00',3,'2011-07-15','2011-07-11'),
(63,122,'989319-427','2011-06-16','2115.81','2115.81','0.00',3,'2011-07-16','2011-07-19'),
(64,123,'963253267','2011-06-17','23.50','23.50','0.00',3,'2011-07-17','2011-07-19'),
(65,99,'509786','2011-06-18','6940.25','6940.25','0.00',3,'2011-07-18','2011-07-15'),
(66,123,'263253253','2011-06-18','31.95','31.95','0.00',3,'2011-07-18','2011-07-21'),
(67,122,'989319-487','2011-06-20','1927.54','1927.54','0.00',3,'2011-07-20','2011-07-18'),
(68,81,'MABO1489','2011-06-21','936.93','936.93','0.00',2,'2011-07-11','2011-07-10'),
(69,80,'133560','2011-06-22','175.00','175.00','0.00',2,'2011-07-12','2011-07-16'),
(70,115,'24780512','2011-06-22','6.00','6.00','0.00',4,'2011-08-01','2011-07-29'),
(71,123,'963253254','2011-06-22','108.50','108.50','0.00',3,'2011-07-22','2011-07-20'),
(72,123,'43966316','2011-06-22','10.00','10.00','0.00',3,'2011-07-22','2011-07-17'),
(73,114,'CBM9920-M-T77109','2011-06-23','290.00','290.00','0.00',1,'2011-07-03','2011-06-29'),
(74,102,'109596','2011-06-24','41.80','41.80','0.00',4,'2011-08-03','2011-08-04'),
(75,123,'7548906-20','2011-06-24','27.00','27.00','0.00',3,'2011-07-24','2011-07-24'),
(76,123,'963253248','2011-06-24','241.00','241.00','0.00',3,'2011-07-24','2011-07-25'),
(77,121,'97/553','2011-06-25','904.14','904.14','0.00',3,'2011-07-25','2011-07-25'),
(78,121,'97/522','2011-06-28','1962.13','1762.13','200.00',3,'2011-07-28','2011-07-30'),
(79,100,'587056','2011-06-30','2184.50','2184.50','0.00',4,'2011-08-09','2011-08-07'),
(80,122,'989319-467','2011-07-01','2318.03','2318.03','0.00',3,'2011-07-31','2011-07-29'),
(81,123,'263253265','2011-07-02','26.25','26.25','0.00',3,'2011-08-01','2011-07-28'),
(82,94,'203339-13','2011-07-05','17.50','17.50','0.00',2,'2011-07-25','2011-07-27'),
(83,95,'111-92R-10093','2011-07-06','39.77','39.77','0.00',2,'2011-07-26','2011-07-22'),
(84,123,'963253258','2011-07-06','111.00','111.00','0.00',3,'2011-08-05','2011-08-05'),
(85,123,'963253271','2011-07-07','158.00','158.00','0.00',3,'2011-08-06','2011-08-11'),
(86,123,'963253230','2011-07-07','739.20','739.20','0.00',3,'2011-08-06','2011-08-06'),
(87,123,'963253244','2011-07-08','60.00','60.00','0.00',3,'2011-08-07','2011-08-09'),
(88,123,'963253239','2011-07-08','147.25','147.25','0.00',3,'2011-08-07','2011-08-11'),
(89,72,'39104','2011-07-10','85.31','0.00','0.00',3,'2011-08-09',NULL),
(90,123,'963253252','2011-07-12','38.75','38.75','0.00',3,'2011-08-11','2011-08-11'),
(91,95,'111-92R-10095','2011-07-15','32.70','32.70','0.00',2,'2011-08-04','2011-08-06'),
(92,117,'111897','2011-07-15','16.62','16.62','0.00',3,'2011-08-14','2011-08-14'),
(93,123,'4-327-7357','2011-07-16','162.75','162.75','0.00',3,'2011-08-15','2011-08-11'),
(94,123,'963253264','2011-07-18','52.25','0.00','0.00',3,'2011-08-17',NULL),
(95,82,'C73-24','2011-07-19','600.00','600.00','0.00',2,'2011-08-08','2011-08-13'),
(96,110,'P-0259','2011-07-19','26881.40','26881.40','0.00',3,'2011-08-18','2011-08-20'),
(97,90,'97-1024A','2011-07-20','356.48','356.48','0.00',2,'2011-08-09','2011-08-07'),
(98,83,'31361833','2011-07-21','579.42','0.00','0.00',2,'2011-08-10',NULL),
(99,123,'263253268','2011-07-21','59.97','0.00','0.00',3,'2011-08-20',NULL),
(100,123,'263253270','2011-07-22','67.92','0.00','0.00',3,'2011-08-21',NULL),
(101,123,'263253273','2011-07-22','30.75','0.00','0.00',3,'2011-08-21',NULL),
(102,110,'P-0608','2011-07-23','20551.18','0.00','1200.00',3,'2011-08-22',NULL),
(103,122,'989319-417','2011-07-23','2051.59','2051.59','0.00',3,'2011-08-22','2011-08-24'),
(104,123,'263253243','2011-07-23','44.44','44.44','0.00',3,'2011-08-22','2011-08-24'),
(105,106,'9982771','2011-07-24','503.20','0.00','0.00',3,'2011-08-23',NULL),
(106,110,'0-2060','2011-07-24','23517.58','21221.63','2295.95',3,'2011-08-23','2011-08-27'),
(107,122,'989319-447','2011-07-24','3689.99','3689.99','0.00',3,'2011-08-23','2011-08-19'),
(108,123,'963253240','2011-07-24','67.00','67.00','0.00',3,'2011-08-23','2011-08-23'),
(109,121,'97/222','2011-07-25','1000.46','1000.46','0.00',3,'2011-08-24','2011-08-22'),
(110,80,'134116','2011-07-28','90.36','0.00','0.00',2,'2011-08-17',NULL),
(111,123,'263253257','2011-07-30','22.57','22.57','0.00',3,'2011-08-29','2011-09-03'),
(112,110,'0-2436','2011-07-31','10976.06','0.00','0.00',3,'2011-08-30',NULL),
(113,37,'547480102','2011-08-01','224.00','0.00','0.00',3,'2011-08-31',NULL),
(114,123,'963253249','2011-08-02','127.75','127.75','0.00',3,'2011-09-01','2011-09-04');

INSERT INTO invoice_line_items VALUES
(1,1,553,'3813.33','Freight'),
(2,1,553,'40.20','Freight'),
(3,1,553,'138.75','Freight'),
(4,1,553,'144.70','Int\'l shipment'),
(5,1,553,'15.50','Freight'),
(6,1,553,'42.75','Freight'),
(7,1,553,'172.50','Freight'),
(8,1,522,'95.00','Telephone service'),
(9,1,403,'601.95','Cover design'),
(10,1,553,'42.67','Freight'),
(11,1,553,'42.50','Freight'),
(12,1,580,'50.00','DiCicco\'s'),
(12,2,570,'75.60','Kinko\'s'),
(12,3,570,'58.40','Office Max'),
(12,4,540,'478.00','Publishers Marketing'),
(13,1,522,'16.33','Telephone (line 5)'),
(14,1,553,'6.00','Freight out'),
(15,1,574,'856.92','Property Taxes'),
(16,1,572,'9.95','Monthly access fee'),
(17,1,553,'10.00','Address correction'),
(18,1,553,'104.00','Freight'),
(19,1,160,'116.54','MVS Online Library'),
(20,1,553,'6.00','Freight out'),
(21,1,589,'4901.26','Office lease'),
(22,1,553,'108.25','Freight'),
(23,1,572,'9.95','Monthly access fee'),
(24,1,520,'1750.00','Warehouse lease'),
(25,1,553,'129.00','Freight'),
(26,1,553,'10.00','Freight'),
(27,1,540,'207.78','Prospect list'),
(28,1,553,'109.50','Freight'),
(29,1,523,'450.00','Back office additions'),
(30,1,553,'63.40','Freight'),
(31,1,589,'7125.34','Web site design'),
(32,1,403,'953.10','Crash Course revision'),
(33,1,591,'220.00','Form 571-L'),
(34,1,553,'127.75','Freight'),
(35,1,507,'1600.00','Income Tax'),
(36,1,403,'565.15','Crash Course Ad'),
(37,1,553,'36.00','Freight'),
(38,1,553,'61.50','Freight'),
(39,1,400,'37966.19','CICS Desk Reference'),
(40,1,403,'639.77','Card deck'),
(41,1,553,'53.75','Freight'),
(42,1,553,'400.00','Freight'),
(43,1,400,'21842.00','Book repro'),
(44,1,522,'19.67','Telephone (Line 3)'),
(45,1,553,'2765.36','Freight'),
(46,1,510,'224.00','Health Insurance'),
(47,1,572,'1575.00','Catalog ad'),
(48,1,553,'33.00','Freight'),
(49,1,522,'16.33','Telephone (line 6)'),
(50,1,510,'116.00','Health Insurance'),
(51,1,553,'2184.11','Freight'),
(52,1,160,'1083.58','MSDN'),
(53,1,522,'46.21','Telephone (Line 1)'),
(54,1,403,'313.55','Card revision'),
(55,1,553,'40.75','Freight'),
(56,1,572,'2433.00','Card deck'),
(57,1,589,'1367.50','401K Contributions'),
(58,1,553,'53.25','Freight'),
(59,1,553,'13.75','Freight'),
(60,1,553,'2312.20','Freight'),
(61,1,553,'25.67','Freight out'),
(62,1,553,'26.75','Freight'),
(63,1,553,'2115.81','Freight'),
(64,1,553,'23.50','Freight'),
(65,1,400,'6940.25','OS Utilities'),
(66,1,553,'31.95','Freight'),
(67,1,553,'1927.54','Freight'),
(68,1,160,'936.93','Quarterly Maintenance'),
(69,1,540,'175.00','Card deck advertising'),
(70,1,553,'6.00','Freight'),
(71,1,553,'108.50','Freight'),
(72,1,553,'10.00','Address correction'),
(73,1,552,'290.00','International pkg.'),
(74,1,570,'41.80','Coffee'),
(75,1,553,'27.00','Freight'),
(76,1,553,'241.00','Int\'l shipment'),
(77,1,403,'904.14','Cover design'),
(78,1,403,'1197.00','Cover design'),
(78,2,540,'765.13','Catalog design'),
(79,1,540,'2184.50','PC card deck'),
(80,1,553,'2318.03','Freight'),
(81,1,553,'26.25','Freight'),
(82,1,150,'17.50','Supplies'),
(83,1,522,'39.77','Telephone (Line 2)'),
(84,1,553,'111.00','Freight'),
(85,1,553,'158.00','Int\'l shipment'),
(86,1,553,'739.20','Freight'),
(87,1,553,'60.00','Freight'),
(88,1,553,'147.25','Freight'),
(89,1,400,'85.31','Book copy'),
(90,1,553,'38.75','Freight'),
(91,1,522,'32.70','Telephone (line 4)'),
(92,1,521,'16.62','Propane-forklift'),
(93,1,553,'162.75','International shipment'),
(94,1,553,'52.25','Freight'),
(95,1,572,'600.00','Books for research'),
(96,1,400,'26881.40','MVS JCL'),
(97,1,170,'356.48','Network wiring'),
(98,1,572,'579.42','Catalog ad'),
(99,1,553,'59.97','Freight'),
(100,1,553,'67.92','Freight'),
(101,1,553,'30.75','Freight'),
(102,1,400,'20551.18','CICS book printing'),
(103,1,553,'2051.59','Freight'),
(104,1,553,'44.44','Freight'),
(105,1,582,'503.20','Bronco lease'),
(106,1,400,'23517.58','DB2 book printing'),
(107,1,553,'3689.99','Freight'),
(108,1,553,'67.00','Freight'),
(109,1,403,'1000.46','Crash Course covers'),
(110,1,540,'90.36','Card deck advertising'),
(111,1,553,'22.57','Freight'),
(112,1,400,'10976.06','VSAM book printing'),
(113,1,510,'224.00','Health Insurance'),
(114,1,553,'127.75','Freight');

-- ********************************************
-- CREATE THE EX DATABASE
-- *******************************************

-- create the database
DROP DATABASE IF EXISTS ex;
CREATE DATABASE ex;

-- select the database
USE ex;

-- example tables for chapter 3
CREATE TABLE null_sample
(
  invoice_id      INT               NOT NULL,
  invoice_total   DECIMAL(9,2),
  CONSTRAINT invoice_id_uq 
    UNIQUE (invoice_id)
);

INSERT INTO null_sample VALUES 
(1,125),
(2,0),
(3,null),
(4,2199.99),
(5,0);

-- example tables for chapter 4
CREATE TABLE departments
(
  department_number   INT           NOT NULL,
  department_name     VARCHAR(50)   NOT NULL,
  CONSTRAINT department_number_unq  
    UNIQUE (department_number)
);

INSERT INTO departments VALUES 
(1,'Accounting'),
(2,'Payroll'),
(3,'Operations'),
(4,'Personnel'),
(5,'Maintenance');

CREATE TABLE employees
(
  employee_id         INT               NOT NULL,
  last_name           VARCHAR(35)       NOT NULL,
  first_name          VARCHAR(35)       NOT NULL,
  department_number   INT               NOT NULL,
  manager_id          INT
);

INSERT INTO employees VALUES 
(1,'Smith','Cindy',2,null),
(2,'Jones','Elmer',4,1),
(3,'Simonian','Ralph',2,2),
(4,'Hernandez','Olivia',1,9),
(5,'Aaronsen','Robert',2,4),
(6,'Watson','Denise',6,8),
(7,'Hardy','Thomas',5,2),
(8,'O''Leary','Rhea',4,9),
(9,'Locario','Paulo',6,1);

CREATE TABLE projects
(
  project_number    VARCHAR(5)    NOT NULL,
  employee_id       INT           NOT NULL
);

INSERT INTO projects VALUES 
('P1011',8),
('P1011',4),
('P1012',3),
('P1012',1),
('P1012',5),
('P1013',6),
('P1013',9),
('P1014',10);

CREATE TABLE customers
(
  customer_id          INT               NOT NULL,
  customer_last_name   VARCHAR(30),
  customer_first_name  VARCHAR(30),
  customer_address     VARCHAR(60),
  customer_city        VARCHAR(15),
  customer_state       VARCHAR(15),
  customer_zip         VARCHAR(10),
  customer_phone       VARCHAR(24)
);

INSERT INTO customers VALUES 
(1, 'Anders', 'Maria', '345 Winchell Pl', 'Anderson', 'IN', '46014', '(765) 555-7878'),
(2, 'Trujillo', 'Ana', '1298 E Smathers St', 'Benton', 'AR', '72018', '(501) 555-7733'),
(3, 'Moreno', 'Antonio', '6925 N Parkland Ave', 'Puyallup', 'WA', '98373', '(253) 555-8332'),
(4, 'Hardy', 'Thomas', '83 d''Urberville Ln', 'Casterbridge', 'GA', '31209', '(478) 555-1139'),
(5, 'Berglund', 'Christina', '22717 E 73rd Ave', 'Dubuque', 'IA', '52004', '(319) 555-1139'),
(6, 'Moos', 'Hanna', '1778 N Bovine Ave', 'Peoria', 'IL', '61638', '(309) 555-8755'),
(7, 'Citeaux', 'Fred', '1234 Main St', 'Normal', 'IL', '61761', '(309) 555-1914'),
(8, 'Summer', 'Martin', '1877 Ete Ct', 'Frogtown', 'LA', '70563', '(337) 555-9441'),
(9, 'Lebihan', 'Laurence', '717 E Michigan Ave', 'Chicago', 'IL', '60611', '(312) 555-9441'),
(10, 'Lincoln', 'Elizabeth', '4562 Rt 78 E', 'Vancouver', 'WA', '98684', '(360) 555-2680'),
(11, 'Snyder', 'Howard', '2732 Baker Blvd.', 'Eugene', 'OR', '97403', '(503) 555-7555'),
(12, 'Latimer', 'Yoshi', 'City Center Plaza 516 Main St.', 'Elgin', 'OR', '97827', '(503) 555-6874'),
(13, 'Steel', 'John', '12 Orchestra Terrace', 'Walla Walla', 'WA', '99362', '(509) 555-7969'),
(14, 'Yorres', 'Jaime', '87 Polk St. Suite 5', 'San Francisco', 'CA', '94117', '(415) 555-5938'),
(15, 'Wilson', 'Fran', '89 Chiaroscuro Rd.', 'Portland', 'OR', '97219', '(503) 555-9573'),
(16, 'Phillips', 'Rene', '2743 Bering St.', 'Anchorage', 'AK', '99508', '(907) 555-7584'),
(17, 'Wilson', 'Paula', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', '(505) 555-5939'),
(18, 'Pavarotti', 'Jose', '187 Suffolk Ln.', 'Boise', 'ID', '83720', '(208) 555-8097'),
(19, 'Braunschweiger', 'Art', 'P.O. Box 555', 'Lander', 'WY', '82520', '(307) 555-4680'),
(20, 'Nixon', 'Liz', '89 Jefferson Way Suite 2', 'Providence', 'RI', '02909', '(401) 555-3612'),
(21, 'Wong', 'Liu', '55 Grizzly Peak Rd.', 'Butte', 'MT', '59801', '(406) 555-5834'),
(22, 'Nagy', 'Helvetius', '722 DaVinci Blvd.', 'Concord', 'MA', '01742', '(351) 555-1219'),
(23, 'Jablonski', 'Karl', '305 - 14th Ave. S. Suite 3B', 'Seattle', 'WA', '98128', '(206) 555-4112'),
(24, 'Chelan', 'Donna', '2299 E Baylor Dr', 'Dallas', 'TX', '75224', '(469) 555-8828');

-- example tables for chapter 7

CREATE TABLE color_sample
(
  color_id         INT           NOT NULL     AUTO_INCREMENT,
  color_number     INT           NOT NULL     DEFAULT 0,
  color_name       VARCHAR(50),
  CONSTRAINT color_sample_pk
    PRIMARY KEY (color_id)
);


INSERT INTO color_sample (color_number)
VALUES (606);

INSERT INTO color_sample (color_name)
VALUES ('Yellow');

INSERT INTO color_sample
VALUES (3, DEFAULT, 'Orange');

INSERT INTO color_sample
VALUES (4, 808, NULL);

INSERT INTO color_sample
VALUES (5, DEFAULT, NULL);



-- example tables for chapter 8
CREATE TABLE string_sample
(
  emp_id        VARCHAR(3),
  emp_name      VARCHAR(25)
);

INSERT INTO string_sample VALUES 
('1', 'Lizbeth Darien'),
('2', 'Darnell O''Sullivan'),
('17', 'Lance Pinos-Potter'),
('20', 'Jean Paul Renard'),
('3', 'Alisha von Strump');

CREATE TABLE float_sample
(
  float_id       INT,
  float_value    DOUBLE
);

INSERT INTO float_sample VALUES 
(1, 0.999999999999999),
(2, 1),
(3, 1.000000000000001),
(4, 1234.56789012345),
(5, 999.04440209348),
(6, 24.04849);

CREATE TABLE date_sample
(
  date_id       INT       NOT NULL,
  start_date    DATETIME
);

INSERT INTO date_sample VALUES 
(1, '1979-03-01 00:00:00'),
(2, '1999-02-28 00:00:00'),
(3, '2003-10-31 00:00:00'),
(4, '2011-02-28 10:00:00'),
(5, '2012-02-28 13:58:32'),
(6, '2012-03-01 09:02:25');

CREATE TABLE active_invoices
(
  invoice_id        INT           NOT NULL,
  vendor_id         INT           NOT NULL,
  invoice_number    VARCHAR(50)   NOT NULL,
  invoice_date      DATE          NOT NULL,
  invoice_total     DECIMAL(9,2)  NOT NULL,
  payment_total     DECIMAL(9,2)  NOT NULL,
  credit_total      DECIMAL(9,2)  NOT NULL,
  terms_id          INT           NOT NULL,
  invoice_due_date  DATE          NOT NULL,
  payment_date      DATE
);

INSERT INTO active_invoices VALUES 
(3, 110, 'P-0608', '2011-04-11', '20551.18', '0.00', '1200.00', 5, '2011-06-30', NULL),
(6, 122, '989319-497', '2011-04-17', '2312.20', '0.00', '0.00', 4, '2011-06-26', NULL),
(8, 122, '989319-487', '2011-04-18', '1927.54', '0.00', '0.00', 4, '2011-06-19', NULL),
(15, 121, '97/553B', '2011-04-26', '313.55', '0.00', '0.00', 4, '2011-07-09', NULL),
(18, 121, '97/553', '2011-04-27', '904.14', '0.00', '0.00', 4, '2011-07-09', NULL),
(19, 121, '97/522', '2011-04-30', '1962.13', '0.00', '200.00', 4, '2011-07-10', NULL),
(30, 94, '203339-13', '2011-05-02', '17.50', '0.00', '0.00', 3, '2011-06-13', NULL),
(34, 110, '0-2436', '2011-05-07', '10976.06', '0.00', '0.00', 4, '2011-07-17', NULL),
(38, 123, '963253272', '2011-05-09', '61.50', '0.00', '0.00', 4, '2011-06-29', NULL),
(39, 123, '963253271', '2011-05-09', '158.00', '0.00', '0.00', 4, '2011-06-28', NULL),
(40, 123, '963253269', '2011-05-09', '26.75', '0.00', '0.00', 4, '2011-06-25', NULL),
(41, 123, '963253267', '2011-05-09', '23.50', '0.00', '0.00', 4, '2011-06-24', NULL),
(42, 97, '21-4748363', '2011-05-09', '9.95', '0.00', '0.00', 4, '2011-06-25', NULL),
(44, 123, '963253264', '2011-05-10', '52.25', '0.00', '0.00', 4, '2011-06-23', NULL),
(45, 123, '963253263', '2011-05-10', '109.50', '0.00', '0.00', 4, '2011-06-22', NULL),
(67, 123, '43966316', '2011-05-17', '10.00', '0.00', '0.00', 3, '2011-06-19', NULL),
(68, 123, '263253273', '2011-05-17', '30.75', '0.00', '0.00', 4, '2011-06-29', NULL),
(69, 37, '547479217', '2011-05-17', '116.00', '0.00', '0.00', 3, '2011-06-22', NULL),
(70, 123, '263253270', '2011-05-18', '67.92', '0.00', '0.00', 3, '2011-06-25', NULL),
(71, 123, '263253268', '2011-05-18', '59.97', '0.00', '0.00', 3, '2011-06-24', NULL),
(72, 123, '263253265', '2011-05-18', '26.25', '0.00', '0.00', 3, '2011-06-23', NULL),
(79, 123, '963253262', '2011-05-22', '42.50', '0.00', '0.00', 3, '2011-06-21', NULL),
(81, 83, '31359783', '2011-05-23', '1575.00', '0.00', '0.00', 2, '2011-06-09', NULL),
(82, 115, '25022117', '2011-05-24', '6.00', '0.00', '0.00', 3, '2011-06-21', NULL),
(88, 86, '367447', '2011-05-31', '2433.00', '0.00', '0.00', 3, '2011-06-30', NULL),
(91, 80, '134116', '2011-06-01', '90.36', '0.00', '0.00', 3, '2011-07-02', NULL),
(94, 106, '9982771', '2011-06-03', '503.20', '0.00', '0.00', 2, '2011-06-18', NULL),
(98, 95, '111-92R-10092', '2011-06-04', '46.21', '0.00', '0.00', 1, '2011-06-29', NULL),
(99, 95, '111-92R-10093', '2011-06-05', '39.77', '0.00', '0.00', 2, '2011-06-28', NULL),
(100, 96, 'I77271-O01', '2011-06-05', '662.00', '0.00', '0.00', 2, '2011-06-24', NULL),
(103, 95, '111-92R-10094', '2011-06-06', '19.67', '0.00', '0.00', 1, '2011-06-27', NULL),
(105, 95, '111-92R-10095', '2011-06-07', '32.70', '0.00', '0.00', 3, '2011-06-26', NULL),
(106, 95, '111-92R-10096', '2011-06-08', '16.33', '0.00', '0.00', 2, '2011-06-25', NULL),
(107, 95, '111-92R-10097', '2011-06-08', '16.33', '0.00', '0.00', 1, '2011-06-24', NULL),
(109, 102, '109596', '2011-06-14', '41.80', '0.00', '0.00', 3, '2011-07-11', NULL),
(110, 72, '39104', '2011-06-20', '85.31', '0.00', '0.00', 3, '2011-07-20', NULL),
(111, 37, '547480102', '2011-05-19', '224.00', '0.00', '0.00', 3, '2011-06-24', NULL),
(112, 37, '547481328', '2011-05-20', '224.00', '0.00', '0.00', 3, '2011-06-25', NULL),
(113, 72, '40318', '2011-07-18', '21842.00', '0.00', '0.00', 3, '2011-07-20', NULL),
(114, 83, '31361833', '2011-05-23', '579.42', '0.00', '0.00', 2, '2011-06-09', NULL);

CREATE TABLE paid_invoices
(
  invoice_id        INT           NOT NULL,
  vendor_id         INT           NOT NULL,
  invoice_number    VARCHAR(50)   NOT NULL,
  invoice_date      DATE          NOT NULL,
  invoice_total     DECIMAL(9,2)  NOT NULL,
  payment_total     DECIMAL(9,2)  NOT NULL,
  credit_total      DECIMAL(9,2)  NOT NULL,
  terms_id          INT           NOT NULL,
  invoice_due_date  DATE          NOT NULL,
  payment_date      DATE
);

INSERT INTO paid_invoices VALUES
(2, 34, 'Q545443', '2011-03-14', '1083.58', '1083.58', '0.00', 4, '2011-05-23', '2011-05-14'),
(4, 110, 'P-0259', '2011-04-16', '26881.40', '26881.40', '0.00', 3, '2011-05-16', '2011-05-12'),
(5, 81, 'MABO1489', '2011-04-16', '936.93', '936.93', '0.00', 3, '2011-05-16', '2011-05-13'),
(7, 82, 'C73-24', '2011-04-17', '600.00', '600.00', '0.00', 2, '2011-05-10', '2011-05-05'),
(9, 122, '989319-477', '2011-04-19', '2184.11', '2184.11', '0.00', 4, '2011-06-12', '2011-06-07'),
(10, 122, '989319-467', '2011-04-24', '2318.03', '2318.03', '0.00', 4, '2011-06-05', '2011-05-29'),
(11, 122, '989319-457', '2011-04-24', '3813.33', '3813.33', '0.00', 3, '2011-05-29', '2011-05-20'),
(12, 122, '989319-447', '2011-04-24', '3689.99', '3689.99', '0.00', 3, '2011-05-22', '2011-05-12'),
(13, 122, '989319-437', '2011-04-24', '2765.36', '2765.36', '0.00', 2, '2011-05-15', '2011-05-03'),
(14, 122, '989319-427', '2011-04-25', '2115.81', '2115.81', '0.00', 1, '2011-05-08', '2011-05-01'),
(16, 122, '989319-417', '2011-04-26', '2051.59', '2051.59', '0.00', 1, '2011-05-01', '2011-04-28'),
(17, 90, '97-1024A', '2011-04-26', '356.48', '356.48', '0.00', 3, '2011-06-09', '2011-06-09'),
(20, 121, '97/503', '2011-04-30', '639.77', '639.77', '0.00', 4, '2011-06-11', '2011-06-05'),
(21, 121, '97/488', '2011-04-30', '601.95', '601.95', '0.00', 3, '2011-06-03', '2011-05-27'),
(22, 121, '97/486', '2011-04-30', '953.10', '953.10', '0.00', 2, '2011-05-21', '2011-05-13'),
(23, 121, '97/465', '2011-05-01', '565.15', '565.15', '0.00', 1, '2011-05-14', '2011-05-05'),
(24, 121, '97/222', '2011-05-01', '1000.46', '1000.46', '0.00', 3, '2011-06-03', '2011-05-25'),
(25, 123, '4-342-8069', '2011-05-01', '10.00', '10.00', '0.00', 4, '2011-06-10', '2011-05-27'),
(26, 123, '4-327-7357', '2011-05-01', '162.75', '162.75', '0.00', 3, '2011-05-27', '2011-05-21'),
(27, 123, '4-321-2596', '2011-05-01', '10.00', '10.00', '0.00', 2, '2011-05-20', '2011-05-11'),
(28, 123, '7548906-20', '2011-05-01', '27.00', '27.00', '0.00', 3, '2011-06-06', '2011-05-26'),
(29, 123, '4-314-3057', '2011-05-02', '13.75', '13.75', '0.00', 1, '2011-05-13', '2011-05-07'),
(31, 123, '2-000-2993', '2011-05-03', '144.70', '144.70', '0.00', 1, '2011-05-06', '2011-05-04'),
(32, 89, '125520-1', '2011-05-05', '95.00', '95.00', '0.00', 3, '2011-06-08', '2011-05-22'),
(33, 123, '1-202-2978', '2011-05-06', '33.00', '33.00', '0.00', 1, '2011-05-20', '2011-05-13'),
(35, 123, '1-200-5164', '2011-05-07', '63.40', '63.40', '0.00', 1, '2011-05-13', '2011-05-10'),
(36, 110, '0-2060', '2011-05-08', '23517.58', '21221.63', '2295.95', 3, '2011-06-09', '2011-06-10'),
(37, 110, '0-2058', '2011-05-08', '37966.19', '37966.19', '0.00', 3, '2011-06-09', '2011-05-31'),
(43, 97, '21-4923721', '2011-05-09', '9.95', '9.95', '0.00', 1, '2011-05-21', '2011-05-13'),
(46, 123, '963253261', '2011-05-10', '42.75', '42.75', '0.00', 3, '2011-06-16', '2011-06-10'),
(47, 123, '963253260', '2011-05-10', '36.00', '36.00', '0.00', 3, '2011-06-15', '2011-06-06'),
(48, 123, '963253258', '2011-05-10', '111.00', '111.00', '0.00', 3, '2011-06-11', '2011-05-31'),
(49, 123, '963253256', '2011-05-10', '53.25', '53.25', '0.00', 3, '2011-06-10', '2011-05-27'),
(50, 123, '963253255', '2011-05-11', '53.75', '53.75', '0.00', 3, '2011-06-09', '2011-06-03'),
(51, 123, '963253254', '2011-05-11', '108.50', '108.50', '0.00', 3, '2011-06-08', '2011-05-30'),
(52, 123, '963253252', '2011-05-11', '38.75', '38.75', '0.00', 3, '2011-06-07', '2011-05-27'),
(53, 123, '963253251', '2011-05-11', '15.50', '15.50', '0.00', 3, '2011-06-04', '2011-05-21'),
(54, 123, '963253249', '2011-05-12', '127.75', '127.75', '0.00', 2, '2011-06-03', '2011-05-28'),
(55, 123, '963253248', '2011-05-13', '241.00', '241.00', '0.00', 2, '2011-06-02', '2011-05-24'),
(56, 123, '963253246', '2011-05-13', '129.00', '129.00', '0.00', 2, '2011-05-31', '2011-05-20'),
(57, 123, '963253245', '2011-05-13', '40.75', '40.75', '0.00', 2, '2011-05-28', '2011-05-14'),
(58, 123, '963253244', '2011-05-13', '60.00', '60.00', '0.00', 2, '2011-05-27', '2011-05-21'),
(59, 123, '963253242', '2011-05-13', '104.00', '104.00', '0.00', 2, '2011-05-26', '2011-05-17'),
(60, 123, '963253240', '2011-05-23', '67.00', '67.00', '0.00', 1, '2011-06-03', '2011-05-28'),
(61, 123, '963253239', '2011-05-23', '147.25', '147.25', '0.00', 1, '2011-06-02', '2011-05-28'),
(62, 123, '963253237', '2011-05-23', '172.50', '172.50', '0.00', 1, '2011-05-30', '2011-05-24'),
(63, 123, '963253235', '2011-05-14', '108.25', '108.25', '0.00', 1, '2011-05-20', '2011-05-17'),
(64, 123, '963253234', '2011-05-14', '138.75', '138.75', '0.00', 1, '2011-05-19', '2011-05-16'),
(65, 123, '963253232', '2011-05-14', '127.75', '127.75', '0.00', 1, '2011-05-18', '2011-05-16'),
(66, 123, '963253230', '2011-05-15', '739.20', '739.20', '0.00', 1, '2011-05-17', '2011-05-16'),
(73, 123, '263253257', '2011-05-18', '22.57', '22.57', '0.00', 2, '2011-06-10', '2011-05-27'),
(74, 123, '263253253', '2011-05-18', '31.95', '31.95', '0.00', 2, '2011-06-07', '2011-06-01'),
(75, 123, '263253250', '2011-05-19', '42.67', '42.67', '0.00', 2, '2011-06-03', '2011-05-25'),
(76, 123, '263253243', '2011-05-20', '44.44', '44.44', '0.00', 1, '2011-05-26', '2011-05-23'),
(77, 123, '263253241', '2011-05-20', '40.20', '40.20', '0.00', 1, '2011-05-25', '2011-05-22'),
(78, 123, '94007069', '2011-05-22', '400.00', '400.00', '0.00', 3, '2011-07-01', '2011-06-25'),
(80, 105, '94007005', '2011-05-23', '220.00', '220.00', '0.00', 1, '2011-05-30', '2011-05-26'),
(83, 115, '24946731', '2011-05-25', '25.67', '25.67', '0.00', 2, '2011-06-14', '2011-05-28'),
(84, 115, '24863706', '2011-05-27', '6.00', '6.00', '0.00', 1, '2011-06-07', '2011-06-01'),
(85, 115, '24780512', '2011-05-29', '6.00', '6.00', '0.00', 1, '2011-05-31', '2011-05-30'),
(86, 88, '972110', '2011-05-30', '207.78', '207.78', '0.00', 1, '2011-06-06', '2011-06-02'),
(87, 100, '587056', '2011-05-31', '2184.50', '2184.50', '0.00', 3, '2011-06-28', '2011-06-22'),
(89, 99, '509786', '2011-05-31', '6940.25', '6940.25', '0.00', 2, '2011-06-16', '2011-06-08'),
(90, 108, '121897', '2011-06-01', '450.00', '450.00', '0.00', 2, '2011-06-19', '2011-06-14'),
(92, 80, '133560', '2011-06-01', '175.00', '175.00', '0.00', 2, '2011-06-20', '2011-06-03'),
(93, 104, 'P02-3772', '2011-06-03', '7125.34', '7125.34', '0.00', 2, '2011-06-18', '2011-06-08'),
(95, 107, 'RTR-72-3662-X', '2011-06-04', '1600.00', '1600.00', '0.00', 2, '2011-06-18', '2011-06-11'),
(96, 113, '77290', '2011-06-04', '1750.00', '1750.00', '0.00', 2, '2011-06-18', '2011-06-08'),
(97, 119, '10843', '2011-06-04', '4901.26', '4901.26', '0.00', 2, '2011-06-18', '2011-06-11'),
(101, 103, '75C-90227', '2011-06-06', '1367.50', '1367.50', '0.00', 1, '2011-06-13', '2011-06-09'),
(102, 48, 'P02-88D77S7', '2011-06-06', '856.92', '856.92', '0.00', 1, '2011-06-13', '2011-06-09'),
(104, 114, 'CBM9920-M-T77109', '2011-06-07', '290.00', '290.00', '0.00', 1, '2011-06-12', '2011-06-09'),
(108, 117, '111897', '2011-06-11', '16.62', '16.62', '0.00', 1, '2011-06-14', '2011-06-12');

-- ********************************************
-- CREATE THE OM DATABASE
-- *******************************************

-- create database
DROP DATABASE IF EXISTS om;
CREATE DATABASE om;

-- select database
USE om;

-- create tables
CREATE TABLE customers
(
  customer_id           INT             NOT NULL,
  customer_first_name   VARCHAR(50),
  customer_last_name    VARCHAR(50)     NOT NULL,
  customer_address      VARCHAR(255)    NOT NULL,
  customer_city         VARCHAR(50)     NOT NULL,
  customer_state        CHAR(2)         NOT NULL,
  customer_zip          VARCHAR(20)     NOT NULL,
  customer_phone        VARCHAR(30)     NOT NULL,
  customer_fax          VARCHAR(30),
  CONSTRAINT customers_pk 
    PRIMARY KEY (customer_id)
);

CREATE TABLE items
(
  item_id       INT             NOT NULL,
  title         VARCHAR(50)     NOT NULL,
  artist        VARCHAR(50)     NOT NULL,
  unit_price    DECIMAL(9,2)    NOT NULL,
  CONSTRAINT items_pk 
    PRIMARY KEY (item_id),
  CONSTRAINT title_artist_unq
    UNIQUE (title, artist)
);

CREATE TABLE orders
(
  order_id          INT         NOT NULL,
  customer_id       INT         NOT NULL,
  order_date        DATE        NOT NULL,
  shipped_date      DATE,
  CONSTRAINT orders_pk
    PRIMARY KEY (order_id),
  CONSTRAINT orders_fk_customers
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE order_details
(
  order_id      INT           NOT NULL,
  item_id       INT           NOT NULL,
  order_qty     INT           NOT NULL,
  CONSTRAINT order_details_pk 
    PRIMARY KEY (order_id, item_id),
  CONSTRAINT order_details_fk_orders
    FOREIGN KEY (order_id)
    REFERENCES orders (order_id),
  CONSTRAINT order_details_fk_items
    FOREIGN KEY (item_id)
    REFERENCES items (item_id)
);

-- insert rows into tables
INSERT INTO customers VALUES 
(1,'Korah','Blanca','1555 W Lane Ave','Columbus','OH','43221','6145554435','6145553928'), 
(2,'Yash','Randall','11 E Rancho Madera Rd','Madison','WI','53707','2095551205','2095552262'), 
(3,'Johnathon','Millerton','60 Madison Ave','New York','NY','10010','2125554800','NULL'), 
(4,'Mikayla','Damion','2021 K Street Nw','Washington','DC','20006','2025555561','NULL'), 
(5,'Kendall','Mayte','4775 E Miami River Rd','Cleves','OH','45002','5135553043','NULL'), 
(6,'Kaitlin','Hostlery','3250 Spring Grove Ave','Cincinnati','OH','45225','8005551957','8005552826'), 
(7,'Derek','Chaddick','9022 E Merchant Wy','Fairfield','IA','52556','5155556130','NULL'), 
(8,'Deborah','Damien','415 E Olive Ave','Fresno','CA','93728','5595558060','NULL'), 
(9,'Karina','Lacy','882 W Easton Wy','Los Angeles','CA','90084','8005557000','NULL'), 
(10,'Kurt','Nickalus','28210 N Avenue Stanford','Valencia','CA','91355','8055550584','055556689'), 
(11,'Kelsey','Eulalia','7833 N Ridge Rd','Sacramento','CA','95887','2095557500','2095551302'), 
(12,'Anders','Rohansen','12345 E 67th Ave NW','Takoma Park','MD','24512','3385556772','NULL'), 
(13,'Thalia','Neftaly','2508 W Shaw Ave','Fresno','CA','93711','5595556245','NULL'), 
(14,'Gonzalo','Keeton','12 Daniel Road','Fairfield','NJ','07004','2015559742','NULL'), 
(15,'Ania','Irvin','1099 N Farcourt St','Orange','CA','92807','7145559000','NULL'), 
(16,'Dakota','Baylee','1033 N Sycamore Ave.','Los Angeles','CA','90038','2135554322','NULL'), 
(17,'Samuel','Jacobsen','3433 E Widget Ave','Palo Alto','CA','92711','4155553434','NULL'), 
(18,'Justin','Javen','828 S Broadway','Tarrytown','NY','10591','8005550037','NULL'), 
(19,'Kyle','Marissa','789 E Mercy Ave','Phoenix','AZ','85038','9475553900','NULL'), 
(20,'Erick','Kaleigh','Five Lakepointe Plaza, Ste 500','Charlotte','NC','28217','7045553500','NULL'), 
(21,'Marvin','Quintin','2677 Industrial Circle Dr','Columbus','OH','43260','6145558600','6145557580'), 
(22,'Rashad','Holbrooke','3467 W Shaw Ave #103','Fresno','CA','93711','5595558625','5595558495'), 
(23,'Trisha','Anum','627 Aviation Way','Manhatttan Beach','CA','90266','3105552732','NULL'), 
(24,'Julian','Carson','372 San Quentin','San Francisco','CA','94161','6175550700','NULL'), 
(25,'Kirsten','Story','2401 Wisconsin Ave NW','Washington','DC','20559','2065559115','NULL');

INSERT INTO items (item_id,title,artist,unit_price) VALUES 
(1,'Umami In Concert','Umami',17.95),
(2,'Race Car Sounds','The Ubernerds',13),
(3,'No Rest For The Weary','No Rest For The Weary',16.95),
(4,'More Songs About Structures and Comestibles','No Rest For The Weary',17.95),
(5,'On The Road With Burt Ruggles','Burt Ruggles',17.5),
(6,'No Fixed Address','Sewed the Vest Pocket',16.95),
(7,'Rude Noises','Jess & Odie',13),
(8,'Burt Ruggles: An Intimate Portrait','Burt Ruggles',17.95),
(9,'Zone Out With Umami','Umami',16.95),
(10,'Etcetera','Onn & Onn',17);

INSERT INTO orders VALUES
(19, 1, '2009-10-23', '2009-10-28'),
(29, 8, '2009-11-05', '2009-11-11'),
(32, 11, '2009-11-10', '2009-11-13'),
(45, 2, '2009-11-25', '2009-11-30'),
(70, 10, '2009-12-28', '2010-01-07'),
(89, 22, '2010-01-20', '2010-01-22'),
(97, 20, '2010-01-29', '2010-02-02'),
(118, 3, '2010-02-24', '2010-02-28'),
(144, 17, '2010-03-21', '2010-03-29'),
(158, 9, '2010-04-04', '2010-04-20'),
(165, 14, '2010-04-11', '2010-04-13'),
(180, 24, '2010-04-25', '2010-05-30'),
(231, 15, '2010-06-14', '2010-06-22'),
(242, 23, '2010-06-24', '2010-07-06'),
(264, 9, '2010-07-15', '2010-07-18'),
(298, 18, '2010-08-18', '2010-09-22'),
(321, 2, '2010-09-09', '2010-10-05'),
(381, 7, '2010-11-08', '2010-11-16'),
(392, 19, '2010-11-16', '2010-11-23'),
(413, 17, '2010-12-05', '2011-01-11'),
(442, 5, '2010-12-28', '2011-01-03'),
(479, 1, '2011-01-30', '2011-03-03'),
(491, 16, '2011-02-08', '2011-02-14'),
(494, 4, '2011-02-10', '2011-02-14'),
(523, 3, '2011-03-07', '2011-03-15'),
(548, 2, '2011-03-22', '2011-04-18'),
(550, 17, '2011-03-23', '2011-04-03'),
(601, 16, '2011-04-21', '2011-04-27'),
(606, 6, '2011-04-25', '2011-05-02'),
(607, 20, '2011-04-25', '2011-05-04'),
(624, 2, '2011-05-04', '2011-05-09'),
(627, 17, '2011-05-05', '2011-05-10'),
(630, 20, '2011-05-08', '2011-05-18'),
(631, 21, '2011-05-09', '2011-05-11'),
(651, 12, '2011-05-19', '2011-06-02'),
(658, 12, '2011-05-23', '2011-06-02'),
(687, 17, '2011-06-05', '2011-06-08'),
(693, 9, '2011-06-07', '2011-06-19'),
(703, 19, '2011-06-12', '2011-06-19'),
(773, 25, '2011-07-11', '2011-07-13'),
(778, 13, '2011-07-12', '2011-07-21'),
(796, 17, '2011-07-19', '2011-07-26'),
(800, 19, '2011-07-21', '2011-07-28'),
(802, 2, '2011-07-21', '2011-07-31'),
(824, 1, '2011-08-01', NULL),
(827, 18, '2011-08-02', NULL),
(829, 9, '2011-08-02', NULL);

INSERT INTO order_details VALUES 
(381,1,1),
(601,9,1),
(442,1,1),
(523,9,1),
(630,5,1),
(778,1,1),
(693,10,1),
(118,1,1),
(264,7,1),
(607,10,1),
(624,7,1),
(658,1,1),
(800,5,1),
(158,3,1),
(321,10,1),
(687,6,1),
(827,6,1),
(144,3,1),
(264,8,1),
(479,1,2),
(630,6,2),
(796,5,1),
(97,4,1),
(601,5,1),
(773,10,1),
(800,1,1),
(29,10,1),
(70,1,1),
(97,8,1),
(165,4,1),
(180,4,1),
(231,10,1),
(392,8,1),
(413,10,1),
(491,6,1),
(494,2,1),
(606,8,1),
(607,3,1),
(651,3,1),
(703,4,1),
(796,2,1),
(802,2,1),
(802,3,1),
(824,7,2),
(829,1,1),
(550,4,1),
(796,7,1),
(829,2,1),
(693,6,1),
(29,3,1),
(32,7,1),
(242,1,1),
(298,1,1),
(479,4,1),
(548,9,1),
(627,9,1),
(778,3,1),
(687,8,1),
(19,5,1),
(89,4,1),
(242,6,1),
(264,4,1),
(550,1,1),
(631,10,1),
(693,7,3),
(824,3,1),
(829,5,1),
(829,9,1);