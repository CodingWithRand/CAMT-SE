package Lab6.Uni;

public class Student extends Person {
    private final String STATUS;

    public Student(String name, String address, String phoneNumber, String email) {
        super(name, address, phoneNumber, email);
        this.STATUS = "Freshman";
    }
    public Student(String name, String address, String phoneNumber, String email, String status) {
        super(name, address, phoneNumber, email);
        this.STATUS = status;
    }
}
