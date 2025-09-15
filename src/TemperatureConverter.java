import java.util.Scanner;

// My version

/*
public class TemperatureConverter {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Select conversion mode: ");
        
        String mode = input.nextLine();
        if(mode.equals("c")){
            System.out.print("Enter temperature in Fahrenhite: ");
            double tempInF = input.nextDouble();
            System.out.println("Temperature in Celsius = " + (tempInF - 32)*(5.0/9));
        }else if(mode.equals("f")){
            System.out.print("Enter temperature in Celsius: ");
            double tempInC = input.nextDouble();
            System.out.println("Temperature in Fahrenhite = " + ((tempInC*(9/5.0)) + 32));
        }else{
            System.out.println("Invalid mode");
        }
    }
}
*/

// What professor want.

public class TemperatureConverter {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Select conversion mode (C for Fahrenheit to Celsius, F for Celsius to Fahrenheit): ");
        String mode = input.nextLine();

        char conversionMode = mode.charAt(0);

        if (conversionMode == 'c') {
            System.out.print("Enter temperature in Fahrenheit: ");
            double tempInF = input.nextDouble();
            System.out.println("Temperature in Celsius = " + (tempInF - 32) * (5.0 / 9));
        } else if (conversionMode == 'f') {
            System.out.print("Enter temperature in Celsius: ");
            double tempInC = input.nextDouble();
            System.out.println("Temperature in Fahrenheit = " + ((tempInC * (9.0 / 5)) + 32));
        } else {
            System.out.println("Invalid mode");
        }

        input.close();
    }
}


// My AI modded version

/* 
public class TemperatureConverter {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Select conversion mode (C for Celsius to Fahrenheit, F for Fahrenheit to Celsius): ");
        String mode = input.nextLine();

        // Convert mode to lowercase for case-insensitive comparison
        if (mode.equalsIgnoreCase("c")) {
            System.out.print("Enter temperature in Fahrenheit: ");
            double tempInF = input.nextDouble();
            System.out.println("Temperature in Celsius = " + (tempInF - 32) * (5.0 / 9));
        } else if (mode.equalsIgnoreCase("f")) {
            System.out.print("Enter temperature in Celsius: ");
            double tempInC = input.nextDouble();
            System.out.println("Temperature in Fahrenheit = " + ((tempInC * (9.0 / 5)) + 32));
        } else {
            System.out.println("Invalid mode");
        }

        input.close(); // Close the scanner to avoid resource leaks
    }
}
*/

// What professor want modded version

/*
public class TemperatureConverter {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Select conversion mode (C for Celsius to Fahrenheit, F for Fahrenheit to Celsius): ");
        String mode = input.nextLine();

        // Use charAt() to compare the first character of the mode input
        char conversionMode = mode.charAt(0); // Get the first character

        if (conversionMode == 'c' || conversionMode == 'C') {
            System.out.print("Enter temperature in Fahrenheit: ");
            double tempInF = input.nextDouble();
            System.out.println("Temperature in Celsius = " + (tempInF - 32) * (5.0 / 9));
        } else if (conversionMode == 'f' || conversionMode == 'F') {
            System.out.print("Enter temperature in Celsius: ");
            double tempInC = input.nextDouble();
            System.out.println("Temperature in Fahrenheit = " + ((tempInC * (9.0 / 5)) + 32));
        } else {
            System.out.println("Invalid mode");
        }

        input.close(); // Close the scanner to avoid resource leaks
    }
}
*/