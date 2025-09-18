package Lab9_1;
import java.util.Scanner;

public class TriangleClassifier2 {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter length of side 1: ");
        double side1 = input.nextDouble();
        System.out.print("Enter length of side 2: ");
        double side2 = input.nextDouble();
        System.out.print("Enter length of side 3: ");
        double side3 = input.nextDouble();

        int triangleType = classifyTriangle(side1, side2, side3);

        switch (triangleType) {
            case 0:
                System.out.println("The sides form a Equilateral triangle.");
                break;
            case 1:
                System.out.println("The sides form a Isosceles triangle.");
                break;
            case 2:
                System.out.println("The sides form a Scalene triangle.");
                break;
            default:
                System.out.println("These sides cannot form a valid triangle");
                break;
        }
    }

    public static int classifyTriangle(double a, double b, double c) {
        int type;
        if(a + b > c){
            if(a + c > b){
                if(b + c > a){
                    if(a == b){
                        if(a == c){
                            type = 0;
                        } else {
                            type = 1;
                        }
                    } else if (b == c) {
                        type = 1;
                    } else if (c == a) {
                        type = 1;
                    } else {
                        type = 2;
                    }
                } else {    
                    type = -1;
                }
            } else {
                type = -1;
            }
        } else {
            type = -1;
        }
        return type;
    }
}
