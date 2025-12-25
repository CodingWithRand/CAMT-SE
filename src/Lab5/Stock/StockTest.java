package Lab5.Stock;

public class StockTest {
    public static void main(String[] args) {
        Stock oracle = new Stock("ORCL", "Oracle Corporation");
        oracle.setPreviousClosingPrice(34.5);
        oracle.setCurrentPrice(34.35);

        System.out.println("Previous Closing Price: " + oracle.getPreviousClosingPrice());
        System.out.println("Current Price: " + oracle.getCurrentPrice());
        System.out.println("Price Change: " + oracle.getChangePercent() + "%");
    }
}
