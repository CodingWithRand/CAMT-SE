package Lab6_1;
import java.util.Scanner;

public class DIYSort {
    // This is not the best and most optimal method, you may try to make one that's more optimal.
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Made from scratch Sort() method");
        System.out.print("Enter 1st number: ");
        int input_num1 = input.nextInt();
        System.out.print("Enter 2nd number: ");
        int input_num2 = input.nextInt();
        System.out.print("Enter 3rd number: ");
        int input_num3 = input.nextInt();

        int output_num1, output_num2, output_num3;

        if(input_num1 <= input_num2 && input_num1 <= input_num3){
            output_num1 = input_num1;
            if(input_num2 <= input_num3){
                output_num2 = input_num2;
                output_num3 = input_num3;
            }
            else{
                output_num2 = input_num3;
                output_num3 = input_num2;
            }
        }
        else if(input_num1 >= input_num2 && input_num1 >= input_num3){
            output_num3 = input_num1;
            if(input_num2 <= input_num3){
                output_num1 = input_num2;
                output_num2 = input_num3;
            }
            else{
                output_num1 = input_num3;
                output_num2 = input_num2;
            }
        }
        else{
            output_num2 = input_num1;
            if(input_num2 <= input_num3){
                output_num1 = input_num2;
                output_num3 = input_num3;
            }
            else{
                output_num1 = input_num3;
                output_num3 = input_num2;
            }
        }
        
        // if(input_num1 >= input_num2 && input_num1 <= input_num3){
        //     output_num2 = input_num1;
        //     output_num1 = input_num2;
        //     output_num3 = input_num3;
        // }
        // else if(input_num1 >= input_num3 && input_num1 <= input_num2){
        //     output_num2 = input_num1;
        //     output_num1 = input_num3;
        //     output_num3 = input_num2;
        // }
        // else{
        //     // Prevent compiler error 🤷‍♂️
        //     output_num1 = 0;
        //     output_num2 = 0;
        //     output_num3 = 0;
        // }

        System.out.println(output_num1 + "<" + output_num2 + "<" + output_num3);
    }
}
