package Lab1;

import java.util.Scanner;

public class ReviewArray {
    public static double[] convertStringArrayToDouble(String[] strarr) {
        double[] tempDoubleArr = new double[strarr.length];
        for(int i = 0; i<strarr.length; i++) tempDoubleArr[i] = Double.parseDouble(strarr[i]);
        return tempDoubleArr;
    }
    public static double sumColumn(double[][] m, int columnIndex) {
        double sum = 0;
        for(int i = 0; i<m.length; i++) sum += m[i][columnIndex];
        return sum;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double[][] matrix = new double[3][4];
        System.out.println("Enter a 3-by-4 matrix row by row");
        for(int i = 0; i<3; i++) {
            String row = sc.nextLine();
            double[] rowElems = convertStringArrayToDouble(row.split(" "));
            matrix[i] = rowElems;
        }
        for(int i = 0; i<matrix[0].length; i++) System.out.println("Sum of the elements at column " + i + " is " + sumColumn(matrix, i));
    }
}
