import java.io.File;
import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.Scanner;
import java.util.StringTokenizer;
import java.util.Vector;

// Sorting
public class Main {
    public static void main(String[] args) throws FileNotFoundException {
        String opt = args[0];
        Scanner sc = new Scanner(new File(args[1]));

        for(int i = 0; i<7; i++) sc.nextLine(); // skip header

        Vector<Student> students = new Vector<Student>();

        while(sc.hasNextLine()) {
            StringTokenizer tokenizers = new StringTokenizer(sc.nextLine(), ",");
            boolean ignored = false;
            String sid = null;
            String fname = null;
            String lname = null;
            while (tokenizers.hasMoreTokens()) {
                if(!ignored) {
                    tokenizers.nextToken();
                    ignored = true;
                    continue;
                }
                if(sid == null) sid = tokenizers.nextToken();
                else if (fname == null) fname = tokenizers.nextToken();
                else if (lname == null) lname = tokenizers.nextToken();
            }
            students.add(new Student(sid, fname, lname));
        }

        sc.close();

        sort(students, opt);

    }

    public static void sort(Vector<Student> sv, String opt) {
        Vector<String> studentNames = new Vector<String>();
        for(Student student: sv) studentNames.add(
            opt.equals("-n") ? student.getSID() :
            opt.equals("-f") ? student.getFName() : 
            opt.equals("-l") ? student.getLName() :
            ""
        );
        String[] sn = (String[]) studentNames.toArray(new String[studentNames.size()]);
        Arrays.sort(sn);
        for(String name: sn) {
            for(Student student: sv) {
                if(
                    opt.equals("-n") && student.getSID().equals(name) ||
                    opt.equals("-f") && student.getFName().equals(name) || 
                    opt.equals("-l") && student.getLName().equals(name)
                ){
                    student.printInfo();
                    break;
                }
            }
        }
    }
}
