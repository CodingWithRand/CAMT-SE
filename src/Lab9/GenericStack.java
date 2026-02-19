package Lab9;

public class GenericStack<E> {
  private E[] list = (E[]) new Object[2]; // begin with 2 elem.
  private int tp = -1;

  public int getSize() {
    return this.tp + 1;
  }

  public E peek() {
    if(isEmpty()) return null;
    return this.list[this.tp];
  }

  public void push(E o) {
    this.tp++;
    if(this.tp == this.list.length) {
        E[] doubledSize = (E[]) new Object[this.list.length * 2];
        System.arraycopy(this.list, 0, doubledSize, 0, this.list.length);
        this.list = doubledSize;
    }
    this.list[this.tp] = o;
  }

  public E pop() {
    if(isEmpty()) return null;
    E o = this.list[this.tp];
    this.list[this.tp--] = null;
    return o;
  }

  public boolean isEmpty() {
    return this.tp == -1;
  }
  
  @Override
  public String toString() {
    return "Stack: " + java.util.Arrays.toString(this.list);
  }

  public static void main(String[] args) {
    GenericStack<Integer> stack = new GenericStack<>();
    System.out.println("Size: " +stack.getSize());
    System.out.println(stack);
    System.out.println("Peeked: " + stack.peek());
    System.out.println("Popped: " + stack.pop());

    stack.push(1);
    stack.push(2);
    stack.push(3);
    System.out.println("Size: " +stack.getSize());
    System.out.println(stack);
    System.out.println("Peeked: " + stack.peek());
    System.out.println("Popped: " + stack.pop());
    System.out.println("Size: " +stack.getSize());
    System.out.println(stack);
  }
}