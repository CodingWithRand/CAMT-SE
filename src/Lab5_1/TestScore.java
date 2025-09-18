package Lab5_1;
import java.util.Scanner;

public class TestScore {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter Score: ");
        int score = input.nextInt();
        // Test the score if over or equal 80
        if (score >= 80)
            System.out.println("You are passed");
        // the score is not over or equal 80
        else
            System.out.println("You are fail");
    }
}
