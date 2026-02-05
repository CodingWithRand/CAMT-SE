package Lab7;

class Animal {
    public void makeSound() {
        System.out.println("(Animal's sound)");
    }
}
class Dog extends Animal{
    @Override
    public void makeSound() {
        System.out.println("Woof woof!");
    }
}

public class AnimalNDog {
    public static void main(String[] args) {
        Animal animal = new Animal();
        animal.makeSound();
        Dog dog = new Dog();
        dog.makeSound();
    }
}
