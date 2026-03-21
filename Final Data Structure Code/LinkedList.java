class Node<T> {
    private T data;
    private Node<T> next;
    private Node<T> prev;

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

    public Node<T> getPrev() {
        return this.prev;
    }

    public void setPrev(Node<T> prev) {
        this.prev = prev;
    }

    @Override
    public String toString() {
        return this.data.toString();
    }
}

/** LinkedList
 * 
 * The problem with traditional static array is that; 
 * When you want to insert an item, let's say, in the middle of the array, you have to shift all the elements on the right to the right.
 * Every element in an array is contiguous, making it hard to insert an element in the middle.
 * But in the real world, cases like that happens. This can raise performance issue O(n).
 * 
 * With LinkedList, you can insert an element anywhere quickly. Also, the size is not fixed, unlike static array.
 * Think of it as a chain of nodes. Wanna add a new node in the middle? Deattach half of the nodes on the right, attach new node, then attach it back. Easy peasy.
 * 
 * LinkedList consists of nodes linking together. The node composition is depends on the type of linked list.
 * - Single linked list: The node has "head" and "next"
 * - Double linked list: The node has "head", "next", and "prev"
 * Circular linked list means the tail node is connected to the head node.
 * 
 * Terms:
 * - Head: Is where the data stores.
 * - Next: Contain the reference to the next node.
 * - Prev: Contain the reference to the previous node.
 * 
 * Application in real life:
 * - Music playlist: You can forward/rewind/shuffle track to play easily.
 * - Real-time ranking leaderboard: Data in the leaderboard updates real-time, which the order can be rearranged quickly. E.g. Marathon ranking.
 * - E-commerce order list
 */
public class LinkedList<T> {
    private Node<T> head;
    private Node<T> tail;
    // I didn't implement the proper way for every methods for "tail" (2-ways). Do it yourself if you want. I'm lazy now.
    private int size;

    public LinkedList() {}

    // Add data intuitively (Not through node)
    // Normally, without specifying current node, push it to the end.
    public void add(T data) {
        if(this.head == null) this.head = new Node<>(data);
        else add(this.head, data);
        this.size++;
    }

    private void add(Node<T> cn, T data) {
        if(cn.getNext() != null) add(cn.getNext(), data);
        else {
            this.tail = new Node<>(data);
            this.tail.setPrev(cn);
            cn.setNext(this.tail);
        }
    }

    // Append to the index i of the linked list
    public void addAt(int index, T data){
        if(this.size - index == 1) {
            add(data);
            return;
        }
        Node<T> tn = traverseTo(index);
        Node<T> nn = new Node<>(data);
        Node<T> nnn = tn.getNext();
        nn.setPrev(tn);
        nn.setNext(nnn);
        tn.setNext(nn);
        nnn.setPrev(nn);
        this.size++;
    }

    public void deleteAll() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    public void deleteFirst() {
        if(this.head == null) return;
        this.head = this.head.getNext();
        this.size--;
    }

    // Explanation
    // Although using different variable, when assigned, it assigned to the original "head" variable.
    // So, making any change will affect the original "head" variable.
    public void deleteLast() {
        if(this.head == null) return;
        if(this.size == 1) deleteFirst();
        Node<T> second_ln = traverseTo(this.size - 2);
        second_ln.setNext(null);
        this.tail = second_ln;
        this.size--;
        // deleteLast(this.head);
    }

    // private void deleteLast(Node<T> cn) {
    //     if(cn.getNext().getNext() == null) {
    //         cn.setNext(null);
    //         this.tail = cn;
    //         this.size--;
    //     } else deleteLast(cn.getNext());
    // }

    public void deleteAt(int index) {
        if(index == 0) deleteFirst();
        else if(index == this.size - 1) deleteLast();
        else {
            Node<T> cn = traverseTo(index);
            cn.getPrev().setNext(cn.getNext()); // Link the previous node target to the next one. (Skip target to remove)
            cn.getNext().setPrev(cn.getPrev()); // Link the next node target to the previous one. (Skip target to remove)
            this.size--;
        }
    }

    public T find(int index) {
        return traverseTo(index).getData();
    }

    private Node<T> traverseTo(int index) {
        Node<T> cn = this.head;
        for (int i = 0; i < index; i++) cn = cn.getNext();
        return cn;
    }

    public void traversal() {
        Node<T> cn = this.head;
        while(cn != null) {
            System.out.print(cn + " ");
            cn = cn.getNext();
        }
        System.out.println();
    }

    public void retraversal() {
        Node<T> cn = this.tail;
        while(cn != null) {
            System.out.print(cn + " ");
            cn = cn.getPrev();
        }
        System.out.println();
    }

    public int size() {
       return this.size;
    }
}