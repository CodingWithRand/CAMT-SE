public class Student {
    private String sid;
    private String fname;
    private String lname;

    public Student(String sid, String fname, String lname) {
        this.sid = sid;
        this.fname = fname;
        this.lname = lname != null ? lname : "";
    }

    public void printInfo() {
        System.out.println(this.sid + " " + this.fname + this.lname);
    }

    public String getFName() {
        return this.fname;
    }

    public String getLName() {
        return this.lname;
    }
}
