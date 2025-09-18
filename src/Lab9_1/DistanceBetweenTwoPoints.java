package Lab9_1;
import java.util.Scanner;

public class DistanceBetweenTwoPoints {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter point1 coords");
        System.out.print("x1: ");
        double x1 = sc.nextDouble();
        System.out.print("y1: ");
        double y1 = sc.nextDouble();
        System.out.println("Enter point2 coords");
        System.out.print("x2: ");
        double x2 = sc.nextDouble();
        System.out.print("y2: ");
        double y2 = sc.nextDouble();

        System.out.println("The distance between point1 and point2 is " + distance(x1, x2, y1, y2));
    }

    public static double distance(double x1, double x2, double y1, double y2){
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1-y2), 2));
    }
}
