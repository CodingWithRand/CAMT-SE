import java.io.File;
import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.Scanner;
import java.util.Vector;

public class Tutorial3 {
    public static void main(String[] args) throws FileNotFoundException {
        Scanner sc = new Scanner(new File("data.txt"));
        Vector<Double> nums = new Vector<Double>();
        int nData = 0;

        while(sc.hasNextDouble()){
            nums.add(sc.nextDouble());
            nData++;
        }

        System.out.println("Total number of values read: " + nData);
        myLinearSearch(nums);
    }

    public static void myBinarySearch(Vector<Double> nums) {
        long startTime = System.nanoTime();
        // Use binary search O(log(n))
        Double[] numsAsArray = nums.toArray(new Double[nums.size()]);
        Arrays.sort(numsAsArray); // Java sort algorithm -> Quick sort O(n^2) worst case

        int l = 0;
        int r = numsAsArray.length - 1;
        
        while(l<=r) {
            int mid = (l+r)/2; // (l+r)/2 = l+((r-l)/2)

            if(numsAsArray[mid] > 0.5 && numsAsArray[mid-1] < 0.5) {
                System.out.println("Number of value > 0.5 is: " + (numsAsArray.length - mid));
                break;
            } else if (numsAsArray[mid] > 0.5) {
                r = mid-1;
            } else if (numsAsArray[mid] < 0.5) {
                l = mid+1;
            }
        }

        long endTime = System.nanoTime();
        System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        // Total time complexity (worst case): O(n^2)
    }
    
    // This is better
    public static void myLinearSearch(Vector<Double> nums) {
        long startTime = System.nanoTime();
        int greaterThanHalf = 0;
        // Use linear search O(n)

        for(Double num: nums) if(num > 0.5) greaterThanHalf++;

        System.out.println("Number of value > 0.5 is: " + greaterThanHalf);
        long endTime = System.nanoTime();
        System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        // Total time complexity (worst case): O(n)
    }
}