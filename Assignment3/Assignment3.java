import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

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
    public void deleteFirst() {
        if(this.head == null) return;
        this.head = this.head.getNext();
        this.size--;
    }

    public void deleteLast() {
        if(this.head == null) return;
        if(this.head.getNext() == null) {
            this.head = null;
            this.size--;
            return;
        }
        Node<T> ref = this.head;
        for(int i = 0; i<this.size; i++) {
            if(i == this.size - 2) {
                ref.setNext(null);
                break;
            }
            ref = ref.getNext();
        }
        this.size--;
    }

    public Object getLastElem() {
        Node<T> ref = this.head;
        for(int i = 0; i<this.size; i++) {
            if(i == this.size - 1) return ref.getData();
            ref = ref.getNext();
        }
        return null;
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

class Stack<T> {
    // private int tp = 0;
    // Assume the stack size is unlimited
    private LinkedList<T> ll;

    // Init empty stack is enough
    public Stack() {
        this.ll = new LinkedList<>();
    }

    public T pop() {
        if(isEmpty()) {
            System.out.println("Stack is empty.");
            return null;
        }
        T toPop = (T) this.ll.getLastElem();
        this.ll.deleteLast();
        return toPop;
    }

    public T peek() {
        return (T) this.ll.getLastElem();
    }

    public void push(T elem) {
        // if(isFull()) {
        //     System.out.println("Stack is full.");
        //     return;
        // }
        this.ll.add(elem);
    }

    public boolean isEmpty() {
        // return this.tp == -1;
        return this.ll.isEmpty();
    }

    public int getSize() {
        return this.ll.getSize();
    }
    // public boolean isFull() {
    //     return this.ll.getSize() - this.tp == 1;
    // }
    public void printStack() {
        this.ll.traversal();
    }
}

public class Assignment3 {
    public static boolean isInfix(String[] tokens) {
        int balance = 0;
        boolean expectOperand = true;
        
        for (String tok : tokens) {
            if (tok.isEmpty()) continue;
            if (tok.matches("\\d+")) {          // operand
                if (!expectOperand) return false;
                expectOperand = false;
            } else if (tok.equals("(")) {
                balance++;
                expectOperand = true;
            } else if (tok.equals(")")) {
                if (balance == 0 || expectOperand) return false;
                balance--;
                expectOperand = false;
            } else if (tok.matches("[+\\-*/^]")) { // binary operator
                if (expectOperand) return false;
                expectOperand = true;
            } else {
                return false; // unknown token
            }
        }
        return balance == 0 && !expectOperand;
    }

    public static void main(String[] args) throws FileNotFoundException {
        Scanner sc = new Scanner(new File(args[0]));
        Map<String, Integer> precedence = new HashMap<>();
        precedence.put("+", 1);
        precedence.put("-", 1);
        precedence.put("*", 2);
        precedence.put("/", 2);
        precedence.put("^", 3);
        
        Stack<String> cs;
        
        while(sc.hasNextLine()) {
            String exp = sc.nextLine().trim();
            String[] tokens = exp.split("");
            StringBuilder sb = new StringBuilder();
            cs = new Stack<>();
            
            for (int i = 1; i<tokens.length; i++) {
                if(Character.isDigit(tokens[i].charAt(0)) && Character.isDigit(tokens[i-1].charAt(0))) {
                    tokens[i-1] += tokens[i];
                    tokens[i] = "";
                }
            }
            
            // exp = String.join("", tokens);
            // for(String nt: tokens) System.out.print(nt + " ");
            
            System.out.println("Infix exp: " + exp);
            if(!isInfix(tokens)) {
                System.out.println("Not-Valid");
                continue;
            }
            System.out.println("Valid");
            
            for(String token: tokens) {
                if(token.length() == 0) continue;
                if(Character.isDigit(token.charAt(0))) sb.append(token);
                else if(token.matches("[\\(\\)\\+\\-\\*\\/\\^]")) {
                    if(token.equals("(")){
                        cs.push(token); 
                        continue;
                    } else if(token.equals(")")) {
                        while (true) {
                            if(cs.peek().equals("(")) {
                                cs.pop();
                                break;
                            }
                            sb.append(cs.pop());
                        }
                        continue;
                    }
                    // cs.printStack();
                    // System.out.println();
                    // System.out.println(cs.peek());
                    while(
                        cs.getSize() > 0 && 
                        precedence.get(cs.peek()) != null && 
                        precedence.get(token) <= precedence.get(cs.peek()) && 
                        !(token.equals("^") && cs.peek().equals("^"))
                    ) {
                        sb.append(cs.pop());
                    }
                    cs.push(token);
                    // System.out.println(token + " " +cs.peek()+" "+cs.getSize());
                }
            }
            // System.out.println(cs.peek() + " " + cs.getSize());
            while(!cs.isEmpty()) sb.append(cs.pop());
            System.out.println("Postfix exp: " + sb);
        }
    }
}
