import java.util.Scanner;

public class NumberComparison {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Your 1st number: ");
        int firstNum = input.nextInt();
        System.out.print("Your 2nd number: ");
        int secondNum = input.nextInt();

        if(firstNum > secondNum){
            System.out.println("The first number is greater than the second");
        }else if(firstNum < secondNum){
            System.out.println("The first number is no greater than the second");
        }else{
            System.out.println("These two number are equal");
        }
    }
}
