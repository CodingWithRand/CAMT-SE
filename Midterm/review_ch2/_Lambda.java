package Midterm.review_ch2;

import java.util.Arrays;
import java.util.Comparator;

/**
 * # Lambda expression
 * It's introduced in Java 8. The syntax is similar to javascript annonymous arrow function (() => {}), but the arrow is "->" instead of "=>". <br>
 * Still don't get what it is? Think of it like passing a function to another function for that function to call it. <br>
 * E.g. 
 * 1. Define function1 that require function2 as a parameter. Inside function1, call function2. <br>
 * <pre>
 * function function1(function2) {
 *      // some logic
 *      function2();
 * }
 * </pre> 
 * 2. Calling function1 by passing function2 as an argument. 
 * <pre>function1(function2)</pre>
 * 
 * The same concept apply to lambda expression, although Java doesn't allow passing a method to another method, a class containing methods is being passed instead. So, lambda expression represents an annonymous class instance. (CICE)
 * <br>
 * The expression itself is annonymous, no name is given.
 * <br>
 * Prior to Java 8, you may use annonymous class; Class Instance Creation Expression (CICE) <br>
 * and prior to Java 1.1, you have to properly declare that annonymous class and use it.
 * 
 * # Lambda expression component and variances
 * 3 components -> Head/Parameters, Arrow, and Body. <br>
 * The form is <pre>(parameters) -> body</pre>
 * Here are the variances
 * 1. param -> body
 * 2. (param) -> body
 * 3. (param1, param2) -> body
 * 4. (datatype param1) -> body or (datatype param1, datatype param2) -> body
 * 5. param -> { body }
 * 6. (param) -> { body }
 * 7. (param1, param2) -> { body }
 * 8. (datatype param1) -> { body } or (datatype param1, datatype param2) -> { body }
 * 9. () -> { body }
 * 10. () -> body
 * 
 * Although I'm not sure, but in Javascript, variance 1-4 will return value when it's called immediately, but for the remaining (except 10), "return" statement is required to return something from that function, or else it will not return anything.
 * 
 * Lambda will be used more in the next section. Stream. <br>
 * But also, if you remembered last chapter, about the Event Listener thing. You can replace those CICE annonymous class instance event listener with lambda y'know?
 */

public class _Lambda {

    static class CustomComparator implements Comparator<Integer> {
        @Override
        public int compare(Integer o1, Integer o2) {
            return o1.compareTo(o2);
        }
    }

    public static void main(String[] args) {
        Integer[] ri = new Integer[5];
        ri[0] = (int) Math.floor(Math.random() * 120);
        ri[1] = (int) Math.floor(Math.random() * 120);
        ri[2] = (int) Math.floor(Math.random() * 120);
        ri[3] = (int) Math.floor(Math.random() * 120);
        ri[4] = (int) Math.floor(Math.random() * 120);

        // Java 8+, pass a lambda expression
        Arrays.sort(ri, (o1, o2) -> o1.compareTo(o2));
        // ascending sort
        System.out.println("Java 8+");
        for(int i : ri) System.out.println(i);
        
        // Java 1.1 - Java 8, pass an annonymous class instance (CICE)
        Arrays.sort(ri, new Comparator<Integer>() {
            @Override
            public int compare(Integer o1, Integer o2) {
                if(o1.compareTo(o2) == 1) return -1;
                else if(o1.compareTo(o2) == -1) return 1;
                else return 0;
            }
        });
        // descending sort
        System.out.println("Java 1.1 - Java 8");
        for(int i : ri) System.out.println(i);

        // Java 1.0
        Arrays.sort(ri, new CustomComparator());
        // ascending sort
        System.out.println("Java 1.0");
        for(int i : ri) System.out.println(i);
    }
}
