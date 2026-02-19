package Lab9;
import java.util.ArrayList;

public class ArrayListMethods {
    public static <E> void shuffle(ArrayList<E> list) {
        for (int i = 0; i < list.size(); i++) {
            int randix = (int)(Math.random() * list.size());
            E temp = list.get(randix);
            list.set(randix, list.get(i));
            list.set(i, temp);
        }
    }
    public static <E extends Comparable<E>> E min(ArrayList<E> list) {
        E min = list.get(0);
        for(E elem: list) if(elem.compareTo(min) < 0) min = elem;
        return min;
    }
    // Bubble sort (optimized)
    public static <E extends Comparable<E>> void sort(ArrayList<E> list) {
        boolean swapped = true;
        for(int i = 0; i<list.size() - 1; i++) {
            if(!swapped) break;
            swapped = false;
            for(int j = 1; j<list.size(); j++) {
                if(list.get(j-1).compareTo(list.get(j)) > 0) {
                    swapped = true;
                    E temp = list.get(j-1);
                    list.set(j-1, list.get(j));
                    list.set(j, temp);
                }
            }
        }
    }
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<>();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        // Test shuffle
        System.out.println("Before shuffle: " + list);
        shuffle(list);
        System.out.println("After shuffle: " + list);
        // Test min
        System.out.println("Min Value: " + min(list));
        // Test sort
        System.out.println("Before sort: " + list);
        sort(list);
        System.out.println("After sort: " + list);
    }
}
