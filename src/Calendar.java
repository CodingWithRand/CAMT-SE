import java.util.Scanner;

public class Calendar {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number of year: ");
        int year = sc.nextInt();
        System.out.print("Enter the day of the first day in the year (e.g. 2 for Tuesday): ");
        int firstDayOfTheYear = sc.nextInt();
        for(int m = 1; m<=12; m++){
            int daysOfTheMonth = 0;
            switch (m) {
                case 1: System.out.println("                      January " + year); daysOfTheMonth = 31; break;
                case 2:
                    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) daysOfTheMonth = 29;
                    else daysOfTheMonth = 28;
                    System.out.println("                      February " + year);
                    break;
                case 3: System.out.println("                      March " + year); daysOfTheMonth = 31; break;
                case 4: System.out.println("                      April " + year); daysOfTheMonth = 30; break;
                case 5: System.out.println("                      May " + year); daysOfTheMonth = 31; break;
                case 6: System.out.println("                      June " + year); daysOfTheMonth = 30; break;
                case 7: System.out.println("                      July " + year); daysOfTheMonth = 31; break;
                case 8: System.out.println("                      August " + year); daysOfTheMonth = 31; break;
                case 9: System.out.println("                      September " + year); daysOfTheMonth = 30; break;
                case 10: System.out.println("                     October " + year); daysOfTheMonth = 31; break;
                case 11: System.out.println("                     November " + year); daysOfTheMonth = 30; break;
                case 12: System.out.println("                     December " + year); daysOfTheMonth = 31; break;
            }
            System.out.println("------------------------------------------------------");
            System.out.println(" Sun     Mon    Tue      Wed     Thu     Fri     Sat ");
            if(firstDayOfTheYear<7)
                for(int indentation = 0; indentation<firstDayOfTheYear; indentation++) System.out.print("        ");
            for(int d = 0, bc = firstDayOfTheYear; d<daysOfTheMonth; d++, bc++){
                if(bc%7==0 && d!=0) System.out.printf("\n %2d     ", d+1);
                else System.out.printf(" %2d     ", d+1);

                if(daysOfTheMonth-d == 1) firstDayOfTheYear = bc%7 + 1;
            }
            System.out.println();
        }
    }
}
