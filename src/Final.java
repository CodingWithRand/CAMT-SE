import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Vector;

/** Polymorphism 
 * Poly (many) + Morpho (forms)
 * In Java, literally translate, it means one name (class/methods) can perform a task in different ways.
 * 
 * Pros
 * 1. Code Reusability
 * 2. Reduce code coupling with many similar methods in different name.
 * 3. One variable, multiple datatypes (Literally its name.)
 * 
 * Cons
 * 1. Performance issues
 * 2. Code Readability
 * 3. Hard to implement (Personal opinion ig.)
 * 
 * 4 types of Polymorphism
 * 1. Ad-hoc/Overloading
 * 2. Inclusion/Overriding
 * 3. Assignment/Polyphormic Variable
 * 4. Generic/Template
 * 
 * Ad-hoc Polymorphism
 * - Overloading -> You define a method with different method signature (params number and type), but same name.
 * - Access Modifier and return type are NOT included in method signature.
 * - Compile-time polymorphism -> meaning that compiler is the one to choose which method to be executed base from method signature.
 * 
 * Inclusion Polymorphism
 * - Overriding -> A special type of overload, but in a child class that extends the method from parent class.
 * - Inheritance relationship is needed.
 * - Method is defined with the same header to the parent class in child class, but different body.
 * - Runtime polymorphism -> The method to executed is designed base from the actual value of the object in runtime.
 * - You CANNOT override final, static, and private methods.
 * 
 * Assignment Polymorphism
 * - Polymorphic variable -> Pure polymorphism
 * - Declared one-type variable can hold more than one type of object. (The declared type and its subclass types)
 * 
 * Casting rules 
 * - Implicit casting: Declare variable with parent class type, but the assign value is the child class type. (No explicit casting needed.)
 * - Explicit casting: Declare variable with child class type, but the assign value is the parent class type. (Explicit casting is required.)
 * - Analogy: An apple is always a fruit, but a fruit is not always an apple. 
 *   -> Child class will always be parent class, (Implicit casting)
 *   -> but parent class is not necessarily be child class. (So, explicit casting is required to confirm that this parent is in form of a child.)
 * - Note that the explicit cast will only work if the parent class variable ONLY holds the value of child class (Fake parent), otherwise runtime error occur
 * 
 * Generic
 * - See Generic class below.
 * 
 * Dynamic Binding
 * - The way JVM design which class's method to execute during runtime.
 * - Happen when passing argument in a method that accept superclass type params like "Object"
 * - Override
 * - The search for binding starts from the narrowest class type (the passing object), search for overriden method. If found, execute that, if not, look in to the next layer of super class.
 * */ 

class Polymorphism {
    // Original method
    public static void overloadable(int n) {
        System.out.println("This print one number " + n);
    }
    // Overloaded one
    public static void overloadable(int n1, int n2) {
        System.out.println("This print two numbers " + n1 + " and " + n2);
    }

    // Original method
    public void overridable(int n) {
        System.out.println("This print one number " + n);
    }
}

class ChildPolymorphism extends Polymorphism {
    // Overridden one
    @Override
    public void overridable(int n) {
        System.out.println("This print on- Wait... Nvm, here you go: " + n);
    }
}

/** Generics
 * - A form of polymorphism. Basically, the class or method is compatible with many different type -> type-parameterized class/method.
 * - Generic is implemented in around JDK 1.5 or 1.6. 
 * - Prior to that version, you declare a variable with raw, unfiltered type, which prone to runtime error when different incompatible type is being used on the class/method.
 * - Implementing generic will make the error be able to be detected at compile-time. This improve reliability.
 * - Generic type parameter is declared between "<>". There can be more one generic type parameter.
 * - The generic type it will later be supplied by the actual "concrete type" (Class type that's instantiatable).
 * - Compiler use the "type erasure" approach on generic type variable. The type is used to compile, then erased later.
 * - This support backward compatibility to older version of Java.
 * - For class, although the supplied type is different, the object is based on the same class. So, Generic<String> is from the same class as Generic<Integer>.
 * 
 * Restriction
 * 1. Uninstantiatable; You cannot create an object or an array from the generic type.
 * 2. Cannot use generic type on Exception.x    
 * 3. Cannot use generic on "static" method in the class.
 */

