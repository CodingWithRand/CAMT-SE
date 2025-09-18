package Lab7_1;
public class InchesToCentimeters {
    public static void main(String[] args) {
        int in = 1;
        System.out.println("Inches      Centimeters");
        while (in < 200) {
            System.out.println(in + "           " + (in*2.54));
            in += 2;
        }
    }
}
