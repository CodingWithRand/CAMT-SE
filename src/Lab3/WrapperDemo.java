package Lab3;

public class WrapperDemo {
    public static void main(String[] args) {
        // 1. Min, Max
        System.out.println("int Max: " + Integer.MAX_VALUE);
        System.out.println("double Min: " + Double.MIN_VALUE);
        // 2. String -> Integer/Double
        Integer IntegerFromString = Integer.valueOf("500");
        Double DoubleFromString = Double.valueOf("123.45");
        // 3. Unbox Double to int
        System.out.println(DoubleFromString.intValue());
        // 4. parse (int)
        System.out.println(Integer.parseInt("1999"));
    }
}
