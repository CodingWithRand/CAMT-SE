package se233.review_ch3.new_multi;

import javafx.concurrent.Task;

import java.io.*;
import java.util.concurrent.CountDownLatch;

public class Merger extends Task<Void> {
    private String fileName;
    private int totalParts;
    private CountDownLatch startSignal;
    public Merger(String fileName, int totalParts, CountDownLatch startSignal) {
        this.fileName = fileName;
        this.totalParts = totalParts;
        this.startSignal = startSignal;
    }
    @Override
    protected Void call() {
        byte[] buf = new byte[4096];
        OutputStream out = null;
        InputStream in = null;
        File f = null;
        try {
            startSignal.await();
            out = new FileOutputStream(this.fileName);
            for (int i = 0; i < this.totalParts; i++) {
                int toWrite;
                f = new File(this.fileName + "-part" + (i+1));
                in = new FileInputStream(f);
                while ((toWrite = in.read(buf)) !=-1) {
                    out.write(buf, 0, toWrite);
                }
                f.delete();
                updateProgress((i + 1), this.totalParts);
                in.close();
            }
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
