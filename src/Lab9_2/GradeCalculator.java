package Lab9_2;
import java.util.Scanner;

public class GradeCalculator {
    public static String getLetterGrade(int score){
        return score <= 100 && score >= 90 ? "A" :
            score < 90 && score >= 80 ? "B" :
            score < 80 && score >= 70 ? "C" :
            score < 70 && score >= 60 ? "D" : 
            score < 60 && score >= 0 ? "F" : "Invalid Score";
    }
    public static double getGpa(int score){
        if(score <= 100 && score >= 90) return 4.0;
        else if (score < 90 && score >= 80) return 3.0;
        else if (score < 80 && score >= 70) return 2.0;
        else if (score < 70 && score >= 60) return 1.0;
        else if (score < 60 && score >= 0) return 0.0;
        else return -1.0;
    }
    public static void main(String[] args) {
        String stopFlag = "yes";
        int totalCredits = 0;
        double finalGpa = 0;
        Scanner sc = new Scanner(System.in);

        while(stopFlag.equals("yes")){
            System.out.print("Enter the subject name: ");
            String subjectName = sc.next();
            System.out.print("Enter subject credits: ");
            int subjectCredits = sc.nextInt();
            System.out.print("Enter the numerical score: ");
            int subjectScore = sc.nextInt();
    
            System.out.println();
            System.out.println("Grade: " + getLetterGrade(subjectScore) + " | GPA: " + getGpa(subjectScore));
            totalCredits += subjectCredits;
            finalGpa += getGpa(subjectScore) * subjectCredits;
            System.out.print("Add another subject? (yes/no): ");
            stopFlag = sc.next();
            System.out.println();
        }

        System.out.println("-----------------------------------");
        System.out.println("Calculating final GPA...");
        System.out.println("Total Credits: " + totalCredits);
        System.out.println("Your final GPA is: " + finalGpa/totalCredits);
    }
}
