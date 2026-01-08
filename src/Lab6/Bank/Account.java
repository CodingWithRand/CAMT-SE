package Lab6.Bank;

import java.util.Date;

public class Account {
    private String accountNumber;
    private double balance;
    private double annualInterestRate;
    private Date dateCreated;

    public Account() {
        this.accountNumber = Long.toString(System.currentTimeMillis()); // Placeholder for account number
        this.dateCreated = new Date();
        this.balance = 0;
        this.annualInterestRate = 0;
    }

    public Account(double air) {
        this();
        this.annualInterestRate = air;
    }

    public Account(double balance, double air) {
        this(air);
        this.balance = balance;
    }

    public void deposit(double amount) {
        balance += amount;
        System.out.println("Deposited " + amount + " to your account.");
    }

    public void withdraw(double amount) {
        if(balance - amount < 0) {
            System.out.println("Your withdraw cannot be processed: Your account doesn't have enough money.");
            return;
        }
        balance -= amount;
        System.out.println("Withdrawn " + amount + " from your account.");
    }


    public String getAccountNumber() {
        return accountNumber;
    }
    public double getAIR() {
        return annualInterestRate;
    }
    public Date getCreatedDate() {
        return dateCreated;
    }
    public double getBalance() {
        return balance;
    }
    public void setBalance(double newBalance) {
        balance = newBalance;
    }

    @Override
    public String toString() {
        return "Account Info\n" +
                "Account Number: " + this.accountNumber + "\n" +
                "Current Balance: " + this.balance + "\n" +
                "Interest Rate: " + this.annualInterestRate + "\n" +
                "Date Created: " + this.dateCreated;  
    }
}
