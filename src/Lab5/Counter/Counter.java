package Lab5.Counter;

public class Counter {
    private int count;

    public Counter() {
        this.count = 0;
    }

    public void click() {
        this.count++;
    }

    public int getCount() {
        return this.count;
    }

    public void reset() {
        this.count = 0;
    }
}
