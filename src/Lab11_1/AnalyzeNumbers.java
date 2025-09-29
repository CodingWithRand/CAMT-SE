package Lab11_1;

public class AnalyzeNumbers {

    // Prototype
    public static void average(java.util.Scanner input, int n, double[] numbers){
        double sum = 0;

        System.out.print("Enter the numbers: ");
        for(int i = 0; i<n; i++){
            numbers[i] = input.nextDouble();
            sum += numbers[i];
        }

        double average = sum / n;

        int count = 0;
        for (int i = 0; i<n; i++){
            if(numbers[i] > average) count++;
        }

        System.out.println("Average is " + average);
        System.out.println("Number of elements above the average is " + count);
    }

    // Checkpoint 1
    public static void minMaxAllInOne(java.util.Scanner input, int n, double[] numbers){
        System.out.print("Enter the numbers: ");
        for(int i = 0; i<n; i++){
            numbers[i] = input.nextDouble();
        }

        double max = 0;
        double min = 0;
        for (int i = 0; i<n; i++){
            if(numbers[i] > max) max = numbers[i];
            if(i == 0){
                min = numbers[i];
                System.out.print(numbers[i] + " ");
                continue;
            }
            if(numbers[i] < min) min = numbers[i];
            System.out.print(numbers[i] + " ");
        }
        System.out.println();

        System.out.println("Maximum value is " + max + " , and minimum value is " + min);
    }

    // Checkpoint 2
    public static void printArray(double[] array){
        for (int i = 0; i<array.length; i++){
            System.out.print(array[i] + " ");
        }
        System.out.println();
    }

    public static double findMax(double[] numbers){
        double max = 0;
        for (int i = 0; i<numbers.length; i++)
            if(numbers[i] > max) max = numbers[i];
        return max;
    }

    public static double findMin(double[] numbers){
        double min = 0;
        for (int i = 0; i<numbers.length; i++){
            if(i == 0){
                min = numbers[i];
                continue;
            }
            if(numbers[i] < min) min = numbers[i];
        }
        return min;
    }

    public static void minMaxMethods(java.util.Scanner input, int n, double[] numbers){
        System.out.print("Enter the numbers: ");
        for(int i = 0; i<n; i++){
            numbers[i] = input.nextDouble();
        }
        printArray(numbers);
        System.out.println("Maximum value is " + findMax(numbers) + " , and minimum value is " + findMin(numbers));
    }

    public static void main(String[] args) {
        java.util.Scanner input = new java.util.Scanner(System.in);
        System.out.print("Enter the number of items: ");
        int n = input.nextInt();
        double[] numbers = new double[n];

        // average(input, n, numbers); <-- Prototype

        // minMaxAllInOne(input, n, numbers); <-- Checkpoint 1
        // minMaxMethods(input, n, numbers); <-- Checkpoint 2

    }
}