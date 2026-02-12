package Lab8;

interface Colorable {
    public abstract void howToColor();
}

class Square extends GeometricObject implements Colorable {
    private double side;

    public Square() {
        this.side = 0;
    }
    
    public Square(double side) {
        this.side = side;
    }

    @Override
    public void howToColor() {
        System.out.println("Color all four sides.");
    }
    @Override
    public double getArea() {
        return this.side * this.side;
    }
    @Override
    public double getPerimeter() {
        return 4 * this.side;
    }

    public double getSide() {
        return this.side;
    }
    public void setSide(double side) {
        this.side = side;
    }
}

public class InterfacePractice {
    public static void main(String[] args) {
        Square square = new Square(10);
        System.out.println("Square area: " + square.getArea());
        square.howToColor();
    }
}