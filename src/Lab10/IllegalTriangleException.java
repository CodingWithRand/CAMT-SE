package Lab10;

import java.util.Scanner;

class Triangle extends GeometricObject {
    private double s1;
    private double s2;
    private double s3;

    public Triangle(double s1, double s2, double s3) throws IllegalTriangleException {
        if(s1 + s2 <= s3 || s1 + s3 <= s2 || s2 + s3 <= s1) throw new IllegalTriangleException();
        this.s1 = s1;
        this.s2 = s2;
        this.s3 = s3;
    }

    @Override
    public double getPerimeter() {
        return this.s1 + this.s2 + this.s3;
    }

    @Override
    public double getArea() {
        // use heron's formula
        double semiP = getPerimeter() / 2;
        return Math.sqrt(semiP * (semiP - this.s1) * (semiP - this.s2) * (semiP - this.s3));
    }
}

public class IllegalTriangleException extends Exception {
    public IllegalTriangleException() {
        super("Illegal Triangle");
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Side 1: ");
        double s1 = sc.nextDouble();
        System.out.print("Side 2: ");
        double s2 = sc.nextDouble();
        System.out.print("Side 3: ");
        double s3 = sc.nextDouble();

        try {
            Triangle t = new Triangle(s1, s2, s3);
            System.out.println("Perimeter for triangle: " + t.getPerimeter());
            System.out.println("Area for triangle: " + t.getArea());
        } catch (IllegalTriangleException e) {
            System.out.println(e.getMessage());
        }
    }
}
