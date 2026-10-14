package se233.se233_termproject_2026.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Rectangle;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.se233_termproject_2026.controller.vectorizer.*;
import se233.se233_termproject_2026.model.ImageSettings;
import se233.se233_termproject_2026.model.QualitySetting;
import se233.se233_termproject_2026.services.ProgressTaskService;
import se233.se233_termproject_2026.view_misc.PanZoomCanvas;
import javafx.concurrent.Task;
import se233.se233_termproject_2026.view_misc.VectorizedImageView;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.io.File;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.IntStream;

public class MainController {
    private static final Logger logger = LogManager.getLogger();
    private static final int MAX_COLOR_COUNT = 256;

    @FXML private ImageView originalImage;
    @FXML private Pane vectorImage;

    @FXML private Pane originalImagePane;
    @FXML private Pane vectorImagePane;

    @FXML private StackPane originalImgView;
    @FXML private StackPane vectorizedImgView;

    @FXML private ScrollPane originalImgContainer;
    @FXML private ScrollPane vectorizedImgContainer;

    @FXML private ToggleGroup detailToggleGroup;
    @FXML private ToggleGroup colorToggleGroup;

    // New UI elements
    @FXML private VBox colorSwatchBox;
    @FXML private ComboBox<String> presetComboBox;
    @FXML private ProgressBar exportProgressBar;
    @FXML private CheckBox removeBackgroundCheckBox;

    @FXML private Label imageCounterLabel;
    @FXML private Button prevButton;
    @FXML private Button nextButton;

    @FXML private VBox extractProgressBox ;
    @FXML private ProgressBar extractProgressBar;
    @FXML private VBox analyzeProgressBox;
    @FXML private ProgressBar analyzeProgressBar;
    @FXML private VBox vectorizeProgressBox;
    @FXML private ProgressBar vectorizeProgressBar;

    // --- MODIFIED/ADDED FOR BACK TO DROP VIEW: FXML Injection ---
    @FXML private Button backToDropButton;
    private ProgressTaskService progressTaskService;

