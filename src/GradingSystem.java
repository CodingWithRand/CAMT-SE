import java.util.Scanner;

public class GradingSystem {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Final exam scores: ");
        int finalExamScores = input.nextInt();
        System.out.print("Attendance percentage: ");
        int attendancePercentage = input.nextInt();

        if(finalExamScores > 90 && attendancePercentage >= 95) System.out.println("Pass with Distinction");
        else if(finalExamScores > 50 && (finalExamScores > 40 || attendancePercentage >= 80)) System.out.println("Pass");
        else System.out.println("Fail");
    }
}
