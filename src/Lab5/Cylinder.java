package Lab5;
import java.util.Scanner;

public class Cylinder {
    public static void main(String[] args) {
        double length;
        double radius;
        double area;
        double volume;
        Scanner input = new Scanner(System.in);
        System.out.print("Enter length: ");
        length = input.nextDouble();
        System.out.print("Enter radius: ");
        radius = input.nextDouble();
        area = radius * radius * 3.1428;
        volume = area * length;
        System.out.println("Cylinder's Volume = " + volume);
    }
}
