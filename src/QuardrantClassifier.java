import java.util.Scanner;

public class QuardrantClassifier {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("This program will classify which quardrant the line is in from angle between the positive x-axis and the line");
        System.out.print("Enter the angle of the line between the positive x-axis: ");
        double angle = input.nextDouble();
        if(angle > 0 && angle < 90) System.out.println("The line is in quardrant 1");
        else if(angle > 90 && angle < 180) System.out.println("The line is in quardrant 2");
        else if(angle > 180 && angle < 270) System.out.println("The line is in quardrant 3");
        else if(angle > 270 && angle < 360) System.out.println("The line is in quardrant 4");
        else if(angle == 0 || angle == 90 || angle == 180 || angle == 270 || angle == 360) System.out.println("The line lies on the axis");
    }
}
