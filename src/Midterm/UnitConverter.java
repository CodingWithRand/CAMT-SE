package Midterm;
import java.util.Scanner;

public class UnitConverter {
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        System.out.println("Welcome to unit converter program. Here are the options we offer.");
        System.out.println("1. Kilogram to pounds\n2. Pound to kilogram\n3. Kilometer to mile\n4. Mile to kilometer");

        System.out.print("Enter your choice: ");
        int options = input.nextInt();
        System.out.print("Enter the value to be converted: ");
        double unitVal = input.nextDouble();

        switch(options){
            case 1:
                System.out.println(unitVal + " kg = " + unitVal * 2.20462 + " pounds");
                break;
            case 2:
                System.out.println(unitVal + " pounds = " + unitVal / 2.20462 + " kg");
                break;
            case 3:
                System.out.println(unitVal + " km = " + unitVal * 0.6213 + " miles");
                break;
            case 4:
                System.out.println(unitVal + " miles = " + unitVal / 0.6213 + " km");
                break;
            default:
                System.out.println("Wrong input.");
                break;
        }
    }
}