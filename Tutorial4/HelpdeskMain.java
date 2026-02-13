import java.util.Scanner;
import java.util.Vector;

public class HelpdeskMain {
    public static void w(long ms) {
        // simulate wait
        long now = System.currentTimeMillis();
        while(System.currentTimeMillis() - now < ms) {}
    }

    public static void printQueueSize(StudentQueue q) {
        System.out.println((q.isEmpty() ? "The queue is empty" : ("Queue Size: " + q.size())));
    }

    public static void printWaitingQueue(StudentQueue q) {
        if (!q.isEmpty()) System.out.println("Waiting Queue (for " + q.last() + "): " + (q.size() - 1));
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Please enter student name (enter 'quit' for exit the program):");
        Vector<String> temp = new Vector<>();
        boolean stop = false;
        do {
            String name = sc.next();
            if (name.equals("quit")) {
                stop = true;
                continue;
            }
            temp.add(name);
        } while (!stop);

        System.out.println();
        StudentQueue q = new StudentQueue(5); // Suppose the queue capacity is 5
        System.out.println("Initial Queue");
        printQueueSize(q);
        System.out.println();

        for(String name: temp) {
            try {
                q.enqueue(name);
            }
            catch (Exception e) {
                System.out.println(e.getMessage());
                break;
            }
            System.out.println("Enqueued " + name);
            System.out.println(q.toString());
            printQueueSize(q);
            printWaitingQueue(q);
            w(1000);
        }
        
        int randomlySelectedIndex = (int)(Math.random() * q.size());
        System.out.println("\n" +temp.get(randomlySelectedIndex) + " is at position " + (q.search(temp.get(randomlySelectedIndex)) + 1) + " in the queue.");

        System.out.println("\nStart dequeueing\n");

        for(String not_using_this_var: temp) {
            w(2000);
            String finishedStudent;
            try {
                finishedStudent = q.dequeue();
            }
            catch (Exception e) {
                System.out.println(e.getMessage());
                break;
            }
            System.out.println("Dequeued " + finishedStudent);
            System.out.println(q.toString());
            printQueueSize(q);
            printWaitingQueue(q);
        }
    }
}