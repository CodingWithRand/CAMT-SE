package se233.review_ch3.new_multi;

import javafx.concurrent.Task;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.CountDownLatch;

// Task<Void> means this Task will return Void (void/nothing/null)
public class Downloader extends Task<Void> {
    private URL url;
    private String fileName;
    private long startByte, endByte;
    private CountDownLatch doneSignal;
    public Downloader(URL url, String fileName, long startByte, long endByte, CountDownLatch doneSignal){
        this.url = url;
        this.fileName = fileName;
        this.startByte =startByte;
        this.endByte= endByte;
        this.doneSignal =doneSignal;
    }
    @Override
    protected Void call() throws Exception{
        try{
            URLConnection openConnection =url.openConnection();
            openConnection.setRequestProperty("Range","bytes="+ startByte+"-"+endByte);
            int fileSize = openConnection.getContentLength();
            OutputStream out= new FileOutputStream(this.fileName);
            InputStream in=openConnection.getInputStream();
            byte[] buf=new byte[5120];
            long downloaded =0;
            while (downloaded< fileSize){
                int n = in.read(buf,0, buf.length);
                if (n !=-1){
                    downloaded+=n;
                    out.write(buf,0, n);
                    // Update the progress of the task, which will be shown to the user on UI.
                    updateProgress(downloaded, fileSize);
                }
            }
            out.close();
            in.close();
        } catch(Exception e){}
        // Finished, countDown()
        doneSignal.countDown();
        return null;
    }
}
