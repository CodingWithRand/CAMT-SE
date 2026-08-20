package Midterm.review_ch2;


/**
 * # Intro
 * We have been through this before gng. <br>
 * https://github.com/CodingWithRand/CAMT-SE/blob/JAVA-OOP/src/Final.java
 * 
 * Murphy's Law: "anything that can go wrong, will go wrong"
 * 
 * What could go wrong tho?
 * - I/O
 * - Network
 * - Missing file
 * - Code logic
 * - Undefined/null computation.
 * - etc.
 * 
 * Of course, if we let those "wrong" things slide, the program will crash, and how would we explain it to user? How would they "understand" why it crashed?? <br>
 * That's why we need to be able to detect and handle all those "wrong" things. Unexpected situation needs to be handled, so the program will not crash.
 * 
 * But how exactly to "handle" it?
 * - Let the program crash (Nah, pls no.)
 * - Default value
 * - Notify user about the error
 * - Notify user about the error and let them make a decision what to do.
 * 
 * We need to write the instruction to handle those unexpected situation in the code before letting it happened.
 * 
 * # Checked & Unchecked
 * 1. Checked Exception
 * - Critical expected situation.
 * - Recoverable situation. (When handled, the issue will bedefinitely resolved, and doesn't crash the program.)
 * - Explicity declaration in the code; method header. (Like this method will "throws" such exceptions.)
 * - Require exception handling.
 * - Verify/Detect at compile time.
 * - E.g. IOException, FileNotFoundException, SQLException, etc.
 * 2. Unchecked Exception
 * - Less critical unexpected situation.
 * - Unrecoverable situation. (The error is still there, but handling it will prevent the program from crashing.)
 * - Doesn't require exception handling or explicit declaration in the code; method header.
 * - Although, you should still handle it.
 * - Verify/Detect at runtime.
 * - E.g. RuntimeException, NullPointerException, ArrayIndexOutOfBoundsException, ArithmeticException, etc.
 * 
 * # Try-catch-finally
 * The statement works like if-else block. **See in the testerr() method** <br>
 * Code will go in **try** block first, if an error occurred in try block, it goes to **catch** block. <br>
 * Everything eventually goes to **finally** block, whether the error occurred or not. Though, it's not necessary to have the **finally** block.
 * 
 * # Custom Exception & Specific Exception Handling
 * There are plenty of built-in exceptions in the Java API library. Each one is used to detect different situtations. <br>
 * They have different name which is easy to know what exception/situation the program is currently encountering, so we know how to write the handling logic code. <br>
 * E.g. FileNotFoundException is about when retrieving a file in the storage but it doesn't exist, so this exception is thrown. <br>
 * But there may be some specific cases in our program that is not covered by the built-in exception, so we need to create our own exception class. <br>
 * When you created your custom exception, you should consider whether it's "checked" or "unchecked" based on the program flow & requirement context. <br>
 * E.g. User submitting empty file to the program is more likely to be a checked exception as we can anticipated the user may accidentally do it, and we can ask user to resubmit again.
 * 
 * About handling specific exception, it's better because different exception will require different handling logic. <br>
 * So rather catching all exception (catch (Exception e)) and write the handling logic in that catch block... <br>
 * it's better to catch a specific exception (catch (ArithmeticException e)) and write the handling logic in that catch block.
 * 
 * Don't worry, there can be multiple catch block in the try-catch-finally. Just like if-(else if)-else.
 * 
 * # Throwing Exception in catch block
 * You can throw exception anywhere. You may throw in the catch block to pass the responsibility to handle it here to the upper level method. <br>
 * And in that upper level method, you may have a try-catch-finally block with multiple catch block for different exceptions. (Centralized exception handling.)
 */
public class _Exception {

    // Custom exception
    static class DivideBy67 extends ArithmeticException {
        public DivideBy67(String message) {
            super(message + " (die of cringe 🥀🚠🚡)");
        }
    }

    public static int fixtesterr(int d) /* Unchecked Exception might be thrown, no need to declare it.*/ {
        if (d == 67) {
            throw new DivideBy67("six sevenn, six seven!1!11, six seven, SIX SEVVEEN 😵");
        }
        return (int) (Math.random() * 1e10) % d;
    }

    public static void testerr() throws Exception /* Checked Exception might be thrown at line 94 so this declaration is needed.*/ {
        try {
            // suppose normal flow.
            System.out.println("working...");
            // suddenly an error occurs.
            System.out.println(fixtesterr(67)); // <-- Throw a specific exception (67). Goes to line 92 next
            throw new Exception("oops!"); // <-- Throw a general exception. Goes to line 95 next
        } catch (DivideBy67 e67) { // <-- Catch a specific exception (67).
            e67.printStackTrace(); // show all the information about the error (easy to debug).
            throw new Exception("not 67 again...", e67); // This will be thrown to the upper level method (main).
        } catch (Exception e) { // <-- Catch any exception.
            // handle the error.
            System.out.println("sorry, let me fix this, give me a moment...");
            e.printStackTrace();
        } finally {
            System.out.println("finished. continue your work.");
        }
    } 

    public static void main(String[] args) {
        try {
            testerr();
        } catch (Exception e) {
            // handle the error.
            System.out.println("something went wrong...");
            e.printStackTrace();
        }
    }
}
