package Lab11;

import java.io.File;
import java.io.IOException;
import java.util.Scanner;

public class ProcessScore {
    public static void main(String[] args) throws IOException {
        Scanner scin = new Scanner(System.in);
        File score = new File("scores.txt");
        score.delete();
        score.createNewFile();
        
        System.out.print("Enter the file name containing scores: ");
        File target = new File(scin.next());
        Scanner scfile = new Scanner(target);

        int totalScore = 0;
        int count = 0;
        while (scfile.hasNextInt()) {
            totalScore += scfile.nextInt();
            count++;
        }

        System.out.println("Total score: " + totalScore);
        System.out.println("Average score: " + ((double) totalScore / count));
    }
}
