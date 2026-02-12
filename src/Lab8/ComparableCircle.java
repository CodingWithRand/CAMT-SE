package Lab8;

public class ComparableCircle extends Circle implements Comparable<ComparableCircle> {
    public ComparableCircle(double radius) {
        super(radius);
    }

    @Override
    public int compareTo(ComparableCircle o) {
        if (this.getRadius() > o.getRadius()) return 1;
        else if (this.getRadius() < o.getRadius()) return -1;
        else return 0;
    }
}

class CCT {
    public static void main(String[] args) {
        ComparableCircle c1 = new ComparableCircle(3);
        ComparableCircle c2 = new ComparableCircle(5);

        System.out.println(c1.compareTo(c2) < 0 ? "c1 is smaller than c2" :
                           c1.compareTo(c2) > 0 ? "c1 is larger than c2" :
                           "c1 is equal to c2");
    }
}