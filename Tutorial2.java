// Exam Date: 23rd Jan 2026, building 114, 08:00 - 11:00

/**
 * Manual when running the program:
 * Flags
 * "-a" for ascending order sort (java Tutorial2 -a)
 * "-d" for descending order sort (java Tutorial2 -d)
 * No Flags
 * treat as descending order sort by default
 * 
 * @author Thanwisit Angsachon, 682115018
 */

import java.util.Scanner;
import java.util.Vector;

public class Tutorial2 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Vector<Integer> nums = new Vector<Integer>();
        String inputNum = "";

        do {
            System.out.print("Enter the numbers: ");
            inputNum = sc.nextLine();
            if(inputNum.equals("")) break;
            try {
                nums.add(Integer.parseInt(inputNum.trim()));
            } catch (Exception e) {
                System.out.println("Invalid input!");
            }
        } while(!inputNum.equals(""));

        if(args.length > 0) bubbleSort(nums, args[0]);
        else bubbleSort(nums, "-d");
        System.out.print("Sorted array is: ");
        printElem(nums);
    }

    public static void swap(Vector<Integer> v, int i) {
        int temp = v.get(i-1);
        v.set(i-1, v.get(i));
        v.set(i, temp);
    }

    public static void bubbleSort(Vector<Integer> v, String opt) {
        int op = 0;
        for(int i = 0; i<v.size(); i++) {
            boolean swapTime = false;
            for(int j = 1; j<v.size(); j++) {
                if(opt.equals("-a") && v.get(j) < v.get(j-1)) {
                    swap(v, j);
                    swapTime = true;
                } else if(opt.equals("-d") && v.get(j) > v.get(j-1)) {
                    swap(v, j);
                    swapTime = true;
                }
                op++;
            }
            if(!swapTime) break;
        }
        System.out.println("Operation count: " + op);
    }

    public static void printElem(Vector<Integer> v) {
        System.out.print("[");
        for(int i = 0; i<v.size(); i++) {
            if(i == v.size() - 1) System.out.print(v.get(i).toString());
            else System.out.print(v.get(i).toString() + ", ");
        }
        System.out.print("]");
    }
}
