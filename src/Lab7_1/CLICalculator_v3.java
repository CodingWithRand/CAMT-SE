package Lab7_1;
import java.util.Scanner;

public class CLICalculator_v3 {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Welcome to CLI Calculator v3. We use switch-case & while loop this time");
        boolean exitFlag = true;
        while (exitFlag) {
            System.out.println("Select the operator (1-4)");
            System.out.println("1. Plus (+)");
            System.out.println("2. Minus (-)");
            System.out.println("3. Multiply (*)");
            System.out.println("4. Division (/)");
            System.out.println("5. Exit");
            int operatorOption = input.nextInt();
            if(operatorOption == 5) {
                System.out.println("Exiting...");
                exitFlag = false;
            } else {
                System.out.print("Enter the first number: ");
                double firstNumber = input.nextDouble();
                System.out.print("Enter the second number: ");
                double secondNumber = input.nextDouble();
            
                switch (operatorOption) {
                    case 1:
                        System.out.println(firstNumber + " + " + secondNumber + " = " + (firstNumber + secondNumber));
                        break;
                    case 2:
                        System.out.println(firstNumber + " - " + secondNumber + " = " + (firstNumber - secondNumber));
                        break;
                    case 3:
                        System.out.println(firstNumber + " * " + secondNumber + " = " + (firstNumber * secondNumber));
                        break;
                    case 4:
                        if(secondNumber == 0){
                            System.out.println("Error: Cannot divide by zero.");
                        }else{
                            System.out.println(firstNumber + " / " + secondNumber + " = " + (firstNumber / secondNumber));
                        }
                        break;
                    default:
                        System.out.println("Invalid operator");
                        break;
                }
            }
        }
    }
}
