package Lab10_2;

public class AdvancedCalculator {
    // Addition
    public static int add(int num1, int num2){
        return num1 + num2;
    }
    public static double add(double num1, double num2){
        return num1 + num2;
    }
    public static double add(int num1, double num2){
        return num1 + num2;
    }

    // Subtraction
    public static int subtract(int num1, int num2){
        return num1 - num2;
    }
    public static double subtract(double num1, double num2){
        return num1 - num2;
    }
    public static double subtract(int num1, double num2){
        return num1 - num2;
    }
    
    // Multiplication
    public static int multiply(int num1, int num2){
        return num1 * num2;
    }
    public static double multiply(double num1, double num2){
        return num1 * num2;
    }
    public static double multiply(int num1, double num2){
        return num1 * num2;
    }

    // Division
    public static double divide(int num1, int num2){
        if(num2 == 0){
            System.err.println("Error: Division by zero!");
            return 0;
        }
        return (double) num1 / num2;
    }
    public static double divide(double num1, double num2){
        if(num2 == 0){
            System.err.println("Error: Division by zero!");
            return 0;
        }
        return num1 / num2;
    }
    public static double divide(int num1, double num2){
        if(num2 == 0){
            System.err.println("Error: Division by zero!");
            return 0;
        }
        return num1 / num2;
    }

    // Exponential
    public static double power(double b, int exp){
        return Math.pow(b, exp);
    }
}