// Generic class - Class<GenericTypeParam1, GenericTypeParam2, ...>
class Generic<F, S/*, TH*/> {
    /** Generic type naming example
     * T = General Type
     * E = Collection's Element
     * K = Map's Key
     * V = Map's Value
     * S, U = Other general type
     */

    // Usage: just use the name (T, S) as the type modifier when declaring variables/method parameters
    public F first;
    public S second;
    // Cannot use generic type on "static"
    // public static TH third;
    // In the compiled code, the generic type may be converted to raw Object type.

    public Generic(F first, S second) {
        this.first = first;
        this.second = second;
    }

    // Generic method - Type parameter goes between access modifier and return type
    // Generic type here is fine, because it's "declaring", not "passing" the type from the class.
    public static <E> void printList(List<E> l) {
        for(E elem: l) System.out.print(elem + " ");
        System.out.println();
    }

    // Accept any type that implements Comparable class or Comparable class itself.
    public static <E extends Comparable<E>> void sortList(List<E> l) {
        // Bubble sort, easy
        boolean swapped = true;
        for(int i = 0; i<l.size() - 1; i++) {
            if(!swapped) break;
            swapped = false;
            for(int j = 1; j<l.size(); j++) {
                if(l.get(j-1).compareTo(l.get(j)) > 0) {
                    swapped = true;
                    E temp = l.get(j-1);
                    l.set(j-1, l.get(j));
                    l.set(j, temp);
                }
            }
        }
    }

    /**
     * Generic wildcard - Used to filter the type that the generic method. NEVER USED IT AS A TYPE!
     * <?> / <? extends Object> - Unbounded - accept any.
     * <? extends T> - Bounded - accept T and any that extends T.
     * <? super T> - Lower bounded - accept T and any that is a super class of T.
     * 
     * So, the placement goes only in the generic class type parameter.
     */
    // Print out any type of element in vector
    public static /* <?> <--- Never put it here */ void printVector(Vector<?> v) {
        for(Object elem: v) System.out.print(elem + " ");
        System.out.println();
    }

    // Print out the sum of floored numerical value in the vector -> only accept Number type
    public static void pirntSumOfFlooredElementVector(Vector<? extends Number> v) {
        int sum = 0;
        for(Number elem: v) sum += (int)Math.floor(elem.doubleValue());
        System.out.println(sum);
    }
}

/**
 * Abstract class -> A template class (methods & variables).
 * 
 * Characteristic
 * 1. Similar to class, but required AT LEAST 1 abstract method.
 * 2. Cannot be instantiated; you can't create and object from it. However, an array is okay.
 * 3. Abstract method needs to be implemented in the child class.
 * 4. Contain abstract methods and constant variables, along with non-abstract methods, other kinds of variables you usually find in a normal class.
 * 
 * Abstract class helps
 * 1. Reduce code duplication -> shorter code, increase code reusability, loosen code coupling
 * 2. Gaining abstraction
 * 3. Dynamic resolution (Runtime polymorphism)
 * 4. Template -> Implementation vary in each class for the same name of methods -> Changes of implementation doesn't affect other classes.
 * 
 * Disadvantage
 * 1. You'll have to implement every abstract methods in the child class that it extends from. Even if some methods are unnecessary.
 * 2. Relational impedance mismatch for working with RDBMS (Basically, the data flow doesn't have maximized efficient. Don't worry if you don't understand. Maybe you can think as it doesn't work well with RDBMS)
 * 3. Regarding (2), you need to do extra relational mapping with Hibernate framework. (Don't worry too much about this.)
 * 
 */

abstract class AbstractClass {
    public final int someRandomNumber = 50;

    // Construction is okay, despite uninstantiatable. (Child class will call it.)
    public AbstractClass() {
        System.out.println("Hi abstract class here!" + this.someRandomNumber);
    }

    // Normal method.
    public void confusion() {
        System.out.println("I'm in abstract class but I'm not abstract... Okay?");
    }

    // An abstract method. (Required)
    public abstract void justDoWhateverToMe();
}

// Utilize the abstract class by extending it (Normal inheritance)
class TestAbstract extends AbstractClass {
    // The method implementation below is required OR compile-time error.
    @Override
    public void justDoWhateverToMe() {
        System.out.println("Thank you for using me! :D");
    }
}

