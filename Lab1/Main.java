package Lab1;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

/*
Part 1 Answers
1) (1 point) What are the meta data for the given data? please list all
= 2026 Rank, Previous Rank, Institution Name, Country/Territory, Region, Size, Focus, Research, Status, AR SCORE, AR RANK, ER SCORE, ER RANK, FSR SCORE, FSR RANK, CPF SCORE, CPF RANK, IFR SCORE, IFR RANK, ISR SCORE, ISR RANK, ISD SCORE, ISD RANK, IRN SCORE, IRN RANK, EO SCORE, EO RANK, SUS SCORE, SUS RANK, Overall SCORE

2) (1 point) List all the data type of each attribute

2026 Rank = Integer
Previous Rank = Integer
Institution Name = String
Country/Territory = String
Region = String
Size = String
Focus = String
Research = String
Status = String
AR SCORE = Double
AR RANK = Integer
ER SCORE = Double
ER RANK = Integer
FSR SCORE = Double
FSR RANK = Integer
CPF SCORE = Double
CPF RANK = Integer
IFR SCORE = Double
IFR RANK = Integer
ISR SCORE = Double
ISR RANK = Integer
ISD SCORE = Double
ISD RANK = Integer
IRN SCORE = Double
IRN RANK = Integer
EO SCORE = Double
EO RANK = Integer
SUS SCORE = Double
SUS RANK = Integer
Overall SCORE = Double
*/

public class Main {
    public static void main(String[] args) throws FileNotFoundException {
        File f = new File("Lab1/2026 QS World University Rankings.csv");
        Scanner sc = new Scanner(f);
        // String header = sc.nextLine();

        while(sc.hasNextLine()) {
            String line = sc.nextLine();
            if(line.contains("Chiang Mai University")) {
                UniData cmu = new UniData(line);
                System.out.println(cmu);
            }
        }
    }
}
