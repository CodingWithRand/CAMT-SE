package Lab2.Rectangle;

public class Rectangle {
    private float height;
    private float width;

    public Rectangle(float h, float w) {
        height = h;
        width = w;
    }

    public float getArea() {
        return height * width;
    }
    public float getPerimeter() {
        return 2 * (height + width);
    }
}
