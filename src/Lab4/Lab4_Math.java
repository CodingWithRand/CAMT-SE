package Lab4;
import java.util.Random;

public class Lab4_Math {
    public static void main(String[] args) {
        // Hypotenuse calculation
        double a = 3.0;
        double b = 4.0;
        double c = Math.sqrt((Math.pow(a,2) + Math.pow(b, 2)));
        System.out.println("Hypotenuse: " + c);
        // Dice roll simulation
        Random random = new Random(20);
        System.out.println("Random sequence (Seed 20):");
        System.out.println(random.nextInt(100));
        System.out.println(random.nextInt(100));
        System.out.println(random.nextInt(100));
        System.out.println(random.nextInt(100));
        System.out.println(random.nextInt(100));
        System.out.println("Dice roll: " + (random.nextInt(6) + 1));
    }
}