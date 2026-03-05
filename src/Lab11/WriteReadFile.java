package Lab11;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Random;

public class WriteReadFile {
    public static void main(String[] args) throws IOException {
        Random rand = new Random();
        File target = new File("RWdata.txt");
        target.delete();
        target.createNewFile(); 
        FileReader fr = new FileReader(target);
        Integer[] randintsArr = new Integer[100];
        try(PrintWriter pw = new PrintWriter(target)) {
            for(int i = 0; i<randintsArr.length; i++) pw.print(rand.nextInt(100) + " "); // value within 100 for readability
            pw.close();
        }

        // why was i going through so much of trouble using file reader when i could easily use scanner? lulz.
        int ind = 0;
        int fileContentByte;
        char fileContentChar;
        do {
            fileContentByte = fr.read();
            String fileContentString = "";
            while (fileContentByte != 32 && fileContentByte != -1) { 
                fileContentChar = (char) fileContentByte;
                fileContentString += fileContentChar;
                fileContentByte = fr.read();
            }
            if(fileContentByte != -1) randintsArr[ind++] = Integer.valueOf(fileContentString);
        } while(fileContentByte != -1);
        Arrays.sort(randintsArr);
        System.out.println("100 random integers written to RWdata.txt");
        System.out.println("Sorted integers: ");
        for(int i = 0; i<randintsArr.length; i++) System.out.print(randintsArr[i] + " ");
        fr.close();
    }
}