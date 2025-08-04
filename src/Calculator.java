import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        // Create a Scanner
        Scanner input = new Scanner(System.in);
        System.out.println("If x = 50 and y = 2");
        System.out.println("Please select the operator 1.plus 2.subtract 3.multiply 4.division");
        System.out.print("Enter:");
        double answer = 0;
        int x = 50;
        int y = 2;
        int menu = input.nextInt();
        switch (menu) {
            case 1:
                answer = x + y;
                System.out.print("Answer is " + answer);
                break;
            case 2:
                answer = x - y;
                System.out.print("Answer is " + answer);
                break;
            case 3:
                answer = x * y;
                System.out.print("Answer is " + answer);
                break;
            case 4:
                answer = x / y;
                System.out.print("Answer is " + answer);
                break;
            default:
                System.out.println("You put invalid choice");
                break;
        }
    }
}