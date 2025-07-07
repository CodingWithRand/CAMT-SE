import java.util.Scanner;

public class TimeCalculator {
    public static void main(String[] args) {
        int inputSeconds;

        int days;
        int hours;
        int minutes;
        int seconds;

        int remainderSeconds;

        Scanner input = new Scanner(System.in);
        System.out.print("Enter seconds: ");
        inputSeconds = input.nextInt();
        days = inputSeconds/86400;
        remainderSeconds = inputSeconds%86400;
        hours = remainderSeconds/3600;
        remainderSeconds = remainderSeconds%3600;
        minutes = remainderSeconds/60;
        seconds = remainderSeconds%60;
        System.out.println(days + "d " + hours + "h " + minutes + "m " + seconds + "s");
    }
}