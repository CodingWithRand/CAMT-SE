package Lab7_2;
import java.util.Scanner;

public class DecimalToBinary {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter an integer number (base10): ");
        int num = sc.nextInt();
        String binaryNum = "";
        do {
            binaryNum = (num % 2) + binaryNum;
            num /= 2;
        } while (num != 0);
        System.out.println(binaryNum);
    }
}
