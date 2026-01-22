public class Sort {
    // Ascending sort (A-Z)
    public static void show(int[] arr) {
        for (int elem: arr) System.out.print(elem + " ");
        System.out.println();
    }

    public static void BubbleSort(int[] arr, String opt) {
        long startTime = System.nanoTime();
        int op = 0;
        for (int i = 0; i < arr.length; i++) {
            // My version - more op
            // for (int j = 1; j < arr.length; j++) {
            //     if (arr[j-1] > arr[j]) {
            //         int temp = arr[j-1];
            //         arr[j-1] = arr[j];
            //         arr[j] = temp;
            //     }
            //     if(opt.equals("op")) op++;
            // }

            // In the lecture version - optimized op (as after the below loop, the last elem will be sorted, so no need to go over that again.)
            for (int j = 1; j < (arr.length - i); j++) {
                if(opt.equals("op")) op++;
                if (arr[j-1] > arr[j]) {
                    int temp = arr[j-1];
                    arr[j-1] = arr[j];
                    arr[j] = temp;
                }
            }
        }

        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        if(opt.equals("op")) System.out.println("Operation count: " + op);
    }

    public static void SelectionSort(int[] arr, String opt) {
        long startTime = System.nanoTime();
        int op = 0;
        // My version - slightly less op, but more memory usage (not worth it)
        // for (int i = 0; i < arr.length - 1; i++) {
        //     int thisElem = arr[i];
        //     int toBeSwapped = arr[i+1];
        //     int toBeSwappedIndex = i;
        //     for (int j = i + 2; j < arr.length; j++) {
        //         if (arr[j] < toBeSwapped) {
        //             toBeSwapped = arr[j];
        //             toBeSwappedIndex = j;
        //         }
        //         if(opt.equals("op")) op++;
        //     }
        //     arr[i] = toBeSwapped;
        //     arr[toBeSwappedIndex] = thisElem;
        // }

        // In the lecture version - more op, but less memory usage
        for (int i = 0; i < arr.length - 1; i++) {
            int index = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[index]) index = j;
                if(opt.equals("op")) op++;
            }
            int smallerNumber = arr[index];
            arr[index] = arr[i];
            arr[i] = smallerNumber;
        }

        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        if(opt.equals("op")) System.out.println("Operation count: " + op);
    }

    public static void InsertionSort(int[] arr, String opt) {
        long startTime = System.nanoTime();
        int op = 0;
        for (int i = 1; i < arr.length; i++) {
            for (int j = i; j > 0; j--) {
                if(opt.equals("op")) op++;
                if(arr[j] < arr[j-1]) {
                    int temp = arr[j];
                    arr[j] = arr[j-1];
                    arr[j-1] = temp;
                } 
                else if(arr[j] >= arr[j-1]) break; //optional to optimization
            }
        }

        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        if(opt.equals("op")) System.out.println("Operation count: " + op);
    }

    // Not relate to sorting, but can show the recursion idea. (Tower of Hanoi)
    /*
     * Idea: (First layer. In the next layer, it's basically plugging in var in <> with previous call args)
     * Next n (in the recursive call of (1))
     * (1) Move the n-1 disk from <source> to <destination>
     * (2) Move the n disk from <source> to <auxiliary>
     * (3) Move the n-1 disk from <destination> to <auxiliary>
     * 
     * Start n
     * (1) Move the n-1 disk from <source> to <auxiliary>
     * (2) Move the n disk from <source> to <destination>
     * (3) Move the n-1 disk from <auxiliary> to <destination>
     * 
     * Next n (in the recursive call of (3))
     * (1) Move the n-1 disk from <auxiliary> to <source>
     * (2) Move the n disk from <auxiliary> to <destination>
     * (3) Move the n-1 disk from <source> to <destination>
     * 
     * Start n andd Next n alternate in the recursive call until hit the base case. (n=1)
     */
    public static void moveDisks(int count, char source, char destination, char auxiliary) {
        if (count > 0) {
            moveDisks(count - 1, source, auxiliary, destination);       // (1)
            System.out.println("Move disk " + count + " from needle "
            + source + " to needle "
            + destination + ". ");                                      // (2)
            moveDisks(count - 1, auxiliary, destination, source);       // (3)
            /** Output
             * d 1 n S -> n D
             * d 2 n S -> n A
             * d 1 n D -> n A
             * d 3 n S -> n D
             * d 1 n A -> n S
             * d 2 n A -> n D
             * d 1 n S -> n D
             */
        }
    }

    public static void MergeSort(int[] arr, String opt) {
        long startTime = System.nanoTime();
        MergeSort ms = new MergeSort(arr, opt);
        show(ms.getSortedArr());
        if(opt.equals("op")) ms.showOP();
        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
    }

    public static void QuickSort(int[] arr, String opt) {
        long startTime = System.nanoTime();
        QuickSort qs = new QuickSort(arr, opt);
        show(qs.getSortedArr());
        if(opt.equals("op")) qs.showOP();
        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
    }
}

class MergeSort {
    private String opt;
    private int[] arr;
    private int[] temp;
    private int op = 0;
    
    public MergeSort(int[] arr, String opt) {
        this.arr = arr;
        this.opt = opt;
        this.temp = new int[arr.length];
        mergeSort(0, arr.length - 1);
    }

    private void mergeSort(int left, int right) {
        if (left < right) {                         // Base case: stop when subarray has 1 element
            if(opt.equals("op")) this.op++;
            int mid = (left + right) / 2;
            mergeSort(left, mid);                   // Recursively LEFT half partitioning
            mergeSort(mid + 1, right);              // Recursively RIGHT half partitioning
            merge(left, mid, right);                // Merge the two sorted halves
        }
    }

