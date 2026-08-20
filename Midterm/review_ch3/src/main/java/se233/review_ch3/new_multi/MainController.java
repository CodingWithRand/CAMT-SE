package se233.review_ch3.new_multi;

import javafx.fxml.FXML;
import javafx.scene.control.ProgressBar;
import javafx.scene.control.TextField;

import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// This example program will split a download task into 2 thread, break the file in half into 2 chunks, then merge them together.
public class MainController {
    // Get an GUI component from the fxml file
    @FXML
    private TextField urlField; // The variable name link to the id of that component (fx:id in fxml)
    @FXML
    private TextField fileField;
    @FXML
    private ProgressBar thread1,thread2,merge_bar;
    long totalSizeOfFile;
    private static ExecutorService executor;
    // Get an event listener/handler function from the fxml file. The method name link to what specified in the fxml file.
    // In this case, it's onAction="#handleDownloadAction". Mean that this is an onAction event that will be handled by handleDownloadAction, which the event handler logic will be written here.
    @FXML
    private void handleDownloadAction() {
        /*
         Synchronization coordinator. We use CountDownLatch.

         When creating this CountDownLatch instance, tell it how many threads you will run BEFORE letting another run after.
         E.g. 2 in this example for 2 downloader downloading 2 chunks of data, while the other thread merger will have to wait for files from 2 downloader.
         So, the merger call ".await()" on the CountDownLatch to wait, don't execute the code in merger yet until both downloader have finished their task.
         Once one of those downloader thread complete their task, it calls ".countDown()", the value in CountDownLatch decrease by 1.
         When CountDownLatch value reaches 0, which means both downloader have finished their tasks. The code in merger after ".await()" continue executing.
         */
        CountDownLatch countDownLatch = new CountDownLatch(2);
        try {
            // Create a fix thread pool. (Only allow 2 active thread run at the same time at most.)
            executor = Executors.newFixedThreadPool(2);
            URL url = new URL(urlField.getText());
            String filename = fileField.getText();
            URLConnection openConnection = url.openConnection();
            totalSizeOfFile = openConnection.getContentLength();
            long baseLength = totalSizeOfFile/2;
            Downloader downloader1 = new Downloader(url, filename+"-part1", 0,
                    baseLength, countDownLatch);
            Downloader downloader2 = new Downloader(url, filename+"-part2", (baseLength
                    +1),totalSizeOfFile, countDownLatch);
            Merger merger = new Merger(filename, 2, countDownLatch);
            // Task.progressProperty() -> track progress of the executing task.
            thread1.progressProperty().bind(downloader1.progressProperty());
            thread2.progressProperty().bind(downloader2.progressProperty());
            merge_bar.progressProperty().bind(merger.progressProperty());
            // downloader1 and downloader2 starts running at the same time once ".submit()"
            executor.submit(downloader1);
            executor.submit(downloader2);
            // merger is ".await()", so it's still inactive.
            executor.submit(merger);
            executor.shutdown();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
