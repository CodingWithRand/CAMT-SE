package se233.chapter2.model;

public class CurrencyEntity {
    private Double rate;
    private String date;
    public CurrencyEntity(Double rate, String date) {
        this.rate = rate;
        this.date = date;
    }
    public Double getRate() {
        return rate;
    }
    public String getTimestamp() {
        return date;
    }
    @Override
    public String toString() {
        return String.format("%s %.4f", date, rate);
    }
}
