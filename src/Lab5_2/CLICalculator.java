package Lab5_2;
import java.util.Scanner;

public class CLICalculator {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter the first number: ");
        double firstNumber = input.nextDouble();
        System.out.print("Enter an operator (+, -, *, /): ");
        char operator = input.next().charAt(0);
        System.out.print("Enter the second number: ");
        double secondNumber = input.nextDouble();
        
        if(operator == '+'){
            System.out.println("Result: " + (firstNumber + secondNumber));
        }else if(operator == '-'){
            System.out.println("Result: " + (firstNumber - secondNumber));
        }else if(operator == '*'){
            System.out.println("Result: " + (firstNumber * secondNumber));
        }else if(operator == '/'){
            if(secondNumber == 0){
                System.out.println("Error: Cannot divide by zero.");
            }else{
                System.out.println("Result: " + (firstNumber / secondNumber));
            }
        }else{
            System.out.println("Error: Invalid operator.");
        }
    }
}
