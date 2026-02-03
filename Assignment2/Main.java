import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

public class Main {
    // Hard code for today. Will optimize later.
    // Optimization done, I guess. Documentation later.
    public static void main(String[] args) throws Exception {
        // Record the execution time
        long startTime = System.nanoTime();

        System.out.println("Program start:");
        System.out.println();

        File f = new File(args[0]);
        BufferedReader sc = new BufferedReader(new FileReader(f));
        
        // Characters count and lines count are being matched with notepad characters and lines count.
        int nChars = 0;
        int lines = 0;

        int nEmoticons = 0;
        final String[] EMOTICON = {
            ":-)", ":)", ":-]", ":]", ":>", "8-)", "8)", ":-}", ":}", ":^)", "=]", "=)", ")=", ": )",
            "(-:", "(:", "[-:", "[:", "<:", ")-8", ")-:", "}-:", "}:", "^(:", "[=", "=(", "(=", "( :",
            ":-D", ":D", "8-D", "8D", "=D", "=3", "B^D", "c:", "C:", "x-D", "xD", "X-D", "XD", ":-))", ":))",
            "D-:", "D:", "D-8", "D3=", ":B^", ":c", ":C", "D-x", "D-X",
            ":-(", ":(", ":-c", ":c", ":-<", ":<", ":-[", ":[", ":-||", ":{", ":@" ,
            ":\'-(", ":\'(", ":=(", 
            ":\'-)", ":\')", ":\"D",
            ":-))", ":))", ":-((", ":((",
            "((-:", "((:", "))-:", ")):", 
            ":-(", ":(", ":-c", ":c", ":-<", ":<", ":-[", ":[", ":-||", ":{", ":@" ,
            "(-:", "(:", "c-:", "c:", "<-:", "<:", "[-:", "[:", "||-:", "{-:", "@-:",
            ">:(", ">:[" ,"D-':", "D:<", "D:", "D8", "D;", "D=", "DX",
            "(<:", "[<:", ":'-D", ":<D", ":D", "8D", ";D", "=D", "XD",
            ":-O", ":O", ":-o", ":o", ":0", "8-0", ":-0", "=O", "=o",
            "O-:", "O:", "o-:", "o:", "0:", "0-8", "0-:", "O=", "o=",
            ":-3", ":3", "=3", "x3", "X3",
            ":-*", ":*", ":x",
            "*-:", "*:", "x:", 
            ";-)", ";)", "*-)", "*", ";-]", ";^)", ";>",
            "(-;", "(:;", ")-*", ":", "] -;", "^;:", ">;",
            ":-,", ";D", ";3",
            ":-P", ":P", "X-P", "x-p", ":p", ":-Þ", ":Þ", ":-þ", ":þ", ":-b", ":b", "d:", "=p", ">:b",
            "P-:", "p:", "P-X", "p-x", "b-:", "b:", "d:", "p=", "b<:",
            ":-/", ":/", "':^I", ">:\\", ">:/", ":\\", "=/", "=\\", ":L", "=L", ":S",
            "/-:", "/:", "I^':'", "\\:<", "/<:", "\\:", "\\=", "/=", "L:", "L=",
            ":-|", ":|",
            "|-:", "|:",
            ":$",
            ":-X", ":X", ":-#", ":#", ":-&", ":&",
            "X-:", "X:", "#-:", "#:", "&-:", "&:",
            "O:-)", "O:)", "0:-3", "0:3", "0:-)", "0:)", "0;^)",
            "(-:O", "(:O", "(-:0", "(:0", "):O", "):0", "):o",
            ">:-)", ">:)", ">:(", ">:-(", "}:-)", "}:)", "3:-)", ">;-)", ">:;)", ">:3", ">;3",
            "(-:<", "(:<", "):<", ")-:<", "}:<", "}-:<",
            "|;-)", "|-O", "B-)", "%-)", "%)", ":-###..", ":###..",
            "<:-|",
            "-_-", "v_v", "=|",
            "uwu", "UwU", "Uwu", "UWU", "owo", "OwO", "OWO", "0w0", "0W0", "ow0", "0wo",
            "TwT", "T_T", "twt", "T-w-T", "TT",
            "^_^", "^-^", "^^", "n_n", "o_o", "O_O",
            "=^.^=", "=_=", "-.-", "._.", ">_<", "<_<", ">_>",
            ";_;", ";-;", ".-.", ">.<", "@_@", "@-@", "!-!", "!_!", "?_?", "?-?",
            "O_o", "o_O", "0_o", "0_O", ">w<", "<3", "O_O", "o_o", "0_0",
            "*^_^*", "*_*", "^-^'", "^_^’", "uwU", "OwU", ">w<", "<w<"
        };
        // final Pattern EMOTICON = Pattern.compile("(?<!&\\w{1,45}|\\w{1,45})(?:(?<![)\\]}])[:;=8xX](?:[-^'\\\"*_])?[)(#LEDPpOo3/|\\[\\]{}]|(?<![\\[({](?:[\\w\\W]{0,45})|\\w{1,45})[)(#LDPpOo3/\\\\|\\[\\]{}](?:[-^'\\\"*_])?[:;=8xX](?!:)|(?>(?:[oO0;TXxv+~!*@?][-_^.]+[?@*!~;vXxToO0+])|TT|[.-=]_++[.-=]|[-=]\\.++[-=]|\\.-\\.|[*T]++[on_^.-][*T]++|=?\\^[-.o0]\\^=?)|(?:X:|:X))(?!\\w+)");
        int nTokens = 0;

        int nPalindromes = 0;

        int longestWordLength = 0;
        int accumulatedLength = 0;

        while (true) {
            String thisLine = sc.readLine();
            if (thisLine == null) break;
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

                    // Linear search implementation to check for emoticons. Slow, and can only detect correctly punctuated emoticons.
                    for(String emoticon: EMOTICON) if(token.equals(emoticon)) nEmoticons++;

                    // Below is regex method, faster.
                    // Regex construction process (3) I'm done (for today at least.)
                    // if(EMOTICON.matcher(token).matches()){
                        // try (BufferedWriter writer = new BufferedWriter(new FileWriter("emoticon.txt", true))) { // true for append mode
                            // nEmoticons++;
                            // writer.write(thisColumn);
                            // writer.newLine(); // Adds a new line
                            // writer.write(token);
                            // writer.newLine();
                        // } catch (IOException e) {
                            // System.err.println("Error writing to file: " + e.getMessage());
                            // e.printStackTrace();
                        // }
                    // }
                    
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
