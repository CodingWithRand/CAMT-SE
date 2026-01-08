package Lab6.Uni;

public class Faculty extends Employee {
    private double officeHours;
    private int officeRank;

    public Faculty(String name, String address, String phoneNumber, String email, String office, double salary, double officeHours, int officeRank) {
        super(name, address, phoneNumber, email, office, salary);
        this.officeHours = officeHours;
        this.officeRank = officeRank;
    }
}
