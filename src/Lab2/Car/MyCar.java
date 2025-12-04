package Lab2.Car;

public class MyCar {
    public static void main(String[] args) {
        Car Toyota = new Car("red");
        Toyota.setSpeed(200);
        Toyota.setMilage(1345);
        Car Honda = new Car("blue");
        Honda.setSpeed(300);
        Honda.setMilage(8987);

        System.out.println("Toyota color: " + Toyota.getColor() + " speed: " + Toyota.getSpeed() + " mileage: " + Toyota.getSMilage());
        System.out.println("Honda color: " + Honda.getColor() + " speed: " + Honda.getSpeed() + " mileage: " + Honda.getSMilage());
    }
}
