package Lab4_1;
import java.util.Scanner;

public class PayrollStatement {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Input the following information...");
        System.out.print("Employee's Name: ");
        String employeeName = input.nextLine();
        System.out.print("Number of hours worked in a week: ");
        double hoursWork = input.nextDouble();
        System.out.print("Pay rate (hourly): ");
        double pay_rate = input.nextDouble();
        System.out.print("Federal tax  rate (percent): ");
        double federalTaxRate_InPercent = input.nextDouble();
        System.out.print("State tax rate (percent): ");
        double stateTaxRate_InPercent = input.nextDouble();

        double gross_pay = pay_rate * hoursWork;
        double federalTaxRate_InFloat = federalTaxRate_InPercent / 100;
        double stateTaxRate_InFloat = stateTaxRate_InPercent / 100;

        double federalWithholding = gross_pay * federalTaxRate_InFloat;
        double stateWithholding = gross_pay * stateTaxRate_InFloat;
        double totalDeduction = federalWithholding + stateWithholding;
        double netPay = gross_pay - totalDeduction;
        
        System.out.println("Employee's name: " + employeeName);
        System.out.println("Hours work: " + hoursWork + " hour");
        System.out.println("Pay rate: $" + pay_rate);
        System.out.println("Gross pay: $" + gross_pay);
        System.out.println("Deductions:");
        System.out.println("    Federal withholding (" + federalTaxRate_InPercent + "%): $" + (int) (federalWithholding * 100) / 100.0);
        System.out.println("    State withholding (" + stateTaxRate_InPercent + "%): $" + (int) (stateWithholding * 100) / 100.0);
        System.out.println("    Total Deduction: $" + (int) (totalDeduction * 100) / 100.0);
        System.out.println("Net pay: $" + (int) (netPay * 100) / 100.0);
    }
}
