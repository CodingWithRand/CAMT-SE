// Topics that are not included: UML Diagram, Class Relationships, Built-in Classes
// UML Diagram and Class Relationships need picture for symbols, so just go look in the lecture slides.
// For the built-in classes, just look in the lecture slides and Java doc yourself.
// Here are the classes that we learned in the class:
/* 1. String
 * 2. Math
 * 3. Date
 * 4. Random
 * 5. Scanner
 * 6. Primitive Class Wrappers (Integer, Long, etc.)
 * 7. StringBuilder/StringBuffer
 * 8. BigInteger, BigDecimal
 */

/*
Intro to OOP
Structural/Modular Programming -> Break code down into functions/methods, which do their own job. (not messy/spaghetti code)
Procedural Programming -> Similar to the above. (Use top-down methodology)

Methodologies
1. Top-Down: View the big, overall picture. Define the main problems for each part, then look into the problems in detail, and specify featured solutions and implementations
2. Bottom-Up: View from each small problem, then accumulate the solutions. Integrate everything together to the main problem

OOP: Object Oriented Programming

OOP Ideas 
1. Treat code as objects/entities
2. Modularity; in the object has each method and data for their own purpose
3. Reusability; you can reuse/recall the methods in the object, and layout code structure (class)

3 Pillars of OOP (PIE)
1. Polymorphism (Shapeshifter)
2. Inheritance
3. Abstraction + Encapsulation
*/

import java.util.Date;

class Example {
    /* Data field defines object's state
     * You need to create an object to access it (through ".")
     * If no value assigned to the data field, its value become default value, according to its type (e.g. 0 for int, null for object) */
    String id; // Null for now.
    /* Constructor is a method that creates an object with the defined class as the blueprint.
     * If not provided, jvm sneak in a default constructor (empty body + no-arg constructor)
     * Create new object with "new" operator e.g. `new Example()` */
    Example() {
        // "this" keyword refers to the current object.
        // Execute the other constructor.
        this(Long.toString(System.currentTimeMillis()));
    }
    // Overloaded Constructor
    Example(String id) {
        // You should use "this" for clarity, especially when the name is the same, but it's optional for other cases.
        this.id = id;
        // printf() method. An adoption of the printf() function from C
        System.out.printf("A constructor for example class, id: %s is executed\n", this.id);
        System.out.printf("Hence, object id: %s is created\n", this.id);
    }
    // Class method defines object behavior
    void showExample() {
        System.out.println("""
        Top 1,252,802 people
        1. Dwayne Johnson
        2. Isaac Newton
        ...""");
    }
}

// Encapsulation -> data hiding, and organizing
class Encapsulation {
    /* Access modifiers:
    1. public: accessible from anywhere
    2. private: accessible within class only
    3. protected: accessible within class and its subclasses (including descendants)
    4. (none): "default" modifier; accessible within same package.
    */
    
    // Private data field; cannot be accessed through ".", need getter and setter
    private String secret = "secret really";
    // Public data field; can be accessed through "."
    public String randomQuote = "Every time I get that itch for a new car, I watch one of these and suddenly that itch goes away. Cars can be such a money pit.";
    
    /* Static data field
     * - no need to construct an object to access
     * - data field is declared, and its value is assigned when the class is loaded 
     * - shared by all objects of the class */
    public static int nCreated;
    
    public Encapsulation() {
        // Use the class name with "." to access static data field for clarity, but just nCreated works too 👍
        Encapsulation.nCreated++;
    }

    // Public (instance) getter method
    public String getSecret() {
        return this.secret;
    }
    // Public (instance) setter method
    public void setNewSecret(String newSecret) {
        this.secret = newSecret;
    }
    
    // Static method; can only access static data field.
    public static int howManyCreated() {
        return Encapsulation.nCreated;
    }
}

// Inheritance -> Analogy: inherit traits from parent. Reusing code. Creating hierachies
// Note: Every class IS a subclass of java.lang.Object

// Parent class
class Tower {
    protected String name;
    protected String acronymn;
    protected int floor;

    // No-arg constructor is required for parent class to prevent error from JVM when child class doesn't call "super()"
    public Tower() {
        this("Tower of Example Tower");
    }

    public Tower(String name) {
        this.name = name;

        String[] tokens = this.name.split(" ");
        char[] acronymnLetter = new char[tokens.length];
        for(int i = 0; i<tokens.length; i++) {
            acronymnLetter[i] = tokens[i].charAt(0);
        }

        this.acronymn = new String(acronymnLetter);
        this.floor = 10;
    }

    public String getName() {
        return this.name;
    }
    public String getAcronym() {
        return this.acronymn;
    }

