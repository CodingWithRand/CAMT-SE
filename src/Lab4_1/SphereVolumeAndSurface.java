package Lab4_1;
public class SphereVolumeAndSurface {
    public static void main(String[] args) {
        double radius = 2.57;
        double volume = 4.0/3 * Math.PI * Math.pow(radius, 3);
        double surface = 4 * Math.PI * Math.pow(radius, 2);
        System.out.println("Sphere Volume: " + volume);
        System.out.println("Sphere Surface: " + surface);
    }
}