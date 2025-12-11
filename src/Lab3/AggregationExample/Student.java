package Lab3.AggregationExample;

public class Student {
    private String studentID;
    private String name;
    private Address address;

    public Student(String id, String n, Address addr) {
        this.studentID = id;
        this.name = n;
        this.address = addr;
    }

    public String getStudentInfo() {
        return "Student ID: " + this.studentID 
            + "\nName: " + this.name 
            + "\nAddress: " + this.address.getStreet() + ", " + this.address.getCity() + ", " + this.address.getZipCode();
    }
}
