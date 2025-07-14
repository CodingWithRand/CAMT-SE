import java.util.Scanner;

public class Interest {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Investment amount: ");
        double investmentAmount = input.nextDouble();
        System.out.print("Annual interest rate: ");
        double annualIR = input.nextDouble() / 100;
        System.out.print("Number of years: ");
        int y = input.nextInt();

        double fiv = investmentAmount * Math.pow((1 + annualIR), y);
        System.out.println("Future Investment Value: " + fiv);
    }
}
