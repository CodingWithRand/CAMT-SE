package Lab10_2;

public class TestAdvancedCalculator {
    public static void main(String[] args) {
        AdvancedCalculator calc = new AdvancedCalculator();
        System.out.println("Add int: " + calc.add(2, 3));
        System.out.println("Add double: " + calc.add(2.5, 3.5));
        System.out.println("Add int/double: " + calc.add(2, 3.5));
        System.out.println("Subtract int: " + calc.subtract(5, 2));
        System.out.println("Subtract double: " + calc.subtract(5.5, 2.2));
        System.out.println("Subtract int/double: " + calc.subtract(5, 2.2));
        System.out.println("Multiply int: " + calc.multiply(3, 4));
        System.out.println("Multiply double: " + calc.multiply(3.5, 4.5));
        System.out.println("Multiply int/double: " + calc.multiply(3, 4.5));
        System.out.println("Divide int: " + calc.divide(10, 4));
        System.out.println("Divide double: " + calc.divide(10.0, 4.0));
        System.out.println("Divide int/double: " + calc.divide(10, 4.0));
        System.out.println("Divide by zero: " + calc.divide(10, 0));
        System.out.println("Power: " + calc.power(2.0, 3));
    }
}
