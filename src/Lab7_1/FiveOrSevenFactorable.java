package Lab7_1;
import java.util.Scanner;
public class FiveOrSevenFactorable {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number: ");
        int uinputNum = sc.nextInt();
        int start = 0;
        int order = 1;
        while (start - uinputNum != 1) {
            if (start % 5 == 0 ^ start % 7 == 0){
                if(order % 10 == 0) System.out.println(start + " ");
                else System.out.print(start + " ");
                order++;
            }
            start++;
        }
    }
}