    private void merge(int left, int mid, int right) {
        if (this.opt.equals("op")) this.op++;
        int i = left;       // First index of the left half
        int j = mid + 1;    // First index of the right half
        int k = left;       // index for temp

        // Compare and merge while both subarrays have elements
        // Loop until i (first index left half) hit mid (last index of left half)
        // AND
        // Loop until j (first index right half) hit right (last index of right half)
        while (i <= mid && j <= right) {
            if (this.opt.equals("op")) this.op++;
            // Organize the merged subarray, compare each element one by one (e.g. left[0] <= right[0], left[1] <= right[1], ...)
            if (this.arr[i] <= this.arr[j]) {
                this.temp[k++] = this.arr[i++];     // Take from left if smaller
            } else {
                this.temp[k++] = this.arr[j++];     // Take from right if smaller
            }
        }

        // In case both subarrays have elements left (e.g. [1,2,3] + [4,5,6])

        // Copy remaining elements from left (if any)
        while (i <= mid) {
            if (this.opt.equals("op")) this.op++;
            this.temp[k++] = this.arr[i++];
        }

        // Copy remaining elements from right (if any)
        while (j <= right) {
            if (this.opt.equals("op")) this.op++;
            this.temp[k++] = this.arr[j++];
        }

        // Copy sorted elements back to original array
        for (i = left; i <= right; i++) {
            if (this.opt.equals("op")) this.op++;
            this.arr[i] = this.temp[i];
        }
    }

    /** Visualization
     Array: [38, 27, 43, 3] 

     Doing the left half first
     Step 1: Call MergeSort.mergeSort(0, 3)
        left=0, right=3, left < right? YES
        op++ (op=1)
        mid = (0+3)/2 = 1
        Call mergeSort(0, 1)  // LEFT half
     Step 2: Call mergeSort(0, 1)
        left=0, right=1, left < right? YES
        op++ (op=2)
        mid = (0+1)/2 = 0
        Call mergeSort(0, 0)  // LEFT half
     Step 3: Call mergeSort(0, 0)
        left=0, right=0, left < right? NO → RETURN (base case)
     Step 4: Call mergeSort(1, 1) (right half of step 2)
        left=1, right=1, left < right? NO → RETURN (base case)
     Step 5: merge(0, 0, 1) (merge results from steps 3 & 4)
        Compare arr[0]=38 vs arr[1]=27
            op++ (op=3)
            27 < 38 → temp[0]=27, j++
        Continue: arr[0]=38 (remaining from left)
            → temp[1]=38
        Result: [27, 38] back in arr[0..1]

     Doing the right half now
     Step 6: Call mergeSort(2, 3) (right half of step 1)
        left=2, right=3, left < right? YES
        op++ (op=4)
        mid = (2+3)/2 = 2
        Call mergeSort(2, 2) → RETURN (base case)
        Call mergeSort(3, 3) → RETURN (base case)
     Step 7: merge(2, 2, 3)
        Compare arr[2]=43 vs arr[3]=3
            op++ (op=5)
            3 < 43 → temp[2]=3, j++
        Continue: arr[2]=43 (remaining from left)
            → temp[3]=43
        Result: [3, 43] back in arr[2..3]
     Step 8: merge(0, 1, 3) (final merge)
        Merge [27, 38] with [3, 43]
        Compare arr[0]=27 vs arr[2]=3
            op++ (op=6)
            3 < 27 → temp[0]=3, j++
        Compare arr[0]=27 vs arr[3]=43
            op++ (op=7)
            27 < 43 → temp[1]=27, i++
        Compare arr[1]=38 vs arr[3]=43
            op++ (op=8)
            38 < 43 → temp[2]=38, i++
        arr[0] exhausted, copy remaining: temp[3]=43
        Result: [3, 27, 38, 43]
     */

    public int[] getSortedArr() {
        return this.arr;
    }

    public void showOP() {
        System.out.println("Operation count: " + this.op);
    }
}

// I give up on explanation XP
class QuickSort {
    private String opt;
    private int[] arr;
    private int op = 0;
    
    public QuickSort(int[] arr, String opt) {
        this.arr = arr;
        this.opt = opt;
        quickSort(0, arr.length - 1);
    }

    private void quickSort(int low, int high) {
        if (low < high) {
            if (this.opt.equals("op")) this.op++;
            // pi is the partition return index of pivot
            int pi = partition(low, high);

            // recursion calls for smaller elements
            // and greater or equals elements
            quickSort(low, pi);
            quickSort(pi + 1, high);
        }
    }
    private void swap(int i, int j) {
        if (this.opt.equals("op")) this.op++;
        int temp = this.arr[i];
        this.arr[i] = this.arr[j];
        this.arr[j] = temp;
    }

    private int partition(int left, int right) {
        int x = this.arr[left]; // set the first element as the pivot
        int i = left-1, j = right+1;
        while (true) {
            if (this.opt.equals("op")) this.op++;
            // find next element larger than pivot 
            // from the left
            do {
                if (this.opt.equals("op")) this.op++;
                i++;
            } while (this.arr[i] < x);
            
            // find next element smaller than pivot 
            // from the right
            do {
                if (this.opt.equals("op")) this.op++;
                j--;
            } while (this.arr[j] > x);
            
            // swap larger and smaller elements
            if (i < j) {
                swap(i, j);
            } 
            // if left and right crosses each other
            // no swapping required
            else {
                return j;
            }
            
        }
    }

    public int[] getSortedArr() {
        return this.arr;
    }

    public void showOP() {
        System.out.println("Operation count: " + this.op);
    }
}