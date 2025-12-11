package Lab3.AggregationExample;

public class Address {
    private String street;
    private String city;
    private String zipCode;

    public Address(String st, String c, String zc) {
        this.street = st;
        this.city = c;
        this.zipCode = zc;
    }

    public String getStreet() {
        return this.street;
    }
    public String getCity() {
        return this.city;
    }
    public String getZipCode() {
        return this.zipCode;
    }
}