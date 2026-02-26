package Lab10;

import java.util.Scanner;

public class InputMismatchException {
    public static void work() throws java.util.InputMismatchException {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter an integer: ");
        int i1 = sc.nextInt();
        int i2 = sc.nextInt();
        System.out.println("The number entered is " + (i1+i2));
    }
    public static void main(String[] args) {
        while(true) {
            try {
                work();
                break;
            } catch (java.util.InputMismatchException e) {
                System.out.println("Try again. (Incorrect Input: an integer is required)");
            }
        }
    }
}
