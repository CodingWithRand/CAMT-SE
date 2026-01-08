package Lab6.Bank;

public class Test {
    public static void main(String[] args) {
        CheckingAccount ca1 = new CheckingAccount(1000, 0.5);
        SavingAccount sa1 = new SavingAccount(1000, 0.5, 3);
        
        ca1.deposit(100);
        System.out.println(ca1.toString());
        sa1.withdraw(50);
        sa1.withdraw(100);
        sa1.withdraw(200);
        sa1.withdraw(400);

    }
}
