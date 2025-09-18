package Lab9_2;
import java.util.Scanner;

public class ShapeDrawer {
    public static void drawRectangle(int width, int height, char symbol){
        for(int h = 0; h<height; h++){
            for(int w = 0; w<width; w++) System.out.print(symbol);
            System.out.println();
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a width: ");
        int width = sc.nextInt();
        System.out.print("Enter a height: ");
        int height = sc.nextInt();
        System.out.print("Enter a symbol: ");
        char symbol = sc.next().charAt(0);
        System.out.println();

        drawRectangle(width, height, symbol);
    }
}