package Lab10_1;

public class DataValidator {
    public static boolean isValid(String string){ return string != null && !string.isEmpty(); }
    public static boolean isValid(int age){ return age >= 18 && age <= 120; }
    public static boolean isValid(String password, int minLength){
        return password != null && password.length() >= minLength; 
    }
}
