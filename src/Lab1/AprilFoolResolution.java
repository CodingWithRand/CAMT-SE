package Lab1;
public class AprilFoolResolution {
    public static void Anakin() {
        int totalDeposit = 0;
        for(int pow = 0; pow<30; pow++) {
            totalDeposit += Math.pow(2, pow);
            System.out.println("day " + (pow + 1) + " deposit " + (int)Math.pow(2, pow) + " total is " + totalDeposit);
        }
    }
    public static void Vader() {
        int totalDeposit = 0;
        int pow = 0;
        while(totalDeposit<=1000000){
            totalDeposit += Math.pow(2, pow);
            System.out.println("day " + (pow + 1) + " deposit " + (int)Math.pow(2, pow) + " total is " + totalDeposit);
            pow++;
        }
        System.out.println();
        System.out.println("Number of days is " + pow + " days.");
    }
    public static void main(String[] args) throws Exception {
        Vader();
    }
}
