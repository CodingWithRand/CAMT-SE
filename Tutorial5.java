import java.util.Arrays;
import java.util.Random;
import java.util.Vector;

class Node<T> {
    private T data;
    private Node<T> next;

    public Node(T data) {
        this.data = data;
    }

    public T getData() {
        return this.data;
    }

    public Node<T> getNext() {
        return this.next;
    }

    public void setNext(Node<T> next) {
        this.next = next;
    }

    @Override
    public String toString() {
        return "Node: " + this.data.toString();
    }
}

class LinkedList<T> {
    private Node<T> head;
    private int size;
    
    public void add(T data) {
        if(this.head == null) this.head = new Node<>(data);
        else add(this.head, data);
        this.size++;
    }
    public void add(Node<T> cn, T data) {
        if(cn.getNext() == null) cn.setNext(new Node<>(data));
        else add(cn.getNext(), data);
    }

    // delete the first element to maximize performance (O(1))
    public void delete() {
        if(this.head == null) return;
        this.head = this.head.getNext();
        this.size--;
    }
    // delete with index (O(n))
    public void delete(int index) {
        if(this.head == null) return;
        if(index == 0) delete();
        else {
            Node<T> prev_tn;
            Node<T> tn = this.head;
            Node<T> post_tn;
            for (int i = 0; i < index; i++) {
                if(i == index - 1) {
                    prev_tn = tn;
                    post_tn = tn.getNext().getNext();
                    prev_tn.setNext(post_tn);
                }
                tn = tn.getNext();
            }
        }
        this.size--;
    }
    // (specific) delete with Voter's sid (O(n))
    public void delete(String sid) {
        if(this.head == null) return;
        if(((Voter) this.head.getData()).getSID().equals(sid)) this.head = this.head.getNext();
        else delete(this.head.getNext(), sid);
        this.size--;
    }
    public void delete(Node<T> cn, String sid) {
        if(cn.getNext() == null) return;
        if(((Voter) cn.getData()).getSID().equals(sid)) cn.setNext(cn.getNext().getNext());
        else delete(cn.getNext(), sid);
    }

    public void deleteAll() {
        this.head = null;
        this.size = 0;
    }

    public boolean isEmpty() {
        return this.size == 0;
    }

    public void traversal() {
        Node<T> cn = this.head;
        while(cn != null) {
            System.out.println(cn);
            cn = cn.getNext();
        }
    }

    public int getSize() {
        return this.size;
    }
}

class Voter {
    private String fname;
    private String lname;
    private String sid;
    private Vector<String> previousElections;

    public Voter(String fname, String lname, String sid) {
        this.fname = fname;
        this.lname = lname;
        this.sid = sid;
    }

    public Voter(String fname, String lname, String sid, Vector<String> previousElections) {
        this.fname = fname;
        this.lname = lname;
        this.sid = sid;
        this.previousElections = previousElections;
    }

    public String getSID() {
        return this.sid;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("-- Voter's Info --");
        sb.append("\nName: ");
        sb.append(this.fname);
        sb.append(" ");
        sb.append(this.lname);
        sb.append("\nSID: ");
        sb.append(this.sid);
        sb.append("\nPrevious Elections Participated: ");
        if(this.previousElections == null) sb.append("None");
        else {
            for(String election: this.previousElections) {
                sb.append(election);
                sb.append(", ");
            }
            sb.delete(sb.length() - 2, sb.length());
        }
        return sb.toString();
    }
}

public class Tutorial5 {
    public static void main(String[] args) {
        // 1. Create LinkedList and add 10 voter applicants with previous elections
        LinkedList<Voter> voterList = new LinkedList<>();
        System.out.println("=== Adding 10 Voter Applicants with Election History ===");
        
        String[] firstNames = {"John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Laura", "James", "Mary"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"};
        String[][] elections = {
            {"2020 Presidential"},
            {"2020 Presidential", "2022 Midterm"},
            {"2022 Midterm"},
            {"2018 Midterm", "2020 Presidential", "2022 Midterm"},
            {"2020 Presidential"},
            {"2022 Midterm", "2024 Gubernatorial"},
            {"2018 Midterm", "2020 Presidential"},
            {"2020 Presidential", "2022 Midterm", "2024 Gubernatorial"},
            {"2024 Gubernatorial"},
            {"2020 Presidential", "2022 Midterm"}
        };
        
        for(int i = 0; i < 10; i++) {
            Vector<String> previousElections = new Vector<>();
            previousElections.addAll(Arrays.asList(elections[i]));
            Voter voter = new Voter(firstNames[i], lastNames[i], "SID-" + (i + 1), previousElections);
            voterList.add(voter);
            System.out.println("Added: " + firstNames[i] + " " + lastNames[i] + " with " + elections[i].length + " election(s)");
        }
        
        // 2. Random delete two applicants
        System.out.println("\n=== Randomly Deleting 2 Voter Applicants ===");
        Random random = new Random();
        int firstIndex = random.nextInt(10);
        int secondIndex = random.nextInt(10);
        
        System.out.println("Deleting index: " + firstIndex);
        voterList.delete(firstIndex);
        System.out.println("Deleting index: " + secondIndex);
        voterList.delete(secondIndex);
        
        // 3. Traverse through the linked list
        System.out.println("\n=== Traversing Remaining Voter Applicants ===");
        voterList.traversal();
        
        // 4. Show the remaining voter applicants count
        System.out.println("\n=== Remaining Voter Applicants Summary ===");
        System.out.println("Total remaining applicants: " + voterList.getSize());
        
        // 5. Delete all applicants
        System.out.println("\n=== Deleting All Voter Applicants ===");
        voterList.deleteAll();
        System.out.println("All applicants have been deleted.");
        
        // 6. Show the remaining applicants
        System.out.println("\n=== Final List Status ===");
        if(voterList.isEmpty()) {
            System.out.println("The voter list is now empty.");
        }
        voterList.traversal();
    }
}
