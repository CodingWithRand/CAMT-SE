package Lab2.Dog;

public class MyDog {
    public static void main(String[] args) {
        Dog poodle = new Dog("white", 15.5f);
        System.out.println("The color of my dog is " + poodle.getColor());
        System.out.println("The weight of my dog is " + poodle.getWeight());
    }
}
