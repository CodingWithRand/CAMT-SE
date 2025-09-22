package Lab10_1;

public class PerfectNumber {
    public static Boolean isPerfect(int number) {
        int divisorSum = 0;
        for(int i = 1; i<number; i++)
            if(number%i == 0) divisorSum += i;
        return divisorSum == number;
    }
    public static void main(String[] args) {
        for(int i = 1; i<=10000; i++) if(isPerfect(i)) System.out.println(i + " is a perfect number");
    }
}