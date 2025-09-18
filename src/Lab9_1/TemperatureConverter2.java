package Lab9_1;
import java.util.Scanner;

public class TemperatureConverter2 {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        char conversionMode;
        do {
            conversionMode = promptUserInput(input);
            if (conversionMode == 'c') {
                System.out.print("Enter temperature in Fahrenheit: ");
                double tempInF = input.nextDouble();
                System.out.println("Temperature in Celsius = " + FTOC(tempInF));
            } else if (conversionMode == 'f') {
                System.out.print("Enter temperature in Celsius: ");
                double tempInC = input.nextDouble();
                System.out.println("Temperature in Fahrenheit = " + CTOF(tempInC));
            } else if (conversionMode != 'e') {
                System.out.println("Invalid mode");
            }
        } while (conversionMode != 'e');
        System.out.println("Exit the program...");
    }

    public static char promptUserInput(Scanner input) {
        System.out.print("Select conversion mode (C for Celsius to Fahrenheit, F for Fahrenheit to Celsius): ");
        String mode = input.next();

        return mode.toLowerCase().charAt(0);
    }

    public static double FTOC(double tf) {
        return (tf - 32) * (5.0 / 9);
    }
    public static double CTOF(double tc) {
        return (tc * (9.0 / 5)) + 32;
    }
}
