package Lab6.Bank;

public class SavingAccount extends Account {
    private int withdrawalAttemptLimit;
    private int thisMonthAttempt = 0;

    public SavingAccount(int wal) {
        super();
        this.withdrawalAttemptLimit = wal;
    }
    public SavingAccount(double air, int wal) {
        super(air);
        this.withdrawalAttemptLimit = wal;
    }
    public SavingAccount(double balance, double air, int wal) {
        super(balance, air);
        this.withdrawalAttemptLimit = wal;
    }

    @Override
    public void withdraw(double amount) {
        if(this.getBalance() - amount < 0) {
            System.out.println("Your withdraw cannot be processed: Your account doesn't have enough money.");
            return;
        }
        if(this.thisMonthAttempt >= this.withdrawalAttemptLimit) {
            System.out.println("Your withdraw cannot be processed: Exceed attempt limit.");
            System.out.println("This month you attempted to withdraw " + this.thisMonthAttempt + " times.");
            return;
        }

        System.out.println(this.thisMonthAttempt + 1);
        this.setBalance(this.getBalance() - amount);
        System.out.println(this.getBalance());
        this.thisMonthAttempt++;
    }

    @Override
    public String toString() {
        return "Saving Account Info\n" +
                "Account Number: " + this.getAccountNumber() + "\n" +
                "Current Balance: " + this.getBalance() + "\n" +
                "Interest Rate: " + this.getAIR() + "\n" +
                "Date Created: " + this.getCreatedDate() + "\n" +
                "Withdrawal Attempt Limit: " + this.withdrawalAttemptLimit + "\n" + 
                "This month attempts: " + this.thisMonthAttempt;  
    }
}
