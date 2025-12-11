package Lab3;

public class StringManipulator {
    public static void main(String[] args) {
        // 3a
        System.out.println("-- Part 3a --");
        String s1 = "Hello";
        String s2 = "Hello";
        String s3 = new String("Hello");
        System.out.println(s1 == s2);
        System.out.println(s1 == s3);
        System.out.println(s1.equals(s3));
        // 3b
        System.out.println("-- Part 3b --");
        StringBuilder sb = new StringBuilder("programming");
        sb.insert(0, "fun");
        System.out.println(sb.toString());
        sb.append(" is great");
        System.out.println(sb.toString());
        sb.delete(0, 3);
        System.out.println(sb.toString());
    }
}
