package Lab11_2;

public class ArrayPrinter {
    public static void printArray(int[] arr) {
        for(int elem: arr) System.out.print(elem + " ");
        System.out.println();
    }
    public static void printArray(double[] arr) {
        for(double elem: arr) System.out.print(elem + " ");
        System.out.println();
    }
    public static void printArray(char[] arr) {
        for(char elem: arr) System.out.print(elem + " ");
        System.out.println();
    }
    public static void printArray(String[] arr) {
        for(String elem: arr) System.out.print(elem + " ");
        System.out.println();
    }
    public static void main(String[] args) {
        int[] integerArray = {10, 20, 30, 40, 50};
        double[] doubleArray = {0.1, 9.3, 6.4, 5.0, 4.8};
        char[] chaArray = {'a', 'b', 'c', 'd', 'e'};
        String[] StringArray = {"Java", "is", "fun"};
        printArray(integerArray);
        printArray(doubleArray);
        printArray(chaArray);
        printArray(StringArray);
    }
}