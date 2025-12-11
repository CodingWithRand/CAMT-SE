package Lab3.AggregationExample;

public class TestAggregation {
    public static void main(String[] args) {
        Address home = new Address("123 Main St", "Chiang Mai", "50000");
        Student egStudent = new Student("682115018", "Thanwisit Angsachon", home);
        System.out.println(egStudent.getStudentInfo());
    }
}
