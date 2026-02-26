package Lab10;

import java.util.Random;
import java.util.Scanner;

public class ArrayIndexOutOfBoundsException {
    public static int getArrayElement(int[] arr, int index) throws java.lang.ArrayIndexOutOfBoundsException {
        return arr[index];
    }
    public static void main(String[] args) {
        int[] randints = new int[100];
        Random rand = new Random();
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i<randints.length; i++) randints[i] = rand.nextInt(Integer.MAX_VALUE);

        System.out.print("Please enter index of array (0-99): ");
        int index = sc.nextInt();
        try {
            System.out.println("The value at index is " + getArrayElement(randints, index));
            System.out.println("End nicely.");
        } catch (java.lang.ArrayIndexOutOfBoundsException e) {
            System.out.println("You refer to index that does not exist.");
        }
        System.out.println("Continuing processing...");
    }
}
