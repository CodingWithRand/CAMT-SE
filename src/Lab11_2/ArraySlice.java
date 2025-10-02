package Lab11_2;

public class ArraySlice {
    public static void printArray(int[] arr){
        for(int i = 0; i<arr.length; i++) System.out.print(arr[i] + (i == arr.length - 1 ? "" : ", "));
    }
    public static void printArray(String[] arr){
        for(int i = 0; i<arr.length; i++) System.out.print(arr[i] + (i == arr.length - 1 ? "" : ", "));
    }

    public static void subArray(int[] array, int startIndex, int endIndex) {
        if(startIndex > array.length || endIndex > array.length){
            System.out.println("Error: Index out of bound");
            return;
        }
        System.out.print("Slice from index " + startIndex + " to " + endIndex + ": [");
        for(int i = 0; i<array.length; i++){
            if(i >= startIndex && i <= endIndex){
                System.out.print(array[i] + (i == endIndex ? "" : ", "));
            }
        }
        System.out.println("]");
    }
    public static void subArray(String[] array, int startIndex, int endIndex) {
        if(startIndex > array.length || endIndex > array.length){
            System.out.println("Error: Index out of bound");
            return;
        }
        System.out.print("Slice from index " + startIndex + " to " + endIndex + ": [");
        for(int i = 0; i<array.length; i++){
            if(i >= startIndex && i <= endIndex){
                System.out.print(array[i] + (i == endIndex ? "" : ", "));
            }
        }
        System.out.println("]");
    }

    public static void subArray(int[] array, int startIndex) {
        if(startIndex > array.length){
            System.out.println("Error: Index out of bound");
            return;
        }
        System.out.print("Slice from index " + startIndex + " to end: [");
        for(int i = 0; i<array.length; i++){
            if(i >= startIndex){
                System.out.print(array[i] + (i == array.length - 1 ? "" : ", "));
            }
        }
        System.out.println("]");
    }
    public static void subArray(String[] array, int startIndex) {
        if(startIndex > array.length){
            System.out.println("Error: Index out of bound");
            return;
        }
        System.out.print("Slice from index " + startIndex + " to end: [");
        for(int i = 0; i<array.length; i++){
            if(i >= startIndex){
                System.out.print(array[i] + (i == array.length - 1 ? "" : ", "));
            }
        }
        System.out.println("]");
    }

    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50, 60};
        String[] words = {"alpha", "bravo", "charlie", "delta", "echo"};

        System.out.print("Original integer array: [");
        printArray(numbers);
        System.out.println("]");
        System.out.print("Original string array: [");
        printArray(words);
        System.out.println("]");

        subArray(numbers, 1, 4);
        subArray(words, 0, 2);
        subArray(numbers, 3);
        subArray(words, 1);

        subArray(words, 65);
    }
}
