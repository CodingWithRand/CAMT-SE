package Lab6.Bank;

public class CheckingAccount extends Account {
    public CheckingAccount() {
        super();
    }
    public CheckingAccount(double air) {
        super(air);
    }
    public CheckingAccount(double balance, double air) {
        super(balance, air);
    }

    @Override
    public String toString() {
        return "Checking Account Info\n" +
                "Account Number: " + this.getAccountNumber() + "\n" +
                "Current Balance: " + this.getBalance() + "\n" +
                "Interest Rate: " + this.getAIR() + "\n" +
                "Date Created: " + this.getCreatedDate();  
    }
}
