package Lab9_1;
public class TestMax {
    /** Main method */
    public static void main(String[] args) {
        int i = 5;
        int j = 2;
        int x = 9;
        int y = 7;
        int k = max(i, j, x, y); // Invoke max method
        System.out.println("The maximum between " + i + ", " + j + ", " + x + " and " + y + " is " + k);
    }

    /** Return the max between two numbers */
    // Using varargs
    public static int max(int... nums) {
        int result = 0;
        // Loop through varargs array. Then, check and assign the greater value.
        for(int num: nums) if(num > result) result = num;
        return result; // Return result
    }
}
