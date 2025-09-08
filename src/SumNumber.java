public class SumNumber {
    public static void main(String[] args) {
        int sum = 0;
        int sumOfOdd = 0;
        int sumOfEven = 0;
        for (int i = 1; i <= 100; i++) {
            if(i%2 == 0) sumOfEven += i;
            else sumOfOdd += i;
            sum += i;
        }
        System.out.println("The sum of numbers from 1 to 100 is: " + sum);
        System.out.println("The sum of odd numbers from 1 to 100 is: " + sumOfOdd);
        System.out.println("The sum of even numbers from 1 to 100 is: " + sumOfEven);
    }
}
