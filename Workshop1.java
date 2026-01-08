// Recursive

public class Workshop1 {
    public static void main(String[] args) {
        System.out.println("Iterative: ");
        IterativelyCountFrom20To1();
        System.out.println("Recursive: ");
        RecursivelyCountFrom20To1(20);
    }
    public static void RecursivelyCountFrom20To1(int n) {
        System.out.println(n);
        if(n == 1) return; // n == 1 (base case; stop calling recursion)
        RecursivelyCountFrom20To1(n-1);
    }
    public static void IterativelyCountFrom20To1() {
        for(int i = 20; i>=1; i--) {
            System.out.println(i);
        }
    }
}
