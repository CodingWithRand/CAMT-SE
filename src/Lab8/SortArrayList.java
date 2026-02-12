package Lab8;
import java.util.ArrayList;

public class SortArrayList {
    public static void sort(ArrayList<Number> list) {
        // implement lambda comparator.
        list.sort((n1, n2) -> Double.compare(n1.doubleValue(), n2.doubleValue()));
    }
    public static void main(String[] args) {
        ArrayList<Number> list = new ArrayList<>();
        list.add(5);
        list.add(23);
        list.add(0.36);
        list.add(26.3);
        list.add(523);
        list.add(2.13);
        list.add(0.32);
        System.out.println("Before sorting: " + list);
        sort(list);
        System.out.println("After sorting: " + list);
    }
}
