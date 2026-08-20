package Midterm.review_ch2;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.LongStream;

/**
 * # Stream intro
 * Stream is a sequence of data. You may create a stream from a collection -> list -> arraylist, etc. <br>
 * The concept of stream is "data first", then we apply method to the data, whether you sort, map, reduce or sum it.
 * Such method we pass in is the lambda expression we mentioned in the previous section.
 * 
 * Some of the stream methods are actually implementable using normal loops logic. <br>
 * Like, summing up all elements in the list, you'd use for loop to add up value in each element to a variable declared outside the loop. <br>
 * But in stream, it's just .sum().
 * 
 * # Stream Pipeline
 * 1. Stream source -> Collection.stream() give you a stream of data of that collection.
 * 2. Intermediate operation (optional) -> After getting the stream source, chain calling it with method like .filter(), .map(), etc. You can chain it because each method return back the stream.
 * 3. Terminal operation (required) -> This will be the last method at the chain, no more stream will be returned after this. It will produce the final result/side effect.
 * 
 * # Stream parallelization
 * The advantage of stream is that you can utilize multiple cores of your cpu to process the data. <br>
 * Unlike the normal for loop which run synchronously, you can .parallel() stream to split the task to other cpu cores, which can boost up the speed -> more efficient. <br>
 * Although, not every time you .parallel() stream will get you better performance, since don't forget that there is an overhead to sync back all the split tasks too.
 * 
 * ## When to consider parallelization?
 * - Big chunk of data, and easily to divide into smaller chunks.
 * - Heavy computation task.
 * - Stream operations do not depend on each other's result. (Like summing is a no go, ig.)
 * 
 * # Stream methods
 * 1. Intermediate Operations
 * - parallel() 
 * - filter() c
 * - map() c
 * - sorted() c
 * - distinct() c
 * 2. Terminal Operations
 * - forEach() c
 * - collect() c
 * - reduce() c
 * - count() c
 * - sum() c
 * - min() c
 * - max() c
 * - toArray()/toList()/etc. <- return an array/list/etc.
 * - findFirst() c
 * - findAny() c
 */

public class _Stream {
    ArrayList<String> ttc = new ArrayList<>();
    ArrayList<Double> myachievement = new ArrayList<>();

    public _Stream() {
        this.ttc.add("ToINE");
        this.ttc.add("STONE:R");
        this.ttc.add("ToMH");
        this.ttc.add("ToID");
        this.ttc.add("ToMH");
        this.ttc.add("ToV");
        this.ttc.add("ToW");
        this.ttc.add("ToSF");

        this.myachievement.add(8.45);
        this.myachievement.add(8.45);
        this.myachievement.add(8.45);
        this.myachievement.add(8.48);
        this.myachievement.add(7.32);
        this.myachievement.add(7.32);
        this.myachievement.add(7.32);
        this.myachievement.add(8.03);
        this.myachievement.add(8.03);
        this.myachievement.add(7.10);
        this.myachievement.add(7.10);
        this.myachievement.add(7.02);
        this.myachievement.add(7.10);
        this.myachievement.add(7.02);
        this.myachievement.add(7.10);
        this.myachievement.add(7.02);
        this.myachievement.add(8.05);
        this.myachievement.add(8.05);
        this.myachievement.add(7.09);
        this.myachievement.add(6.99);
        this.myachievement.add(7.01);
        this.myachievement.add(6.5);
    }

    public void updateTTC(List<?> list) {
        this.ttc = (ArrayList) list;
    }

    public void updateAchievement(List<?> list) {
        this.myachievement = (ArrayList) list;
    }

