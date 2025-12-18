package Lab4;

public class Lab4_Strings {
    public static void main(String[] args) {
        // Cleaning
        String data = " LogID: 582103 ";
        System.out.println("After trim: " + data.substring(data.indexOf(":")).trim());
        // Uppercase conversion
        data = data.toUpperCase().trim();
        System.out.println("After convert: " + data);
        // Format report
        System.out.println("Length of string: " + data.length());
        System.out.printf("| ID: %s | Length: %d |", data, data.length());
    }
}
