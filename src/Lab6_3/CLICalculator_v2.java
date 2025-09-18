package Lab6_3;
import java.util.Scanner;

public class CLICalculator_v2 {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Welcome to CLI Calculator v2. We use switch-case this time");
        System.out.print("Enter the first number: ");
        double firstNumber = input.nextDouble();
        System.out.print("Enter the second number: ");
        double secondNumber = input.nextDouble();
        System.out.print("Enter an operator (+, -, *, /): ");
        String operator = input.next();

        switch (operator) {
            case "+":
                System.out.println(firstNumber + " " + operator + " " + secondNumber + " = " + (firstNumber + secondNumber));
                break;
            case "-":
                System.out.println(firstNumber + " " + operator + " " + secondNumber + " = " + (firstNumber - secondNumber));
                break;
            case "*":
                System.out.println(firstNumber + " " + operator + " " + secondNumber + " = " + (firstNumber * secondNumber));
                break;
            case "/":
                if(secondNumber == 0){
                    System.out.println("Error: Cannot divide by zero.");
                }else{
                    System.out.println(firstNumber + " " + operator + " " + secondNumber + " = " + (firstNumber / secondNumber));
                }
                break;
            default:
                System.out.println("Invalid operator");
                break;
        }
    }
}