    private List<File> loadedFiles = new ArrayList<>();
    private List<QualitySetting> qualitySettings = new ArrayList<>();
    private Map<File, ImageSettings> imageSettingsMap = new HashMap<>();
    private List<Color> _5ColorPalette;
    private int selectedCustomColorCount = 2;
    private VectorizedImageView VView;
    private int currentIndex = 0;
    private ImageSettings getCurrentSettings() {
        if (loadedFiles.isEmpty()) return new ImageSettings();
        File currentFile = loadedFiles.get(currentIndex);
        return imageSettingsMap.computeIfAbsent(currentFile, f -> new ImageSettings());
    }
    @FXML
    public void initialize() {
        progressTaskService = new ProgressTaskService(
                extractProgressBox, extractProgressBar,
                analyzeProgressBox, analyzeProgressBar,
                vectorizeProgressBox, vectorizeProgressBar
        );


        Rectangle clipO = new Rectangle();
        clipO.widthProperty().bind(originalImgView.widthProperty());
        clipO.heightProperty().bind(originalImgView.heightProperty());
        originalImgView.setClip(clipO);

        Rectangle clipV = new Rectangle();
        clipV.widthProperty().bind(vectorizedImgView.widthProperty());
        clipV.heightProperty().bind(vectorizedImgView.heightProperty());
        vectorizedImgView.setClip(clipV);

        PanZoomCanvas Ocontroller = new PanZoomCanvas(originalImgView, originalImage);
        Ocontroller.enablePanAndZoom();

        PanZoomCanvas Vcontroller = new PanZoomCanvas(vectorizedImgView, vectorImage);
        Vcontroller.enablePanAndZoom();

        VView = new VectorizedImageView(vectorImage);
        if (presetComboBox != null) {
            presetComboBox.getItems().addAll(
                    "Stark Silhouette (2-Color, No BG)",
                    "Detailed Woodcut (2-Color, High Detail)",
                    "Retro 5-Color Poster",
                    "Smooth Minimalist (4-Color)",
                    "Full-Spectrum Digital Painting"
            );

            presetComboBox.getSelectionModel().selectedItemProperty().addListener((obs, oldVal, newVal) -> {
                if (newVal != null && !loadedFiles.isEmpty()) {
                    applyPreset(newVal);
                }
            });
        }
        //  Color Toggle Group (Handles spinner visibility AND re-processing)
        colorToggleGroup.selectedToggleProperty().addListener((obs, oldVal, newVal) -> {
            if (newVal != null && !loadedFiles.isEmpty()) {
                ToggleButton selected = (ToggleButton) newVal;
                String colorMode = selected.getText();
                getCurrentSettings().setColorMode(colorMode);

                boolean isCustom = "Custom".equals(colorMode);
                colorSwatchBox.setVisible(isCustom);
                colorSwatchBox.setManaged(isCustom);

                try {
                    BufferedImage img = ImageIO.read(loadedFiles.get(currentIndex));
                    _5ColorPalette = ColorSegmenter.extractPalette(img, 5);
                    getCurrentSettings().setCachedPalette(_5ColorPalette);
                    updateColorSwatches(_5ColorPalette);
                } catch (IOException e) {
                    logger.error("Failed to extract palette on color mode change: {}", e.getMessage());
                }
                triggerReprocessing();
            }
        });

        //  Detail Toggle Group (Re-runs pipeline when detail level changes)
        detailToggleGroup.selectedToggleProperty().addListener((obs, oldVal, newVal) -> {
            if (newVal != null && !loadedFiles.isEmpty()) {
                ToggleButton selected = (ToggleButton) newVal;
                getCurrentSettings().setDetailLevel(selected.getText());
                qualitySettings.get(currentIndex).changeMode(selected.getText());
                triggerReprocessing();
            }
        });

        //  Remove Background CheckBox (Re-runs pipeline when background option changes)
        removeBackgroundCheckBox.selectedProperty().addListener((obs, oldVal, newVal) -> {
            if (!loadedFiles.isEmpty()) {
                getCurrentSettings().setRemoveBackground(newVal);
                triggerReprocessing();
            }
        });
    }
    private void applyPreset(String presetName) {
        if (loadedFiles.isEmpty()) return;

        File currentFile = loadedFiles.get(currentIndex);
        ImageSettings settings = imageSettingsMap.getOrDefault(currentFile, new ImageSettings());
        settings.setPreset(presetName);

        String detailLevel = "Medium";

        switch (presetName) {
            case "Stark Silhouette (2-Color, No BG)":
                settings.setColorMode("Custom");
                settings.setCustomColorCount(2);
                detailLevel = "Low";
                settings.setRemoveBackground(true);
                break;
            case "Detailed Woodcut (2-Color, High Detail)":
                settings.setColorMode("Custom");
                settings.setCustomColorCount(2);
                detailLevel = "High";
                settings.setRemoveBackground(false);
                break;
            case "Retro 5-Color Poster":
                settings.setColorMode("Custom");
                settings.setCustomColorCount(5);
                detailLevel = "Medium";
                settings.setRemoveBackground(true);
                break;
            case "Smooth Minimalist (4-Color)":
                settings.setColorMode("Custom");
                settings.setCustomColorCount(4);
                detailLevel = "Low";
                settings.setRemoveBackground(false);
                break;
            case "Full-Spectrum Digital Painting":
                settings.setColorMode("Unlimited");
                settings.setCustomColorCount(MAX_COLOR_COUNT);
                detailLevel = "High";
                settings.setRemoveBackground(false);
                break;
        }

        settings.setDetailLevel(detailLevel);
        imageSettingsMap.put(currentFile, settings);

        if (currentIndex < qualitySettings.size()) {
            qualitySettings.get(currentIndex).changeMode(detailLevel);
        }

        syncUIWithCurrentSettings();
        triggerReprocessing();
        logger.debug("Applied distinct preset: {}", presetName);
    }
    public void processImageInFX(BufferedImage inputImage, Pane canvas, int targetColorCount) {
        // 1. ANALYZE TASK (Drives the analysis progress bar)
        String colorMode = getSelectedColorMode();
        Task<List<java.awt.Color>> analyzeTask = new Task<>() {
            @Override
            protected List<java.awt.Color> call() throws Exception {
                updateProgress(0, 2); // Step 1: Starting analysis

                List<java.awt.Color> colors;
                if ("Unlimited".equals(colorMode)) {
                    colors = ColorSegmenter.extractPalette(inputImage, MAX_COLOR_COUNT);
                } else {
                    colors = ColorSegmenter.extractPalette(inputImage, targetColorCount);
                }

                updateProgress(2, 2); // Step 2: Palette extracted successfully
                logger.debug("Extract color successful");
                return colors;
            }
        };
        analyzeTask.setOnSucceeded(event -> {
            List<java.awt.Color> colors = analyzeTask.getValue();
            startVectorizeTask(inputImage, canvas, colors);
            logger.debug("Analyzation task ended successfully");
        });

        analyzeTask.setOnFailed(event -> {
            Throwable exception = analyzeTask.getException();
            logger.error("Color analyzation error: " + exception.getMessage());
            exception.printStackTrace();
        });
        // Bind analyze task; when it succeeds, it triggers the vector task with the colors
        progressTaskService.bindTask(analyzeTask, analyzeProgressBox, analyzeProgressBar);

        Thread analyzeThread = new Thread(analyzeTask);
        analyzeThread.setDaemon(true);
        analyzeThread.start();
    }

