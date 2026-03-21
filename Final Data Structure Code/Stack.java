/**
 * Stack -> LIFO (Last In First Out)
 * 
 * Imagine a pile/stack of books. Normally you'd pick the book on the top out of the stack.
 * (In case you can pick 1 book at a time, and you're not searching the book.)
 * The first book that will get picked out is the one that you added first at the top; Insert at the top, remove from the top. (LIFO)
 * 
 * Example solution with Stack concept: Checking the balance of parentheses. You insert "(" and pop it out when ")" is found in string.
 * "((a)s)" is balance. Every () has its pair.                  (Result: Empty Stack)
 * "((a)" is not balance. There is no pair for the first "("    (Result: Not Empty Stack; Remaining: "(")
 * 
 * Other solution might be checking for palindrome but I might be wrong.
 * 
 * 3 ways to implement Stack:
 * 1. Array
 * 2. Linked List
 * 3. ADT List
 * 
 * Terms:
 * 1. Push: Adding an element to the stack
 * 2. Pop: Removing an element from the stack
 * 3. Peek: Returning the top element of the stack
 * Every OP is O(1)
 */

// Array-based stack & Fixed size.
public class Stack<T> {
    private T[] arr;
    private int pointer = -1;

    public Stack(int size) {
        this.arr = (T[]) new Object[size];
    }

    public void push(T el) {
        if(!isFull()) this.arr[++this.pointer] = el;
    }

    public T pop() {
        if(!isEmpty()) return this.arr[this.pointer--];
        return null;
    }

    public void popAll() {
        while(!isEmpty()) this.pop();
    }

    public T peek() {
        if(!isEmpty()) return this.arr[this.pointer];
        return null;
    }

    public boolean isEmpty() {
        return this.pointer == -1;
    }

    public boolean isFull() {
        return this.arr.length - this.pointer == 1;
    }

    public int size() {
        return this.pointer + 1;
    }

    public void traversal() {
        for(int i = 0; i <= this.pointer; i++) System.out.print(this.arr[i] + " ");
        System.out.println();
    }
}
