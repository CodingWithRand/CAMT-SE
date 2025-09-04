import java.util.Scanner;

public class FindTheHighestScore {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number of students: ");
        int studentNum = sc.nextInt();

        String highestScoreStudent = "Tie";
        int highestScore = 0;

        while (studentNum > 0) {
            System.out.println("Enter student name: ");
            String studentName = sc.next();
            
            System.out.print("Enter student score: ");
            int studentScore = sc.nextInt();
            if(studentScore > highestScore) {
                highestScore = studentScore;
                highestScoreStudent = studentName;
            }
            studentNum--;
        }

        System.out.println("Highest score: " + highestScoreStudent + " ("+ highestScore +")");
    }
}