    public void startVectorizeTask(BufferedImage inputImage, Pane canvas, List<java.awt.Color> colors) {

        VectorTask vectorTask = new VectorTask(inputImage, colors, isRemoveBackgroundEnabled(), qualitySettings.get(currentIndex));

        // 3. Render results back on UI Thread
        vectorTask.setOnSucceeded(event -> {
            List<ColorLayer> layers = vectorTask.getValue();

//            for(ColorLayer cl: layers) {
//                logger.debug(cl.getSvgPathData());
//                logger.debug(cl.getHexColor());
//            }

            VView.loadVectorLayers(layers, inputImage.getWidth(), inputImage.getHeight());

            logger.debug("Task ended successfully");
        });


        vectorTask.setOnFailed(event -> {
            Throwable exception = vectorTask.getException();
            logger.error("Vectorization error: " + exception.getMessage());
            System.err.println("Vectorization error: " + exception.getMessage());
            exception.printStackTrace();
        });
        progressTaskService.bindTask(vectorTask, vectorizeProgressBox, vectorizeProgressBar);

        // Run task on background thread to keep UI smooth and responsive
        Thread backgroundThread = new Thread(vectorTask);
        backgroundThread.setDaemon(true); // Ensures thread closes if application quits
        backgroundThread.start();
    }

    public void initFiles(List<File> files) throws IOException {
        if (files != null && !files.isEmpty()) {
            this.loadedFiles = files;
            this.currentIndex = 0;
            this.qualitySettings = IntStream.range(0, this.loadedFiles.size())
                    .mapToObj(qi -> new QualitySetting())
                    .toList();
            this.imageSettingsMap.clear();
            Task<Void> extractTask = new Task<>() {
                @Override
                protected Void call() throws Exception {
                    int total = files.size();
                    updateProgress(0, total); // Initialize

                    for (int i = 0; i < total; i++) {
                        BufferedImage img = ImageIO.read(files.get(i));
                        // Optional storage if needed

                        updateProgress(i + 1, total); // Track each file loaded!
                    }
                    return null;
                }
            };
            extractTask.setOnSucceeded(e -> {
                displayCurrentImage();
                try {
                    BufferedImage initialImg = ImageIO.read(files.get(currentIndex));
                    _5ColorPalette = ColorSegmenter.extractPalette(initialImg, 5);
                    getCurrentSettings().setCachedPalette(_5ColorPalette);
                    updateColorSwatches(_5ColorPalette);
                    syncUIWithCurrentSettings();
                    processImageInFX(initialImg, vectorImage, getCustomColorCount());
                } catch (IOException ex) {
                    logger.error("Failed to load initial image: " + ex.getMessage());
                }
                logger.debug("Extraction task ended successfully");
            });

            extractTask.setOnFailed(e -> {
                Throwable exception = extractTask.getException();
                logger.error("File extraction error: " + exception.getMessage());
                exception.printStackTrace();
            });

            progressTaskService.bindTask(extractTask, extractProgressBox, extractProgressBar);

            Thread backgroundThread = new Thread(extractTask);
            backgroundThread.setDaemon(true);
            backgroundThread.start();
        }
    }

