public class Search {
    // Return index of target if found, else return -1
    public static int LinearSearch(int[] arr, int target, String opt) {
        long startTime = System.nanoTime();
        int ti = -1;
        int op = 0;
        for (int i = 0; i < arr.length; i++) {
            if(opt.equals("op")) op++;
            if (arr[i] == target){
                ti = i;
                break;
            }
        }

        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        if(opt.equals("op")) System.out.println("Operation count: " + op);
        return ti;
    }

    public static int BinarySearch(int[] arr, int target, String opt) {
        long startTime = System.nanoTime();
        int ti = -1;
        int op = 0;

        int l = 0;
        int r = arr.length - 1;
        
        while(l<=r) {
            if(opt.equals("op")) op++;
            int m = (l+r)/2;
            if(arr[m] == target) {
                ti = m; 
                break;
            } else if (arr[m] > target) {
                r = m - 1;
            } else if (arr[m] < target) {
                l = m + 1;
            }
        }

        long endTime = System.nanoTime();
        if(opt.equals("time")) System.out.println("Time taken: " + (endTime - startTime)/1_000_000.0 + "ms");
        if(opt.equals("op")) System.out.println("Operation count: " + op);
        return ti;
    }
}
