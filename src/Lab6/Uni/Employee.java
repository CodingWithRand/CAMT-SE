package Lab6.Uni;

public class Employee extends Person {
    private String office;
    private double salary;

    public Employee(String name, String address, String phoneNumber, String email, String office, double salary) {
        super(name, address, phoneNumber, email);
        this.office = office;
        this.salary = salary;
    }
}
