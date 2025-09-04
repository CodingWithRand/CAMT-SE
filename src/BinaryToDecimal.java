import java.util.Scanner;

public class BinaryToDecimal {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a binary number: ");
        String binaryNum = sc.nextLine();
        int nthDigit = binaryNum.length() - 1;
        int nthPow = 0;
        int decimalNumber = 0;

        while(nthDigit >= 0) {
            decimalNumber += (binaryNum.charAt(nthDigit) - '0') * Math.pow(2, nthPow);
            nthPow++;
            nthDigit--;
        }

        System.out.println(decimalNumber);
    }
}