/** Interface -> Define the common behaviors of a class (including unrelated one)
 * 
 * Everything is pretty much the same as abstract class and normal class. EXCEPT!
 * 1. Only abstract methods and constant (final) variables are in the interface.
 * 2. No constructor -> Uninstantiatable.
 * 3. It's a special class. (Slide doesn't tell you why, go google it yourself.)
 * 
 * Regarding (1), you can omit final & abstract keywords when defining method/datafield in the interface.
 * 
 * Example built-in interfaces I'm showing you are "Comparable" and "Clonable".
 */

interface NerdInterface {
    // Full datafield declaration
    public final static double PI = Math.PI;
    // Short-hand ("public final static" is omitted)
    double E = Math.E;

    // public NerdInterface() {} // A constructor is nuh-uh
    // public double getE() { return E; } // Normal method is also nuh-uh
    // public String name; // Applied to normal datafield as well.

    // Full abstract method declaration
    public abstract void cuddleMe();
    // Short-hand ("public abstract" is omitted)
    void patMyHead();
}
interface Reality {
    void wakeUp();
}

// A class that implements the interface. You see, you can implement multiple interfaces.
class Nerd implements NerdInterface, Reality, Comparable<Nerd>, Cloneable {
    public int IQ;

    public Nerd(int IQ) { this.IQ = IQ; }

    /**
     * Comparable interface from java.lang consists of one abstract method, compareTo(). 
     * Used when you want to compare two objects. -> Use with sorting. (Single sequence sorting with single value.)
     * The basic class like Integer/String/Double/etc. implements this, therefore the presence of compareTo().
     * 
     * In this example, we compare the IQ of two nerds with our custom implementation of compareTo().
     */
    @Override
    public int compareTo(Nerd n) {
        if(this.IQ > n.IQ) return 1;
        else if(this.IQ < n.IQ) return -1;
        else return 0;
    }

    /**
     * Cloneable interface from java.lang allows the object to be clonable with the clone() method.
     * The result from clone() is an exact copy of the original object. (By default)
     * Meaning you don't have to do hard/manual copy by yourself which is slow.
     * 
     * For default clone, return "super.clone()". But you can also customize your own "shallow" or "deep" clone in the clone() method if you want.
     * "Shallow clone", copy just the object value, not its reference.
     * "Deep clone", copy everything includes nested objects.
     */
    @Override
    public Nerd clone() throws CloneNotSupportedException {
        return (Nerd) super.clone();
    }

    @Override
    public void wakeUp() { System.out.println("Stop daydream, and answer me the Maxwell's equation"); }
    @Override
    public void cuddleMe() { System.out.println("Thanks! Here, I give you my " + NerdInterface.PI); }
    @Override
    public void patMyHead() { System.out.println("I feel so comfortable. Let me chant the value of E to you: " + NerdInterface.E); }
}

/* So, what to choose? Abstract class OR Interface? 
 * - Strong is-a relationship -> abstract class (e.g. Staff member is a Person)
 * - Weak is-a relationship -> interface (Just like the definition, it only describes the behavior)
 * 
 * Want multiple inheritance? You can inherit one class and use multiple interfaces.
 * But beware of the conflicts that may come with, when two constant variables/abstract methods have the same name/signature are defined in different interfaces.
 * 
 * UML Diagram (cont.)
 * "#" - protected access modifier
 * italicized name - abstract class/method name or interface name
 * dashed line hollow arrow relationship - interface relationship (-------|>)
 */

