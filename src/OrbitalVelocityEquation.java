import java.util.Scanner;

public class OrbitalVelocityEquation {
    public static void main(String[] args) {
        // Define a constant value (G) and create a scanner for reading input from keyboard.
        final double GRAVITATIONAL_CONSTANT = 6.674 * Math.pow(10, -11);
        Scanner input = new Scanner(System.in);

        // Read the input of the celestial body mass and distance from keyboard, then stores them in variables.
        System.out.print("Enter the mass of the celestial body (kg): ");
        double celestialBodyMass = input.nextDouble();
        System.out.print("Enter distance from the center of the celestial body to the object (m): ");
        double distance = input.nextDouble();

        // Compute the Orbital Velocity according to the equation with given variables.
        double orbitalVelocity = Math.sqrt((GRAVITATIONAL_CONSTANT * celestialBodyMass)/distance);

        // Print out the result.
        System.out.println("Orbital Velocity: " + orbitalVelocity + "m/s");
    }
}