    private void displayCurrentImage() {
        if (loadedFiles.isEmpty()) return;

        File currentFile = loadedFiles.get(currentIndex);
        Image image = new Image(currentFile.toURI().toString());
        originalImage.setImage(image);

        imageCounterLabel.setText("Image " + (currentIndex + 1) + " of " + loadedFiles.size());
        prevButton.setDisable(currentIndex == 0);
        nextButton.setDisable(currentIndex == loadedFiles.size() - 1);
    }

    private void syncUIWithCurrentSettings() {
        if (loadedFiles.isEmpty()) return;
        ImageSettings settings = getCurrentSettings();
        if (presetComboBox != null && settings.getPreset() != null) {
            presetComboBox.getSelectionModel().select(settings.getPreset());
        }
        // 1. Sync color mode toggle group
        for (Toggle t : colorToggleGroup.getToggles()) {
            if (t instanceof ToggleButton btn) {
                if (btn.getText().equals(settings.getColorMode())) {
                    colorToggleGroup.selectToggle(btn);
                    break;
                }
            }
        }

        // 2. Sync detail level toggle group
        for (Toggle t : detailToggleGroup.getToggles()) {
            if (t instanceof ToggleButton btn) {
                if (btn.getText().equals(settings.getDetailLevel())) {
                    detailToggleGroup.selectToggle(btn);
                    break;
                }
            }
        }

        // 3. Sync background removal checkbox
        removeBackgroundCheckBox.setSelected(settings.isRemoveBackground());

        // 4. Sync color swatches and visibility
        boolean isCustom = "Custom".equals(settings.getColorMode());
        colorSwatchBox.setVisible(isCustom);
        colorSwatchBox.setManaged(isCustom);

        if (settings.getCachedPalette() != null && !settings.getCachedPalette().isEmpty()) {
            _5ColorPalette = settings.getCachedPalette();
        } else {
            try {
                BufferedImage img = ImageIO.read(loadedFiles.get(currentIndex));
                _5ColorPalette = ColorSegmenter.extractPalette(img, 5);
                settings.setCachedPalette(_5ColorPalette);
            } catch (IOException e) {
                logger.error("Failed to extract palette during sync: {}", e.getMessage());
            }
        }
        updateColorSwatches(_5ColorPalette);
    }


