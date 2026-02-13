// Array-based queue.
// Additional methods for challenge: search() <- use normal linear search btw, cuz it's just array at the end of the day.

public class StudentQueue {
    private final String[] storage;
    private final int capacity;
    private int size;
    private int fp;
    private int rp;

    public StudentQueue(int size) {
        this.capacity = size;
        this.storage = new String[size];
    }    

    public int size() {
        return this.size;
    }
    public boolean isEmpty() {
        return this.size == 0;
    }
    public boolean isFull() {
        return this.size == this.capacity;
    }

    public void enqueue(String name) {
        if (isFull()) throw new RuntimeException("Queue is full");
        this.storage[this.rp] = name;
        this.rp++;
        this.size++;
    }

    public String dequeue() {
        if (isEmpty()) throw new RuntimeException("Queue is empty");
        this.size--;
        return this.storage[this.fp++];
    }

    public String first() {
        if (isEmpty()) {
            System.out.println("Queue is empty");
            return null;
        }
        return this.storage[this.fp];
    }
    public String last() {
        if (isEmpty()) {
            System.out.println("Queue is empty");
            return null;
        }
        return this.storage[this.rp - 1];
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for(int i = this.fp; i < this.capacity; i++) {
            sb.append(this.storage[i]);
            if(i < this.capacity - 1) sb.append(", ");
        }
        sb.append("][first = ");
        sb.append(this.fp);
        sb.append(", rear = ");
        sb.append(this.rp);
        sb.append(", length = ");
        sb.append(this.size);
        sb.append("]");
        return sb.toString();
    }

    public int search(String name) {
        for(int i = this.fp; i < this.rp; i++) {
            if(this.storage[i].equals(name)) {
                return i;
            }
        }
        return -1;
    }
}