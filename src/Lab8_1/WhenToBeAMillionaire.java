package Lab8_1;
public class WhenToBeAMillionaire {
    public static void main(String[] args) {
        double saving = 1000;
        int m = 0;
        for(; saving <= 1000000; m++) saving *= 1.01;
        System.out.println("It takes " + m/12 + " years and " + m%12 + " months to be a millionaire from the interests of $1000 saving.");
    }
}