/** Exceptions
 * As program run, error can happen in your program. Which for normal flow, it can terminate your program. We don't want that.
 * Instead, we want to handle the error and let the program continue to run. Exception comes to your aid.
 * 
 * In Java, there are two types of error. One that you can handle, and one that you can't.
 * For the error that you can't handle, once it happens you have to let it slide. There's nothing you can do to fix it.
 * The most you can do is notifying user and try to terminate the program gracefully.
 * This kind of error belong to the Error class. The kind of error is systematic error, which rarely happens.
 * 
 * For another kind, it belongs in the Exception class. You can handle this kind of error in "try-catch" block.
 * It's like a bug in your code or from the input data.
 * 
 * Both error belong to the Throwable class, the super class of all errors & exceptions.
 * Only the Throwable class and its children can be thrown with "throw" keyword or JVM.
 * 
 * Checked & Unchecked Exceptions
 * - Unchecked: Include Error and RuntimeException. You don't need to handle (throw/catch) it, as it's unpredictable may required a lot of handle cases -> a lot of try-catch blocks.
 * - Unchecked Exception Examples: NullPointerException (Accessing unassigned variable), IndexOutOfBoundsException (Accessing array index out of range)
 * - Checked: Include any other exceptions. You need to handle it
 * 
 * Handling Checked Exceptions
 * - In the method that might throws checked exceptions, declared the certain exceptions with "throws" keywords when declaring the method.
 * - The method that declared the exception with "throws" keyword, must be wrapped in try-catch block.
 * - Checked exception examples: IOException (Reading from a file that doesn't exist)
 * 
 * Your custom exception - You can create one by extending the Exception class. Do it in case pre-defined exception doesn't fit your needs. You should do this with the API.
 * 
 * Rule of thumb <br>
 * Although using exception makes the code cleaner by separating normal flow logic and error handling logic...
 * Only use exception handling/try-catch block when it's really needed. Don't overuse it on simple/predictable error. 
 * As it uses quite a lot of resource and take some time to -> Create exception object -> Throw exception & rollback call stack -> Propagate error to caller
 * Try to resolve everything in the method (like using if statement) before deciding to throw an exception.
 */
// My custom exception
class ImTiredException extends Exception {
    public ImTiredException(String message) {
        super(message + " It's already: " + (LocalDateTime.now()).format(DateTimeFormatter.ISO_LOCAL_TIME));
    }
}

/** I/O
 * In java, performing Input and Output is done through "stream" (a sequence of data)
 * But before jumping right in, let's see what we can do about I/O here.
 * 1. Create file, store data in file.
 * 2. Network communication between device. (Really?)
 * 3. Communication with user through console. Take user input, and print output.
 * 
 * Stream is categorized into 2 groups: Byte and Character
 * - Byte stream manage raw 8-bits byte data, often work with writing/reading image/audio/video data.
 * Data to write and data to read need to be both byte.
 * InputStream and OutputStream are the abstract super class for all the byte stream class in java.
 * - Character stream manage 16-bits unicode character data, often work with writing/reading text data.
 * Reader and Writer are the abstract super class for all the character stream class in java.
 * 
 * Examples of stream subclasses
 * - FileInputStream, FileOutputStream, FileReader, FileWriter: Deal with File data.
 * - DataInputStream, DataOutputStream, DataReader, DataWriter: Deal with java primitive data type.
 * - BufferedInputStream, BufferedOutputStream, BufferedReader, BufferedWriter: Read/Write data in bulk to improve performance (reduce disk access operations).
 * - PrintStream, PrintWriter: Deal with output through print() and println()
 * - InputStream, OutputStream: Super class for all byte stream
 * - InputStreamReader, InputStreamWriter: Convert from byte stream to character stream.
 * 
 * Java provided 3 standard streams: System.in (Input), System.out (Output), System.err (Error)
 * These stream are "Data stream" - the source/destination of data.
 * While "Processing stream" manipulate the data in stream, it may change the format or buffer it
 * Example is BufferedReader, which offers a way to read data line by line instead of just one character.
 */
