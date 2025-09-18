package Lab6_3;
import java.util.Scanner;

public class MonthAndSeasonFinder {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter the number of month (1-12): ");
        int monthInInt = input.nextInt();

        String monthInString = "";

        switch (monthInInt) {
            case 1: monthInString = "January"; break;
            case 2: monthInString = "February"; break;
            case 3: monthInString = "March"; break;
            case 4: monthInString = "April"; break;
            case 5: monthInString = "May"; break;
            case 6: monthInString = "June"; break;
            case 7: monthInString = "July"; break;
            case 8: monthInString = "August"; break;
            case 9: monthInString = "September"; break;
            case 10: monthInString = "October"; break;
            case 11: monthInString = "November"; break;
            case 12: monthInString = "December"; break;
            default:
                System.out.println("Invalid month number");
                System.exit(404);
                break;
        }

        switch (monthInInt) {
            case 12: case 1: case 2:
                System.out.println("Month: " + monthInString + ", Season: Winter");
                break;
            case 3: case 4: case 5:
                System.out.println("Month: " + monthInString + ", Season: Spring");
                break;
            case 6: case 7: case 8:
                System.out.println("Month: " + monthInString + ", Season: Summer");
                break;
            case 9: case 10: case 11:
                System.out.println("Month: " + monthInString + ", Season: Autumn (Fall)");
                break;
            default:
                break;
        }
    }
}