    public static void show(ArrayList<?> list) {
        for(Object o : list) {
            System.out.print(o + " ");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        _Stream data = new _Stream();
        System.out.println("Before stream ops");
        _Stream.show(data.ttc);

        data.updateTTC(data.ttc.stream()
            // .filter(lambda expression), lamda expression = (stream element) -> filter operation that return boolean.
            // If filter operation that return boolean return true, keep the element, else remove the element.
            .filter(t -> t.startsWith("To")) // filter STONE:R out
            // .map(lambda expression), lamda expression = (stream element) -> map operation that return the new element.
            // If map operation that return the new element, replace the old element in stream with the new element.
            .map(t -> t.substring(2)) // Replace everything in there with no "To".
            // .collect(Collector), Collector = Collectors.toList()/toSet()/toMap(),etc.
            // Collect all the stream data back to your preferred data structure. (list, set, map)
            .collect(Collectors.toList()) // collect the stream into a list.
        );

        System.out.println("After stream ops");
        _Stream.show(data.ttc);

        System.out.println("Before stream ops");
        _Stream.show(data.myachievement);

        data.updateAchievement(data.myachievement.stream()
            // .sorted(), sort the stream data with default comparator (ascending order).
            // .sorted(Comparator), sort the stream data with your custom comparator.
            .sorted()
            // .distinct(), remove duplicate data from the stream.
            .distinct()
            .collect(Collectors.toList())
        );

        System.out.println("After stream ops 1");
        _Stream.show(data.myachievement);

        // sort to descending order
        data.updateAchievement(data.myachievement.stream().sorted((o1, o2) -> -1 * o1.compareTo(o2)).collect(Collectors.toList()));

        System.out.println("After stream ops 2");
        _Stream.show(data.myachievement);

        System.out.println(".count() on data.ttc (There are 7 elements)");
        // .count() -> count the number of data in the stream
        System.out.println("Stream: " + data.ttc.stream().count() + " Traditional List Size: " + data.ttc.size());

        System.out.println(".reduce() on data.myachievement (Find average of myachievement)");
        // .reduce(lambda expression) -> work like sum (every element in the stream perform math operations), but you can implement your own reduce logic in lambda expression.
        // o1 + o2 -> (o1 + o2) + o3 -> ((o1 + o2) + o3) + o4 -> ...
        System.out.println(data.myachievement.stream().reduce((o1, o2) -> o1 + o2).get() / data.myachievement.size());
        System.out.println("Remcel");
        // 2 * (o1 + o2) -> 2 * ((2 * (o1 + o2)) + o3) -> ...
        System.out.println(data.myachievement.stream().reduce((o1, o2) -> {
            System.out.println(2 * (o1 + o2)); // debug in stream.
            return 2 * (o1 + o2); // remember what I told you in lambda section?
        }).get() / data.myachievement.size());
        System.out.println("Ouch, is this class 96?");

        System.out.println(".forEach() ");
        // .forEach(lambda expression) -> work like for loop.
        data.ttc.stream().forEach((e) -> System.out.print(e + " "));
        System.out.println();

        System.out.println(".sum()");
        // .sum() -> sum up all the data in the stream (Only work with primitive data type stream e.g. IntStream, LongStream, DoubleStream).
        System.out.println(IntStream
            // a range of data stream from 1 to 100
            .range(1, 101)
            .sum()
        );

        System.out.println(".min() & .max()");
        // .min() -> get the minimum data in the stream
        // .max() -> get the maximum data in the stream
        System.out.println("Hardest achievement: " + data.myachievement.stream().max((o1, o2) -> o1.compareTo(o2)).get());
        System.out.println("Easiest achievement: " + data.myachievement.stream().min((o1, o2) -> o1.compareTo(o2)).get());

        System.out.println(".findFirst() & .findAny()");
        // .findFirst() -> get the first data in the stream
        System.out.println("First tower in ttc: " + data.ttc.stream().findFirst().get());
        // .findAny() -> often get the first data in the stream (optimizable in parallel.)
        System.out.println("First (maybe) tower in ttc: " + data.ttc.stream().findAny().get());

        // Parallel speed up prove.
        // Normal Looping
        long begin = System.currentTimeMillis();
        long s = 0;
        for(long i = 0; i<1e10; i++) s += i;
        long end = System.currentTimeMillis();
        System.out.println("Normal loop time taken: " + ((end - begin) / 1000.0) + "s");

        // Parallel Looping
        long begin2 = System.currentTimeMillis();
        long s2 = 0;
        LongStream.range(1L, (long)1e10).parallel().reduce((o1, o2) -> o1 + o2);
        long end2 = System.currentTimeMillis();
        System.out.println("Parallel loop time taken: " + ((end2 - begin2) / 1000.0) + "s");
        
    }
}
