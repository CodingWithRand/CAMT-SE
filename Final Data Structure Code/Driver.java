public class Driver {
    public static void main(String[] args) {
        System.out.println("-- Stack --");
        Stack<Integer> s = new Stack<>(5);
        s.push(1);
        s.push(1);
        s.push(1);
        s.push(1);
        s.push(2);
        System.out.println(s.size());
        s.push(4); // This will not be added as it exceeds the size.
        s.traversal();
        System.out.println(s.pop());
        System.out.println(s.peek());
        s.traversal();
        s.popAll();
        System.out.println(s.pop()); // Null cuz stack is empty
        s.traversal(); // No result, the stack is empty

        System.out.println("-- Queue --");
        Queue<String> q = new Queue<>(3);
        q.enqueue("W");
        q.enqueue("WT");
        q.enqueue("WTH");
        q.enqueue("WTF"); // This will not be added as it exceeds the size.
        System.out.println(q.size());
        q.traversal();
        System.out.println(q.dequeue());
        System.out.println(q.front());
        q.traversal();
        q.dequeueAll();
        System.out.println(q.dequeue()); // Null cuz queue is empty
        q.traversal(); // No result, the queue is empty

        System.out.println("-- LinkedList --");
        LinkedList<Integer> ll = new LinkedList<>();
        ll.add(1);
        ll.add(2);
        ll.add(4);
        ll.addAt(1, 3);
        ll.traversal();
        ll.retraversal();
        ll.deleteAt(2);
        ll.traversal();
        ll.deleteLast();
        ll.traversal();
        ll.deleteFirst();
        ll.traversal();
        ll.add(3);
        ll.add(4);
        ll.add(5);
        ll.add(6);
        ll.add(7);
        ll.traversal();
        ll.retraversal();
        System.out.println(ll.find(3).toString()); // Should be 5
        // System.out.println(ll.find(8).toString()); // Should be null or error
        System.out.println(ll.size());
    }
}
