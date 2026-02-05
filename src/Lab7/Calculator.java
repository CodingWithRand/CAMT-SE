package Lab7;

public class Calculator {
    public int add(int v1, int v2) {
        return v1 + v2;
    }
    public int add(int v1, int v2, int v3) {
        return v1 + v2 + v3;
    }
    public double add(double v1, double v2) {
        return v1 + v2;
    }
    public double add(double v1, double v2, double v3) {
        return v1 + v2 + v3;
    }
    public int add(int[] vs) {
        int sum = 0;
        for(int v: vs) sum += v;
        return sum;
    }
    public double add(double[] vs) {
        double sum = 0;
        for(double v: vs) sum += v;
        return sum;
    }
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        
        // Test overloaded add(int, int)
        System.out.println("=== Test add(int, int) ===");
        int result1 = calc.add(5, 10);
        System.out.println("add(5, 10) = " + result1);
        
        // Test overloaded add(int, int, int)
        System.out.println("\n=== Test add(int, int, int) ===");
        int result3 = calc.add(5, 10, 15);
        System.out.println("add(5, 10, 15) = " + result3);

        // Test overloaded add(double, double)
        System.out.println("\n=== Test add(double, double) ===");
        double result6 = calc.add(10.25, 20.75);
        System.out.println("add(10.25, 20.75) = " + result6);
        
        // Test overloaded add(double, double, double)
        System.out.println("\n=== Test add(double, double, double) ===");
        double result7 = calc.add(1.1, 2.2, 3.3);
        System.out.println("add(1.1, 2.2, 3.3) = " + result7);
        
        // Test overloaded add(int[])
        System.out.println("\n=== Test add(int[]) ===");
        int[] intArray1 = {1, 2, 3, 4, 5};
        int result9 = calc.add(intArray1);
        System.out.println("add({1, 2, 3, 4, 5}) = " + result9);
        
        // Test overloaded add(double[])
        System.out.println("\n=== Test add(double[]) ===");
        double[] doubleArray1 = {1.5, 2.5, 3.5};
        double result11 = calc.add(doubleArray1);
        System.out.println("add({1.5, 2.5, 3.5}) = " + result11);
    }
}
