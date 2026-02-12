package Lab8;

import java.util.Scanner;

public class Triangle extends GeometricObject {
    private double s1;
    private double s2;
    private double s3;

    // omit all the other possible constructors for now.
    public Triangle(double s1, double s2, double s3, String color, boolean filled) {
        this.s1 = s1;
        this.s2 = s2;
        this.s3 = s3;
        setColor(color);
        setFilled(filled);
    }

    @Override
    public double getPerimeter() {
        return s1 + s2 + s3;
    }

    @Override
    public double getArea() {
        // use heron's formula
        double semiP = getPerimeter() / 2;
        return Math.sqrt(semiP * (semiP - s1) * (semiP - s2) * (semiP - s3));
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter three sides of the triangle: ");
        double s1 = sc.nextDouble();
        double s2 = sc.nextDouble();
        double s3 = sc.nextDouble();
        System.out.print("Enter color of the triangle: ");
        String color = sc.next();
        System.out.print("Is the triangle filled (true/false): ");
        boolean filled = sc.nextBoolean();
        Triangle triangle = new Triangle(s1, s2, s3, color, filled);
        System.out.println();
        System.out.println("The triangle is " + triangle.toString());
        System.out.println("Area: " + triangle.getArea());
        System.out.println("Perimeter: " + triangle.getPerimeter());
    }
}
