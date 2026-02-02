import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;
import java.util.regex.Pattern;

public class Main {
    // Hard code for today. Will optimize later.
    // Optimization done, I guess. Documentation later.
    public static void main(String[] args) throws FileNotFoundException {
        // Record the execution time
        long startTime = System.nanoTime();

        System.out.println("Program start:");
        System.out.println();

        File f = new File(args[0]);
        Scanner sc = new Scanner(f);
        
        // Characters count and lines count are being matched with notepad characters and lines count.
        int nChars = 0;
        int lines = 0;

        int nEmoticons = 0;
        final Pattern EMOJI = Pattern.compile("(?<!&\\w{1,45}|\\w{1,45})(?:(?<![)\\]}])[:;=8xX](?:[-^'\\\"*_])?[)(#LEDPpOo3/|\\[\\]{}]|(?<![\\[({](?:[\\w\\W]{0,45})|\\w{1,45})[)(#LDPpOo3/\\\\|\\[\\]{}](?:[-^'\\\"*_])?[:;=8xX](?!:)|(?>(?:[oO0;TXxv+~!*@?][-_^.]+[?@*!~;vXxToO0+])|TT|[.-=]_++[.-=]|[-=]\\.++[-=]|\\.-\\.|[*T]++[on_^.-][*T]++|=?\\^[-.o0]\\^=?)|(?:X:|:X))(?!\\w+)");
        int nTokens = 0;

        int nPalindromes = 0;

        int longestWordLength = 0;
        int accumulatedLength = 0;

        while (sc.hasNextLine()) {
            String thisLine = sc.nextLine();
            
            // No constraint provided. Assume to process every column separated by "," in the csv.
            String[] columnData = thisLine.split("\",\"");
            for (String thisColumn : columnData) {
                for (String token: thisColumn.split("\\s+")) {
                    // Normal implementation to check palindrome O(n/2)
                    // It actually O(n), but whatever.
                    // Optimization: ~~Confirmed~~ No.
                    // Improvement: Optimize the memory allocation which drop the performance. -> Don't use StringTokenizer, don't use regex because those create new instances.
                    // Constraint for palindromes: none
                    // Which means, single character is automatically a palindrome
                    if(token.isEmpty()) continue;

                    // Regex construction process (3) I'm done (for today at least.)
                    if(EMOJI.matcher(token).matches()){
                        // try (BufferedWriter writer = new BufferedWriter(new FileWriter("emoticon.txt", true))) { // true for append mode
                            nEmoticons++;
                            // writer.write(thisColumn);
                            // writer.newLine(); // Adds a new line
                            // writer.write(token);
                            // writer.newLine();
                        // } catch (IOException e) {
                            // System.err.println("Error writing to file: " + e.getMessage());
                            // e.printStackTrace();
                        // }
                    }
                    
                    int left = 0;
                    int right = token.length() - 1;
                    boolean isPalindrome = true;

                    if(token.length() > 1) {
                        while (left < right) {
                            if (!Character.isLetterOrDigit(token.charAt(left))){
                                if (right - left <= 2) isPalindrome = false;
                                left++;
                                continue;
                            }
                            if (!Character.isLetterOrDigit(token.charAt(right))){
                                if (right - left <= 2) isPalindrome = false;
                                right--;
                                continue;
                            }
                            if (Character.toLowerCase(token.charAt(left)) != Character.toLowerCase(token.charAt(right))) { 
                                isPalindrome = false;
                                break;
                            }
                            left++;
                            right--;
                        }
                    } 
                    else if(token.length() == 1 && !Character.isLetterOrDigit(token.charAt(0))) isPalindrome = false;

                    if(isPalindrome) nPalindromes++;
                    
                    if(token.length() > longestWordLength) longestWordLength = token.length();
                    accumulatedLength += token.length();
                    nTokens++;
                }
            }
            
            nChars += (thisLine.length() + 1); // +1 for newline character
            lines++;
        }

        nChars--; // remove last newline character count as there is no newline on the last line.

        sc.close();

        System.out.println("Total # Character count: " + nChars);
        System.out.println("Total # Palindrome found: " +nPalindromes);
        System.out.println("Total Number of tokens: " + nTokens);
        System.out.println("Total Number of emoticon: " + nEmoticons);
        System.out.println("Total # of new line: " + lines);
        
        System.out.println("The longest and average token size token: " + (longestWordLength + " " + (accumulatedLength / (double) nTokens)));

        long endTime = System.nanoTime();
        System.out.println("Total time to execute this program: " + ((endTime - startTime)/1_000_000_000.0) + "secs");

        System.out.println();
        System.out.println("Program terminated properly!");
    }
}
