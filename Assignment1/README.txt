Thanwisit Angsachon, 682115018

How to compile?
1. open terminal, `cd` to Assignment1 folder
2. compile Main.java to with javac (Student.java will be compiled automatically together.)
Bash Code Example (# as comment)
C:\...> cd Assignment1 # Point the terminal to Assignment1 folder
C:\...\Assignment1> javac Main.java # Compile the code

How to run the program?
Run the following commands according to each test case.
Case 1: Sort numerically
> java Main -n student_data_csv.csv
Expect output:
672115005 CHETSADA KANKARN
672115012 NUT SUPAPORN
682115001 KORNNAPHAT UTTAMA
682115002 KAWINTIDA KANTONG
682115004 KANYAKORN SONGRATTANAKAJORN
...
case 2: Sort first name alphabetically (A-Z)
> java Main -f student_data_csv.csv
Expect output:
682115047 ANGKANA NUTSAWAT
682115502 AUNG HLAING PHYO 
682115014 CHAINARIN AINTHA
682115011 CHAYANGKUL PANSUWAN
682115010 CHENGAN CHI
...
case 3: Sort last name alphabetically (A-Z)
> java Main -l student_data_csv.csv
Expect output:
682115502 AUNG HLAING PHYO
682115014 CHAINARIN AINTHA
682115018 THANWISIT ANGSACHON
682115044 SUPHAPISH AUEANANCHAI
682115010 CHENGAN CHI
...

Clarification for case 3, as the first line of output AUNG HLAING PHYO doesn't have last name in the record. So, it's automatically being sorted as the first element. 