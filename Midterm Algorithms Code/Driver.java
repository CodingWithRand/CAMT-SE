import java.util.Arrays;

public class Driver {
    public static void main(String[] args) {
        int[] arrayForSearch = {32,43,1,544,6433,35565,44533,5,54576,676,35454,24,213,234,5543,536,35,6,56435,4,2,7,5465,35476,9,6787,454,5,24,654,745675,87892,36543,6,56,75,64534231,23,6,4646,798,9768577,364,4,7343,54,5,46,4,55,34,53,55,34345,435,657,567,42,43546,7,5687,12,7,5676,56,6754,5,57467,567,567,4,6,4356,564,6453,45,3,43,543,3,423,4,5,12345,578,789,78765,354,3,45,2};
        System.out.println(arrayForSearch.length);
        int[] arrayForSortMaster = arrayForSearch.clone();
        int[] arrayForSort;
        Arrays.sort(arrayForSearch); // To get uniform answer, sort it first
        
        System.out.println("53 found at index: " + Search.LinearSearch(arrayForSearch, 53, "op"));
        System.out.println("53 found at index: " + Search.BinarySearch(arrayForSearch, 53, "op"));
        
        arrayForSort = arrayForSortMaster.clone();
        Sort.BubbleSort(arrayForSort, "op");
        Sort.show(arrayForSort);
        // Small test case: new int[]{3342, 454, 4, 5, 40}
        arrayForSort = arrayForSortMaster.clone();
        Sort.SelectionSort(arrayForSort, "op");
        Sort.show(arrayForSort);
        arrayForSort = arrayForSortMaster.clone();
        Sort.InsertionSort(arrayForSort, "op");
        Sort.show(arrayForSort);

        Sort.moveDisks(6, 'S', 'D', 'A');

        arrayForSort = arrayForSortMaster.clone();
        Sort.MergeSort(arrayForSort, "op");
        arrayForSort = arrayForSortMaster.clone();
        // Small test case: new int[]{3, 6, 23, 53, 1, 4, 90, 2}
        Sort.QuickSort(arrayForSort, "op");
        
        // Don't mind this, it's the 702 homework ig.
        int[][] sigma = new int[10][];
        for(int i = 0; i<=sigma.length/2; i++) sigma[i] = new int[sigma.length-i];
        for(int i = (sigma.length/2) - 1, j = (sigma.length/2) + 1; i>=0 && j<sigma.length; i--, j++){
            sigma[j] = new int[sigma.length-i];
        }

        for(int i = 0; i<sigma.length; i++) System.out.println(Arrays.toString(sigma[i]));
    }
}
