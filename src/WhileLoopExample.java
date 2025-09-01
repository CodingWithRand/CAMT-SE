class WhileLoopExample {
    public static void main(String args[]) {
        int i = 1;
        while (i <= 100) {
            if(i % 10 == 0) System.out.println(i + " ");
            else System.out.print(i + " ");
            i++;
        }
    }
}