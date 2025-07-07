import java.util.Scanner;

//----------Lab 3
//----------(Thanwisit Angsachon and 682115018.)
//This program for calculate the area of regtangle
public class Rectangle {
    public static void main(String[] args) {
        //Int Variables
        // int length;
        // int width;
        // int area;
        //Double Variables
        double length;
        double width;
        double area;
        Scanner input = new Scanner(System.in);
        System.out.print("Enter length:");
        //length = input.nextInt();
        length = input.nextDouble();
        System.out.print("Enter width:");
        //width = input.nextInt();
        width = input.nextDouble();
        area = length * width;
        System.out.println("The area of rectangle is " + area);
    }
}
