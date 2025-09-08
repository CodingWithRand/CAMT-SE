public class KGToLBTables {
    public static void main(String[] args) {
        System.out.println("Kilograms  Pounds   |       Pounds      Kilograms");
        int kg, lb;
        for(kg = 1, lb = 20; kg < 200 && lb <= 515; kg+=2, lb+=5) System.out.printf("%-9d  %6.2f   |       %-6d     %8.2f\n", kg, kg*2.20462, lb, lb/2.20462);
    }
}
