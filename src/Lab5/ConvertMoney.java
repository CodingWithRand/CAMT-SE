package Lab5;
import java.util.Scanner;
public class ConvertMoney {
    public static void main(String[] args) {
        double thb;
        double usd;
        Scanner input = new Scanner(System.in);
        System.out.print("Enter amount of USD: ");
        usd = input.nextDouble();
        thb = usd * 31.8245;
        System.out.println(usd + " USD = " + thb + " THB");
    }
}
