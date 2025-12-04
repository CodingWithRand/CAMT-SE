package Lab2.Rectangle;

public class MyRectangle {
    public static void main(String[] args) {
        Rectangle square = new Rectangle(5, 5);
        Rectangle non_square = new Rectangle(8, 5);
        System.out.println("square 5 x 5");
        System.out.println("Area: " + square.getArea());
        System.out.println("Perimeter: " + square.getPerimeter());
        System.out.println();
        System.out.println("non_square 8 x 5");
        System.out.println("Area: " + non_square.getArea());
        System.out.println("Perimeter: " + non_square.getPerimeter());
    }
}
