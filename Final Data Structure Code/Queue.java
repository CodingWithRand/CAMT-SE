/** Queue - FIFO (First In First Out)
 * 
 * Imagine a queue of people line up to buy a ticket. 
 * When new people come to buy a ticket, they wait at the back of the queue.
 * And for the front of the queue, when they finished buying the ticket, they leave the queue.
 * Which means, add to the back, remove from the front (FIFO)
 * 
 * Application in real life: Literally any queue system. Whether it's lining up to buy something, queueing the task to a printer, managing tasks in sequences.
 * 
 * 3 ways to implement queue
 * 1. Array
 * 2. Linked List
 * 3. Stack (Involving 2 stacks moving elements from one to the other - I won't go into deep detail but if you want to. Here @see https://www.geeksforgeeks.org/dsa/queue-using-stacks/)
 * 
 * Terms:
 * Enqueue: Add to the back of the queue
 * Dequeue: Remove from the front of the queue
 * Peek/Front: Return the element at the front of the queue
 */

// Array-based queue & Fixed size.
public class Queue<T> {
    private T[] arr;
    private int front; // Front/Head pointer
    private int rear; // Rear/Tail pointer

    public Queue(int size) {
        this.arr = (T[]) new Object[size];
    }

    // When enqueueing, you move the rear pointer. Front pointer remain the same.
    public void enqueue(T el) {
        if(!isFull()) this.arr[this.rear++] = el;
    }
    
    // When dequeueing, you move the front pointer. Rear pointer remain the same.
    public T dequeue() {
        if(!isEmpty()) return this.arr[this.front++];
        return null;
    }

    public void dequeueAll() {
        while(!isEmpty()) this.dequeue();
    }

    public T front() {
        if(!isEmpty()) return this.arr[this.front];
        return null;
    }

    public boolean isEmpty() {
        return this.front == this.rear;
    }

    public boolean isFull() {
        return this.rear == this.arr.length;
    }

    public int size() {
        return this.rear - this.front;
    }

    public void traversal() {
        for(int i = this.front; i < this.rear; i++) System.out.print(this.arr[i] + " ");
        System.out.println();
    }
}
