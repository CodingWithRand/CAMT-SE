package se233.chapter3.controller;

import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.input.Dragboard;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.TransferMode;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Popup;
import se233.chapter3.Launcher;
import se233.chapter3.model.FileFreq;
import se233.chapter3.model.PdfDocument;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

public class MainViewController {
    LinkedHashMap<String, List<FileFreq>> uniqueSets;
    ArrayList<String> inputList = new ArrayList<>();
    @FXML
    private ListView<String> inputListView;
    @FXML
    private Button startButton;
    @FXML
    private ListView<Map.Entry<String, List<Integer>>> listView;
    @FXML
    private MenuItem closeBtn;
    private Popup currentPopup;
    @FXML
    public void initialize() {
        listView.setCellFactory(lv -> new ListCell<Map.Entry<String, List<Integer>>>() {
            @Override
            protected void updateItem(Map.Entry<String, List<Integer>> item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    String listStr = item.getValue().stream()
                            .map(String::valueOf)
                            .collect(Collectors.joining(", ", "(", ")"));
                    setText(item.getKey() + " " + listStr);
                }
            }
        });
        inputListView.setOnDragOver(event -> {
            Dragboard db = event.getDragboard();
            final boolean isAccepted = db.getFiles().get(0).getName().toLowerCase().endsWith(".pdf");
            if (db.hasFiles() && isAccepted) {
                event.acceptTransferModes(TransferMode.COPY);
            } else {
                event.consume();
            }
        });
        inputListView.setOnDragDropped(event -> {
            Dragboard db = event.getDragboard();
            boolean success = false;
            if(db.hasFiles()) {
                success = true;
                String filePath;
                int total_files = db.getFiles().size();
                WordCountMapTask[] wordCountMapTasksArray = new WordCountMapTask[total_files];
                Map<String, FileFreq>[] wordMap = new Map[total_files];
                for (int i = 0; i < total_files; i++) {
                    File file = db.getFiles().get(i);
                    filePath = file.getAbsolutePath();
                    inputList.add(filePath);
                    inputListView.getItems().add(file.getName());
                }
            }
            event.setDropCompleted(success);
            event.consume();
        });
        startButton.setOnAction(event -> {
            Parent bgRoot = Launcher.primaryStage.getScene().getRoot();
            Task<Void> processTask = new Task<Void>() {
                @Override
                public Void call() throws IOException {
                    ProgressIndicator pi = new ProgressIndicator();
                    VBox box = new VBox(pi);
                    box.setAlignment(Pos.CENTER);
                    Launcher.primaryStage.getScene().setRoot(box);
                    ExecutorService executor = Executors.newFixedThreadPool(4);
                    final ExecutorCompletionService<Map<String, FileFreq>> completionService = new ExecutorCompletionService<>(executor);
//                    List<String> inputListViewItems = inputListView.getItems();
                    int total_files = inputList.size();
                    Map<String, FileFreq>[] wordMap = new Map[total_files];
                    for(int i = 0; i<total_files; i++) {
                        try {
                            String filePath = inputList.get(i);
                            PdfDocument p = new PdfDocument(filePath);
                            completionService.submit(new WordCountMapTask(p));
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    for(int i = 0; i<total_files; i++) {
                        try {
                            Future<Map<String, FileFreq>> future = completionService.take();
                            wordMap[i] = future.get();
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    try {
                        WordCountReduceTask merger = new WordCountReduceTask(wordMap);
                        Future<LinkedHashMap<String, List<FileFreq>>> future = executor.submit(merger);
                        uniqueSets = future.get();
//                        Check 3.5.1
//                        uniqueSets.forEach((k, l) -> {
//                            System.out.print(k + "\n");
//                            AtomicReference<Integer> totalFreq1 = new AtomicReference<>(0);
//                            l.forEach((o) -> {
//                                totalFreq1.updateAndGet(v -> v + o.getFreq());
//                                System.out.println(o.getName() + " " + o.getFreq());
//                            });
//                            System.out.print(totalFreq1.get() + "\n");
//                        });
                        listView.getItems().addAll(
                                uniqueSets.entrySet()
                                        .stream()
                                        .map(e -> Map.entry(
                                                e.getKey(),
                                                e.getValue().stream().map(FileFreq::getFreq).toList()
                                        ))
                                        .collect(Collectors.toMap(
                                                Map.Entry::getKey,
                                                Map.Entry::getValue,
                                                (a, b) -> a,
                                                LinkedHashMap::new
                                        ))
                                        .entrySet()
                        );
                    } catch (Exception e) {
                        e.printStackTrace();
                    } finally {
                        executor.shutdown();
                    }
                    return null;
                }
            };
            processTask.setOnSucceeded(e -> {
                Launcher.primaryStage.getScene().setRoot(bgRoot);
            });
            Thread thread = new Thread(processTask);
            thread.setDaemon(true);
            thread.start();
        });
        listView.setOnMouseClicked(event -> {
            List<FileFreq> listOfLinks = uniqueSets.get(((Map.Entry) listView.getSelectionModel().getSelectedItem()).getKey());
            ListView<FileFreq> popupListView = new ListView<>();
            LinkedHashMap<FileFreq, String> lookupTable = new LinkedHashMap<>();
            for (int i = 0; i<listOfLinks.size(); i++) {
                lookupTable.put(listOfLinks.get(i), listOfLinks.get(i).getPath());
                popupListView.getItems().add(listOfLinks.get(i));
            }
            popupListView.setPrefWidth(Region.USE_COMPUTED_SIZE);
            popupListView.setPrefHeight(popupListView.getItems().size() * 40);
            popupListView.setOnMouseClicked(innerEvent -> {
                File file = new File(lookupTable.get(popupListView.getSelectionModel().getSelectedItem()));
                Launcher.hs.showDocument(file.toURI().toString());
//                Launcher.hs.showDocument("file://"+lookupTable.get(popupListView.getSelectionModel().getSelectedItem()));
                popupListView.getScene().getWindow().hide();
            });
            if(currentPopup != null) currentPopup.hide();
            Popup popup = new Popup();
            popup.getContent().add(popupListView);
            popup.setAutoHide(false);
            popup.getScene().addEventFilter(KeyEvent.KEY_PRESSED, ke -> {
                if(ke.getCode() == KeyCode.ESCAPE) {
                    popup.getScene().getWindow().hide();
                }
            });
//            handler doesn't work
//            popup.getScene().setOnKeyPressed(ke -> {
//                System.out.println(ke.getCode() + " " + KeyCode.ESCAPE);
//                if(ke.getCode() == KeyCode.ESCAPE) {
//                    popup.getScene().getWindow().hide();
//                }
//            });
            currentPopup = popup;
            popup.show(Launcher.primaryStage);
        });
        closeBtn.setOnAction(event -> {
            Platform.exit();
        });
    }
}
