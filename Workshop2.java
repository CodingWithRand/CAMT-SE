// Implement my own ~~Queue~~ Stack class mb
// Or import built-in?
class Stack<T> {
    private int tp = -1;
    private T[] arr;

    public Stack(Stack<T> stack) {
        this.arr = stack.arr;
        this.tp = stack.tp;
    }

    public Stack(int size) {
        this.arr = (T[]) new Object[size];
    }

    public Stack(T[] arr) {
        this.arr = arr;
        this.tp = arr.length - 1;
    }

    public T pop() {
        if(isEmpty()) {
            System.out.println("Stack is empty.");
            return null;
        }
        return this.arr[this.tp--];
    }

    public T peek() {
        return this.arr[this.tp];
    }

    public void push(T elem) {
        if(isFull()) {
            System.out.println("Stack is full.");
            return;
        }
        this.arr[++this.tp] = elem;
    }

    public boolean isEmpty() {
        return this.tp == -1;
    }
    public boolean isFull() {
        return this.arr.length - this.tp == 1;
    }
}

class Student {
    public String sid;
    public String name;
    public char letterGrade;

    public Student(String sid, String name, char letterGrade) {
        this.sid = sid;
        this.name = name;
        this.letterGrade = letterGrade;
    }

    @Override
    public String toString() {
        return "-- Student Info --" + "\nID: " + this.sid + "\nName: " + this.name + "\nLetter Grade: " + this.letterGrade;
    }
}

class MyClass {
    private Stack<Student> students;

    public MyClass(Student[] students) {
        this.students = new Stack(students);
    }

    public MyClass(int classSize) {
        this.students = new Stack(classSize);
    }

    public void add(Student student) {
        this.students.push(student);
    }

    public void remove() {
        this.students.pop();
    }

    public void printAll() {
        Stack<Student> temp = new Stack(this.students);
        while(!temp.isEmpty()) {
            System.out.println(temp.pop());
        }
    }
}

public class Workshop2 {
    public static void main(String[] args) {
        // MyClass sec701 = new MyClass(new Student[]{
        //     new Student("123", "John Doe", 'A'),
        //     new Student("456", "Jane Doe", 'B'),
        //     new Student("789", "Jack Black", 'C')
        // });

        // sec701.printAll();

        MyClass sec702 = new MyClass(4);
        sec702.add(new Student("23453", "Marry Jane", 'B'));
        sec702.add(new Student("36753", "Hellen Keller", 'B'));
        sec702.add(new Student("45653", "Jeffrey Epstein", 'D'));
        sec702.add(new Student("88833", "David Bartlett", 'A'));
        sec702.add(new Student("23453", "Marry Jane", 'B'));
        sec702.add(new Student("36753", "Hellen Keller", 'B'));
        sec702.printAll();
        System.out.println();
        sec702.remove();
        sec702.printAll();
        sec702.remove();
        sec702.remove();
        sec702.remove();
        System.out.println();
        sec702.printAll();

        sec702.remove();
    }
}