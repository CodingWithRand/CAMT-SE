public class LeapYears {
    public static void main(String[] args) {
        int count = 0;
        for (int year = 101; year <= 2100; year++) {
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                if (count % 10 == 0) System.out.println(year);
                else System.out.print(year + " ");
                count++;
            }
        }
        System.out.println("\nThere are " + count + " leap years between 101 and 2100.");
    }
}
