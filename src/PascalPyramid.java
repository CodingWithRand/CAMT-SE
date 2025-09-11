public class PascalPyramid {
    public static void main(String[] args) {
        for(int row = 0, indentation = 8; row<8 && indentation>0; row++, indentation--){
            for(int ind = 0; ind<indentation-1; ind++) System.out.print("    ");
            for(int ini = 0, end = row*2; ini<(row*2)+1; ini++,end--){
                if(ini>end) System.out.printf("%4d", (int) Math.pow(2, end));
                else System.out.printf("%4d", (int) Math.pow(2, ini));
            }
            System.out.println();
        }
    }
}
