public class MultiplicationTable {
    /** Main method */
    public static void main(String[] args) {
        // Display the table heading
        System.out.println(" Multiplication Table");
        // Display the number title
        System.out.print("    ");
        for (int j = 9; j >= 1; j--)
            System.out.printf("%4d", j);
        System.out.println("\n-----------------------------------------");
        // Print table body
        for (int i = 9; i >= 1; i--) {
            System.out.print(i + " | ");
            for (int j = 9; j >= 1; j--) {
                // Display the product and align properly
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
    }
}