class IO {
    // Note: there are many different ways to implement reading and writing data. These are just the examples in slide.
    public static void readAndWriteInConsole() throws IOException {
        // Don't use scanner here 
        /* Use buffer reader.
         * Note: System.in type = InputStream -> Byte Stream
         *       BufferedReader -> Character stream
         * Hence, conversion needed. Wrap System.in with InputStreamReader to convert it to Character stream
         */
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in)); // Now System.in is a character stream and linked with buffer reader.
        // Use print writer to print out data
        /* Clarification
         * Normal System.out is fine for debugging purpose.
         * But for production, print writer is more preferred.
         */
        PrintWriter autoflush_pw = new PrintWriter(System.out, true); // Now System.out is linked with print writer
        PrintWriter pw = new PrintWriter(System.out);
        int adata = br.read(); // Read a single character from console (data is integer, -1 if EOL/EOF)
        pw.println("Data in integer: " + adata); // Print the read data right away
        pw.flush(); // If autoFlush is false or not set, you need to manually flush the print writer with flush() to get the output on the console.
        /* Clarification
         * This work like the buffer stream. When writing to stream, it keeps the data in stream but not send to the console yet to wait for more possible incoming data.
         * Calling flush() signal it to send the data to console.
         */
        pw.println("This message will not show until flush() is called.");
        pw.println("When tho?");
        // pw.flush();
        autoflush_pw.println("Data in character: " + (char) adata); // Convert to a character first. (The ASCII table)
    }

    public static void readAndWriteInFile() throws IOException, FileNotFoundException {
        // 1 way to read - FileInputStream.
        FileInputStream fis = new FileInputStream("random.txt");
        // 2 way to write - FileOutputStream and PrintWriter. If file does not exist, it will be created.
        FileOutputStream fos = new FileOutputStream("new_random.txt");
        PrintWriter pw = new PrintWriter("new_random.txt");
        // Check for EOL, continue printing until it hits.
        while(fis.read() != -1) System.out.print((char) fis.read()); // Don't expect the print out data to match the data in the file. We use it wrong anyway. (Byte stream for text what are you talking about??)
        // fos.write("Rand0MTutoriaL".getBytes()); // Data to be written need to be in byte, use getBytes()
        pw.print("ZzzZZz..."); // Write string directly
        pw.flush(); // Don't forget to flush the print writer

        // Don't forget to close streams to prevent memory leak. (Unused resources are still allocated.)
        pw.close();
        fis.close();
        fos.close();

        // As so many forget, Java since JDK 7 provide this auto-close feature.
        try(FileInputStream fis2 = new FileInputStream("new_random.txt")) {
            while(fis2.read() != -1) System.out.print((char) fis2.read());
        }
    }
}

public class Final {
    public static void exampleUnhandledUncheckedException() /* The "throws" is not required, however if left unhandled, the program terminate. */ {
        int[] arr = {1,3,44,5,543,4};
        System.out.println(arr[40]);
    }

    public static void cookieCutterAIOOBE() throws IndexOutOfBoundsException {
        int[] arr = {1,3,44,5,543,4};
        System.out.println(arr[40]);
    }

    // 1st way to handle it
    public static void exampleHandledUncheckedException() {
        try {
            cookieCutterAIOOBE();
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Index out of bound");
        }
    }
    // 2nd way to handle it
    public static void exampleHandledUncheckedException2() throws IndexOutOfBoundsException {
        cookieCutterAIOOBE();
    }
    // 3rd way to handle it
    public static void exampleHandledUncheckedException3() {
        try {
            cookieCutterAIOOBE();
        } catch (IndexOutOfBoundsException e) {
            // You can throw another exception in catch block in case it can't be resolved here, or you just want to pass the buck.
            throw new IndexOutOfBoundsException("Index out of boun- Why redundancy tho?");
        }
    }

    public static void exampleCheckedException() throws IOException /* the "throws" is required as IOException is checked, or else compile-time error */ {
        File file = new File("nonexistent-file-12345.txt");
        FileReader reader = new FileReader(file); // Try to read file that doesn't exist -> FileNotFoundException throwed
        reader.close();
    }

    public static void shouldIContinueStudy() throws ImTiredException {
        // When you want to throw an exception, define it when declaring the method as well.
        if (LocalDateTime.now().getHour() >= 20) throw new ImTiredException("Nah, I wanna relaxed.");
        else System.out.println("Come at me pdfile!");
    }

