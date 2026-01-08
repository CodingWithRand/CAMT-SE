package Lab6.Uni;

public class Test {
    public static void main(String[] args) {
        Person peter = new Person("Peter", "", "12690503", "peter@cs.ubc.ca");
        Student susan = new Student("Susan", "", "12455678", "susan@cs.ubc.ca", "Sophomore");
        Employee eva = new Employee("Eva", "", "12385465", "eva@cs.ubc.ca", "101", 5000.00);
        Faculty frank = new Faculty("Frank", "", "12300008", "frank@cs.ubc.ca" , "203", 8000, 5, 4);
        Staff shane = new Staff("Shane", "", "11349968", "shane@cs.ubc.ca", "205", 2300, "Teacher Assistant");

        System.out.println(peter.toString());
        System.out.println(susan.toString());
        System.out.println(eva.toString());
        System.out.println(frank.toString());
        System.out.println(shane.toString());
    }
}
