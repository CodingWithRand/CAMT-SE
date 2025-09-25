package Lab10_2;

import java.util.Scanner;

public class SimpleCalculator {
    public static int add(int num1, int num2){
        return num1 + num2;
    }
    public static int add(int num1, int num2, int num3){
        return num1 + num2 + num3;
    }
    public static double add(double num1, double num2){
        return num1 + num2;
    }
    public static double add(double num1, double num2, double num3){
        return num1 + num2 + num3;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String flag = "";
        while (!flag.toLowerCase().equals("e")) {
            System.out.println("Simple Calculator with only addition");
            System.out.println("1 (2 number sum) or 2 (3 number sum)");
            int con1 = sc.nextInt();
            System.out.println("1 (int input) or 2 (double input)");
            int con2 = sc.nextInt();

            if(con2 == 1){
                int num1, num2, num3;
                if(con1 == 1){
                    System.out.print("Num1: ");
                    num1 = sc.nextInt();
                    System.out.print("Num2: ");
                    num2 = sc.nextInt();
                    System.out.printf("Adding two ints (%d + %d): %d", num1, num2, add(num1, num2));
                }else if(con1 == 2){
                    System.out.print("Num1: ");
                    num1 = sc.nextInt();
                    System.out.print("Num2: ");
                    num2 = sc.nextInt();
                    System.out.print("Num3: ");
                    num3 = sc.nextInt();
                    System.out.printf("Adding two ints (%d + %d + %d): %d", num1, num2, num3, add(num1, num2, num3));
                }
            }else if(con2 == 2){
                double num1, num2, num3;
                if(con1 == 1){
                    System.out.print("Num1: ");
                    num1 = sc.nextDouble();
                    System.out.print("Num2: ");
                    num2 = sc.nextDouble();
                    System.out.printf("Adding two ints (%f + %f): %f", num1, num2, add(num1, num2));
                }else if(con1 == 2){
                    System.out.print("Num1: ");
                    num1 = sc.nextDouble();
                    System.out.print("Num2: ");
                    num2 = sc.nextDouble();
                    System.out.print("Num3: ");
                    num3 = sc.nextDouble();
                    System.out.printf("Adding two ints (%f + %f + %f): %f", num1, num2, num3, add(num1, num2, num3));
                }
            }
            System.out.println();
        }
    }
}