    public static void main(String[] args) {
        System.out.println("-- Polymorhpism --");
        Polymorphism p = new Polymorphism();
        ChildPolymorphism cp = new ChildPolymorphism();
        
        // Overload - The two line below produce different output.
        Polymorphism.overloadable(67);
        Polymorphism.overloadable(6, 7);
        System.out.println();

        // Override - The two line below produce different output.
        p.overridable(1);
        cp.overridable(1);
        System.out.println();

        // Assignment Polymorphism
        Polymorphism childAsParent = new ChildPolymorphism(); // No casting, it's fine.
        ChildPolymorphism fakeParentAsChild = (ChildPolymorphism) childAsParent; // YOU MUST CAST IDIOT.
        
        // The two line below should produce same output.
        childAsParent.overridable(4);
        fakeParentAsChild.overridable(4);
        System.out.println();

        // instanceof operator. It's used to check if the variable is an instance of the class. (Not just having the exact same type, it concerns inheritance relationship too.)
        // The two line below should be printed out.
        if(childAsParent instanceof Polymorphism) System.out.println("Ok, you're an adult.");
        if(childAsParent instanceof ChildPolymorphism) System.out.println("Wait, you're an imposter! You're not adult!");
        // This line should not be printed out as there is no Comparable interface implemented in ChildPolymorphism
        if(childAsParent instanceof Comparable) System.out.println("How tho...");
        System.out.println();

        // Generic
        // Don't do this
        Generic exampleRawPair = new Generic(1, "First");
        // Do this instead
        Generic<Integer, String> examplePair = new Generic<>(1, "First"); // OR new Generic<Integer, String>(1, "First");
        Generic<Character, Integer> examplePair2 = new Generic<>('A', 1);

        exampleRawPair.first = "2"; // This will cause runtime error: Type incompatible
        // examplePair.first = "2"; // Compiler detected this error and will not compile the code until you fix it.
        
        // Although in compiled code, it may look something like this.
        // Generic examplePair = new Generic(1, "First");
        // examplePair.first = (int) 2;

        // Totally different data (type) in object, but from the same class.
        System.out.println(examplePair.first + ", " + examplePair.second);
        System.out.println(examplePair2.first + ", " + examplePair2.second);
        System.out.println();

        // Passing different data type to generic method, result is the same. (I mean it does the job in the same way.)
        List<Integer> elist1 = Arrays.asList(new Integer[] {23,4345,345,5,64656,75});
        List<String> elist2 = Arrays.asList(new String[] {"Ayo", "What", "the", "freak", "?"});
        List<Character> elist3 = Arrays.asList(new Character[] {'3', '4', 'd', 'R', 'j', ':'});
        Generic.printList(elist1);
        Generic.printList(elist2);
        
        Generic.sortList(elist1);
        Generic.sortList(elist3);

        Generic.printList(elist1);
        Generic.printList(elist3);

        Vector<Double> ev = new Vector<>();
        ev.add(1.4);
        ev.add(454.32);
        ev.add(96.12);
        Generic.printVector(ev);
        Generic.pirntSumOfFlooredElementVector(ev);
        System.out.println();

        System.out.println("-- Abstract class and Interface --");
        // AbstractClass ac = new AbstractClass(); // Cannot instantiate abstract class
        TestAbstract ta = new TestAbstract(); // OR AbstractClass ta = new TestAbstract(); as using abstract class as type is okay.
        // The line above should print something (The constructor of AbstractClass is called from TestAbstract) 
        
        // Normal method in abstract class
        ta.confusion();
        // Abstract method calling
        ta.justDoWhateverToMe();
        System.out.println();

        Nerd anerd = new Nerd(112);
        anerd.cuddleMe();
        anerd.patMyHead();
        anerd.wakeUp();

        try {
            Nerd nerb = anerd.clone(); // Clone the Nerd object.
            nerb.IQ = 90;
            // Nerd's IQ = 112
            // Nerb's IQ = 90
            // The custom compareTo() compare Nerd's IQ (1 if higher, 0 if equal, -1 if lower)
            // The line below should print 1 as Nerd's IQ is higher
            System.out.println(anerd.compareTo(nerb));

        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        System.out.println();

        // Exception
        System.out.println("-- Exception --");
        exampleHandledUncheckedException(); // Even the error/exception occured, it's handled in the method. So program continues to run.
        // exampleHandledUncheckedException3(); // Running this will terminate the program. (Exception handled by throwing new exception, basically not handled)
        // exampleUnhandledUncheckedException(); // Running this will terminate the program. (No exception handling)
        
        // Try-catch block with multiple exceptions (chaining catch)
        try {
            // Declared throws exception need to be wrapped in try-catch block.
            // Method that throw exception need to be wrapped in try-catch block as well.
            // Swap the order of these 4 lines to see the difference
            shouldIContinueStudy(); // Utilization of custom exception.
            exampleHandledUncheckedException3();
            exampleHandledUncheckedException2();
            exampleCheckedException();
        } catch (IOException ioe) {
            System.out.println("You tried to read non-existential file, didn't you?");
        } catch (IndexOutOfBoundsException ioobe) {
            System.out.println("You tried to access non-existential index, didn't you?");
        } catch (ImTiredException ite) {
            System.out.println(ite.getMessage());
        } finally {
            System.out.println("At last, all is well that ends well.");
        }
        System.out.println();

        // I/O
        System.out.println("-- I/O --");
        try {
            IO.readAndWriteInConsole();
            IO.readAndWriteInFile();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}