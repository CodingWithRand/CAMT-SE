import java.util.Scanner;

public class WeeklySalary {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter your weekly working hour: ");
        int weeklyWorkingHours = input.nextInt();
        double weeklySalary;
        if(weeklyWorkingHours <= 40){
            weeklySalary = weeklyWorkingHours * 8.00;
        }else{
            weeklySalary = 320 + ((weeklyWorkingHours - 40) * 12.00);
        }
        System.out.println("Your paycheck this week: $" + weeklySalary);
    }
}