    // --- MODIFIED/ADDED FOR BACK TO DROP VIEW: Navigation Logic ---
    @FXML
    private void handleBackToDrop() {
        try {

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/se233/se233_termproject_2026/drop-view.fxml"));
            Parent root = loader.load();

            // Get current stage from any UI element
            Stage stage = (Stage) vectorImage.getScene().getWindow();

            Scene scene = new Scene(root);
            stage.setScene(scene);
            stage.setTitle("Image Vectorizer - Drop Files");
            stage.show();

            logger.debug("Successfully returned to drop view.");
        } catch (IOException e) {
            logger.error("Failed to load drop view: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    @FXML
    private void handlePrevImage() throws IOException {
        if (currentIndex > 0) {
            currentIndex--;

            displayCurrentImage();
            syncUIWithCurrentSettings();
            triggerReprocessing();
        }
    }

    @FXML
    private void handleNextImage() throws IOException {
        if (currentIndex < loadedFiles.size() - 1) {
            currentIndex++;
            syncUIWithCurrentSettings();
            displayCurrentImage();
            triggerReprocessing();
        }
    }

    @FXML
    private void handleZoomIn() {
        originalImage.setScaleX(originalImage.getScaleX() * 1.15);
        originalImage.setScaleY(originalImage.getScaleY() * 1.15);
        vectorImage.setScaleX(vectorImage.getScaleX() * 1.15);
        vectorImage.setScaleY(vectorImage.getScaleY() * 1.15);
    }

    @FXML
    private void handleZoomOut() {
        originalImage.setScaleX(Math.max(0.5, originalImage.getScaleX() / 1.15));
        originalImage.setScaleY(Math.max(0.5, originalImage.getScaleY() / 1.15));
        vectorImage.setScaleX(Math.max(0.5, vectorImage.getScaleX() / 1.15));
        vectorImage.setScaleY(Math.max(0.5, vectorImage.getScaleY() / 1.15));
    }

    @FXML
    private void handleZoomToFit() {
        originalImage.setScaleX(1.0);
        originalImage.setScaleY(1.0);
        vectorImage.setScaleX(1.0);
        vectorImage.setScaleY(1.0);
    }

    private void processAndSaveFile(File file, String outputPath, int colorCount, QualitySetting qualitySetting, ImageSettings fileSettings) throws IOException, InterruptedException {
        BufferedImage img = ImageIO.read(file);

        String colorMode = fileSettings.getColorMode();
        List<java.awt.Color> colors;
        if ("Unlimited".equals(colorMode)) {
            colors = ColorSegmenter.extractPalette(img, MAX_COLOR_COUNT);
        } else {
            colors = ColorSegmenter.extractPalette(img, fileSettings.getCustomColorCount());
        }

        // Create the vector task instance
        VectorTask vectorTask = new VectorTask(img, colors, fileSettings.isRemoveBackground(), qualitySetting);

        //  Bind it to the UI progress tracking service
        progressTaskService.bindTask(vectorTask, vectorizeProgressBox, vectorizeProgressBar);

        // Start the task on a background thread
        Thread backgroundThread = new Thread(vectorTask);
        backgroundThread.setDaemon(true);
        backgroundThread.start();

        try {

            // call vectorTask.get(). Since Task implements Future, .get() blocks

            List<ColorLayer> layers = vectorTask.get();

            // 5. Generate the SVG content directly from the resolved layers
            String svgContent = SVGWriter.generateFullSVG(
                    layers,
                    img.getWidth(),
                    img.getHeight(),
                    fileSettings.isRemoveBackground(),
                    new Color(255, 255, 255)
            );

            //  Write the resulting SVG string to the destination file
            String fileName = file.getName();
            String baseName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            File outputFile = new File(outputPath, baseName + "_vectorized.svg");
            java.nio.file.Files.writeString(outputFile.toPath(), svgContent);

            logger.debug("Successfully exported vectorized file: {}", outputFile.getName());

        } catch (java.util.concurrent.ExecutionException e) {
            // Handle any exceptions thrown inside the background task cleanly
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            logger.error("Vectorization error during export: {}", cause.getMessage());
            cause.printStackTrace();
            throw new IOException("Failed to vectorize file: " + file.getName(), cause);
        }
    }

    @FXML
    private void handleExportAll() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setTitle("Select Output Folder for Batch Export");
        File selectedDirectory = directoryChooser.showDialog(new Stage());

        if (selectedDirectory != null && !loadedFiles.isEmpty()) {
            String outputPath = selectedDirectory.getAbsolutePath();

            // Constraint check for parallel processing execution
            boolean isMediumDetail = "Medium".equals(getSelectedDetailLevel());
            boolean isCustomColors = "Custom".equals(getSelectedColorMode());
            boolean useParallel = (loadedFiles.size() > 1) && isMediumDetail && isCustomColors;

            // Make progress bar visible during processing
            exportProgressBar.setVisible(true);

            Task<Void> exportTask = new Task<>() {
                @Override
                protected Void call() throws Exception {
                    int total = loadedFiles.size();
                    updateProgress(0, total);

                    if (useParallel) {
                        logger.debug("Executing PARALLEL export to: {}", outputPath);
                        AtomicInteger completedCount = new AtomicInteger(0);

                        loadedFiles.parallelStream().forEach(file -> {
                            try {
                                int index = loadedFiles.indexOf(file);
                                // Retrieve individual file's unique settings map entry safely
                                ImageSettings fSettings = imageSettingsMap.getOrDefault(file, new ImageSettings());

                                // Export the file using its specific configurations
                                processAndSaveFile(file, outputPath, fSettings.getCustomColorCount(), qualitySettings.get(index), fSettings);

                                int current = completedCount.incrementAndGet();
                                updateProgress(current, total);
                            } catch (Exception e) {
                                logger.error("Failed to export file in parallel: {}", file.getName(), e);
                            }
                        });
                    } else {
                        logger.debug("Executing SEQUENTIALLY to: {}", outputPath);
                        for (int i = 0; i < total; i++) {
                            File file = loadedFiles.get(i);
                            // Retrieve individual file's unique settings map entry safely
                            ImageSettings fSettings = imageSettingsMap.getOrDefault(file, new ImageSettings());

                            processAndSaveFile(file, outputPath, fSettings.getCustomColorCount(), qualitySettings.get(i), fSettings);
                            updateProgress(i + 1, total);
                        }
                    }

                    updateProgress(total, total);
                    return null;
                }
            };

            // Bind progress bar and handle completion/failure UI cleanup
            exportProgressBar.progressProperty().bind(exportTask.progressProperty());

            exportTask.setOnSucceeded(e -> {
                exportProgressBar.progressProperty().unbind();
                exportProgressBar.setVisible(false);
                logger.debug("Batch export completed successfully!");
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Export Successful");
                alert.setHeaderText(null);
                alert.setContentText("All images have been successfully vectorized and exported to the selected folder!");
                alert.showAndWait();
            });

            exportTask.setOnFailed(e -> {
                exportProgressBar.progressProperty().unbind();
                exportProgressBar.setVisible(false);
                logger.error("Batch export failed: {}", exportTask.getException().getMessage());
                exportTask.getException().printStackTrace();
            });

            Thread exportThread = new Thread(exportTask);
            exportThread.setDaemon(true);
            exportThread.start();
        }
    }


    // =========================================================================
    // INTEGRATION API: Clean accessors for processing & background tasks
    // =========================================================================

    public List<File> getLoadedFiles() {
        return loadedFiles;
    }

    public String getSelectedDetailLevel() {
        return getCurrentSettings().getDetailLevel();
    }

    public String getSelectedColorMode() {
        return getCurrentSettings().getColorMode();
    }

    public int getCustomColorCount() {
        return getCurrentSettings().getCustomColorCount();
    }

    public boolean isRemoveBackgroundEnabled() {
        return getCurrentSettings().isRemoveBackground();
    }

    public ProgressBar getExportProgressBar() {
        return exportProgressBar;
    }

    private void triggerReprocessing() {
        if (loadedFiles.isEmpty()) return;
        try {
            BufferedImage currentImg = ImageIO.read(loadedFiles.get(currentIndex));
            processImageInFX(currentImg, vectorImage, getCustomColorCount());
            logger.debug("Settings changed: Re-triggering image processing pipeline.");
        } catch (IOException e) {
            logger.error("Failed to re-process image on setting change: {}", e.getMessage());
            e.printStackTrace();
        }
    }
//    helper color pallette selector
private void updateColorSwatches(List<java.awt.Color> detectedColors) {
    colorSwatchBox.getChildren().clear();

    ImageSettings settings = getCurrentSettings();
    int currentCount = settings.getCustomColorCount();
    if (currentCount < 2 || currentCount > 5) {
        currentCount = 2;
        settings.setCustomColorCount(currentCount);
    }

    for (int k = 2; k <= 5; k++) {
        final int rowColorCount = k;

        HBox rowBox = new HBox(6);
        rowBox.setAlignment(Pos.CENTER_LEFT);

        boolean isRowSelected = (currentCount == rowColorCount);

        String rowStyle = "-fx-padding: 4px 6px; -fx-background-radius: 4px; -fx-cursor: hand;";
        if (isRowSelected) {
            rowStyle += "-fx-background-color: #e3f2fd; -fx-border-color: #2196F3; -fx-border-width: 1.5px; -fx-border-radius: 4px;";
        } else {
            rowStyle += "-fx-background-color: #fafafa; -fx-border-color: #e0e0e0; -fx-border-width: 1px; -fx-border-radius: 4px;";
        }
        rowBox.setStyle(rowStyle);

        int availableColors = (detectedColors != null) ? detectedColors.size() : 0;
        for (int i = 0; i < k; i++) {
            Pane swatch = new Pane();
            swatch.setPrefSize(20, 20);

            if (detectedColors != null && i < availableColors) {
                java.awt.Color awtColor = detectedColors.get(i);
                String hex = String.format("#%02x%02x%02x", awtColor.getRed(), awtColor.getGreen(), awtColor.getBlue());
                swatch.setStyle("-fx-background-color: " + hex + "; -fx-border-color: #cccccc; -fx-border-width: 1px; -fx-border-radius: 2px;");
            } else {
                swatch.setStyle("-fx-background-color: #e0e0e0; -fx-border-color: #cccccc; -fx-border-width: 1px; -fx-border-radius: 2px;");
            }
            rowBox.getChildren().add(swatch);
        }

        rowBox.setOnMouseClicked(e -> {
            getCurrentSettings().setCustomColorCount(rowColorCount);
            updateColorSwatches(detectedColors);
            triggerReprocessing();
        });

        colorSwatchBox.getChildren().add(rowBox);
    }
}
}