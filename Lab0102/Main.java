package Lab0102;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
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
    public static void lab1() throws FileNotFoundException {
        File f = new File("Lab0102/2026 QS World University Rankings.csv");
        try (Scanner sc = new Scanner(f)) {
            sc.nextLine();
            while(sc.hasNextLine()) {
                String line = sc.nextLine();
                if(line.contains("Université de Limoges")) {
                    UniData cmu = new UniData(line);
                    System.out.println(cmu);
                }
            }
        }
    }

    public static void lab2() throws FileNotFoundException, IOException {
        File f = new File("Lab0102/2026 QS World University Rankings.csv");
        ArrayList<UniData> uniList = new ArrayList<>();
        String header;
        try(Scanner sc = new Scanner(f)) {
            header = sc.nextLine();
            
            while(sc.hasNextLine()) {
                String line = sc.nextLine();
                uniList.add(new UniData(line));
            }
        }

        uniDataToLowerCase(uniList);
        roundScores(uniList);
        UniData[] arrayUni = uniList.toArray(new UniData[0]);
        Arrays.sort(arrayUni);
        saveUpdateFile(arrayUni, header);
    }

    public static void uniDataToLowerCase(ArrayList<UniData> uniList) {
        uniList.forEach(uni -> uni.setInstitutionName(uni.getInstitutionName().toLowerCase()));
    }

    public static void roundScores(ArrayList<UniData> uniList) {
        uniList.forEach(uni -> {
            uni.getAR().setScore(Math.round(uni.getAR().getScore()));            
            uni.setAR(uni.getAR());
            uni.getER().setScore(Math.round(uni.getER().getScore()));
            uni.setER(uni.getER());
            uni.getFSR().setScore(Math.round(uni.getFSR().getScore()));
            uni.setFSR(uni.getFSR());
            uni.getCPF().setScore(Math.round(uni.getCPF().getScore()));
            uni.setCPF(uni.getCPF());
            uni.getIFR().setScore(Math.round(uni.getIFR().getScore()));
            uni.setIFR(uni.getIFR());
            uni.getISR().setScore(Math.round(uni.getISR().getScore()));
            uni.setISR(uni.getISR());
            uni.getISD().setScore(Math.round(uni.getISD().getScore()));
            uni.setISD(uni.getISD());
            uni.getIRN().setScore(Math.round(uni.getIRN().getScore()));
            uni.setIRN(uni.getIRN());
            uni.getEO().setScore(Math.round(uni.getEO().getScore()));
            uni.setEO(uni.getEO());
            uni.getSUS().setScore(Math.round(uni.getSUS().getScore()));
            uni.setSUS(uni.getSUS());
            uni.setOverallScore(Math.round(uni.getOverallScore()));
        });
    }

    public static void saveUpdateFile(UniData[] unis, String header) throws IOException {
        File nf = new File("Lab0102/QS-World-University-Rankings-2024_updated.csv");
        nf.createNewFile();
        try(PrintWriter pw = new PrintWriter(nf)){
            pw.println(header);
            for(UniData uni: unis) {
                pw.println(String.format(
                    "%d,%d,%s,%s,%s,%s,%s,%s,%s,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f,%d,%.1f",
                    uni.getCurrentRank().getStartRank(),
                    uni.getPreviousRank().getStartRank(),
                    uni.getInstitutionName(),
                    uni.getCountry(),
                    uni.getRegion(),
                    uni.getSize(),
                    uni.getFocus(),
                    uni.getResearch(),
                    uni.getStatus(),
                    uni.getAR().getScore(),
                    uni.getAR().getRankObj().getStartRank(),
                    uni.getER().getScore(),
                    uni.getER().getRankObj().getStartRank(),
                    uni.getFSR().getScore(),
                    uni.getFSR().getRankObj().getStartRank(),
                    uni.getCPF().getScore(),
                    uni.getCPF().getRankObj().getStartRank(),
                    uni.getIFR().getScore(),
                    uni.getIFR().getRankObj().getStartRank(),
                    uni.getISR().getScore(),
                    uni.getISR().getRankObj().getStartRank(),
                    uni.getISD().getScore(),
                    uni.getISD().getRankObj().getStartRank(),
                    uni.getIRN().getScore(),
                    uni.getIRN().getRankObj().getStartRank(),
                    uni.getEO().getScore(),
                    uni.getEO().getRankObj().getStartRank(),
                    uni.getSUS().getScore(),
                    uni.getSUS().getRankObj().getStartRank(),
                    uni.getOverallScore()
                ));
            }
        }
    }

    public static void main(String[] args) throws FileNotFoundException, IOException {
        lab2();
    }
}
