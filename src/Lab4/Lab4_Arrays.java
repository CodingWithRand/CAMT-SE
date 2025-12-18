package Lab4;

import java.util.Arrays;
import java.util.Scanner;

public class Lab4_Arrays {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] numbers = new int[5];
        System.out.println("Enter 5 integers:");
        for (int i = 1; i <= numbers.length; i++) {
            System.out.print("Value " + i + ": ");
            numbers[i - 1] = sc.nextInt();
        }
        Arrays.sort(numbers);
        System.out.println("Sorted Array: " + Arrays.toString(numbers));
        System.out.print("Enter a number to search for: ");
        int target = sc.nextInt();
        int foundIndex = Arrays.binarySearch(numbers, target);
        if (foundIndex < 0) {
            System.out.println(target + " not found in the array.");
        } else {
            System.out.println("Found " + target + " at index: " + foundIndex);
        }
    }
}