    /* Overriding a method
     * Clarification: 
     *  toString() method is inherited from java.lang.Object.
     *  But the result from the primitive toString() is useless. (Like what'd you do with Tower@90e4f???)
     *  So we should override it with our own logic.
     * Overriding means:
     *  Changing the behavior of a method from parent class.
     *  Declare the method with the same signature (return type, name, args), but different body.
     *  @Override is optional, but you should do it for clarity.
     * Note:
     *  You CANNOT override private methods as it's inaccessible
     *  You CANNOT override static methods, even though you can access it. 
     *  (Consequence of overriding: the original static method from parent class becomes hidden.)
     */
    @Override
    public String toString() {
        return this.name + " (" + this.acronymn + ")";
    }
}

// Child class
class Citadel extends Tower {
    private boolean hasBossFight;

    public Citadel() {
        /* Use super() to call parent constructor.
         * "super" also refers to parent class
         * But since everything from parent class is inherited here, super.datafield/super.method() is basically the same as this.datafield/this.method()
         * UNLESS the inherited method is overridden in here, then super.method() != this.method()
         * DO NOT CALL WITH PARENT'S CLASS NAME LIKE Tower() -> Syntax error */
        super("Citadel of Example Citadel");
    }
    public Citadel(String name) {
        super(name);
        this.floor = 15;
    }
    public Citadel(String name, int floor) {
        super(name);
        this.floor = floor;
    }
    public Citadel(String name, int floor, boolean hasBossFight) {
        super(name);
        this.floor = floor;
        this.hasBossFight = hasBossFight;
    }

    // All the methods from Tower class (except the constructor) are inherited, you can use it here.

    public boolean hasBossFight() {
        return this.hasBossFight;
    }

    @Override
    public String toString() {
        return this.name + " (" + this.acronymn + ")\n" + "Floor Number: " + this.floor + "\n" + "Has Boss Fight: " + this.hasBossFight;
    }
}

// Child class with no explicit "super()"
class MonthlyTower extends Tower {
    private final String startDate = new Date().toString();
    private final String endDate = new Date(System.currentTimeMillis() + (1000L * 60L * 60L * 24L * 30L)).toString();

    public MonthlyTower() {;
        // JVM will sneak in "super()" here
        System.out.println("This tower will be available from " + this.startDate + " to " + this.endDate);
    }
}

public class Midterm {
    public static void main(String[] args) {
        /* Okay okay, let me explain something more before we start

           (1) When an object is created and assigned to a variable, the actual object is NOT assigned to the variable.
           It's the REFERENCE ADDRESS that's assigned to the variable.
           So, with the variable containing the reference address, you can access the object.

           Meaning, when you reassign the variable with the newly created object/other object.
           The variable holds the new reference address, replacing the old one.
           That makes the old object no longer has any reference address, it becomes a garbage.
           Java has a garbage collector to clean up those garbage.

           So, next time, if you have an object that you no longer use, assign the variable to null.
           That way, the garbage collector can clean up that object, because it lost the reference address.

           (2) String is a class. NOT A PRIMITIVE DATATYPE.
           This: 
            String s = "Hello";
           is equivalent to this:
            String s = new String("Hello");

           And because String is a class, reassigning its value means creating a new object. (And apply the extract (1) to this process too.)
           So, in fact, String value is IMMUTABLE because of the previous reason.

           But to optimize the memory, Java has *Interned String*
           So, if you have Strings with the same value, Each variables will point to the same String object.
           Which makes the condition s1 == s2 true. (Given String s1 = "Text"; and String s2 = "Text";)
           It compares if the object is the same one or not. If you want to compare value, use ".equals()"

           (3) Wrapper class boxing & unboxing
           Java does implicit conversion between primitive datatype and wrapper class.
           E.g. 
            Integer i = 1; 
           same as 
            Integer i = new Integer(1);
           
           And when printing out, you usually cannot print class out directly.
           But it works for the wrapper classes, because the wrapper class implicitly converts to primitive datatype.

        Alr, enough yapping. Let's get started with the test results.*/

        Example eg = new Example();
        eg.showExample();

        System.out.println();
        
        System.out.println(Encapsulation.howManyCreated() + " " + Encapsulation.nCreated);
        Encapsulation e = new Encapsulation();
        System.out.println(e.randomQuote);
        System.out.println(e.getSecret());
        e.setNewSecret("new secret");
        System.out.println(e.getSecret());
        System.out.println(Encapsulation.howManyCreated() + " " + Encapsulation.nCreated + "\n" + e.howManyCreated() + " " + e.nCreated);

        System.out.println();

        Tower ToIF = new Tower("Tower of Inevitable Failure");
        System.out.println(ToIF.toString());
        Citadel CoPE = new Citadel("Citadel of Pyramid Escapadus", 25, true);
        System.out.println(CoPE.toString());
        MonthlyTower UntitleTower = new MonthlyTower();
        System.out.println(UntitleTower.toString());
    }
}