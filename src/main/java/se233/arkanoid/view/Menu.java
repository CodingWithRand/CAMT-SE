package se233.arkanoid.view;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Font;
import javafx.stage.Stage;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.model.PlayerData;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;
import java.util.stream.IntStream;

public class Menu {
    private static final Logger logger = LogManager.getLogger(Menu.class);
    private Integer selectedIndex = 0;
    private Label[] menuItems;

    @FXML
    private Label gameTitle;
    @FXML
    private Label startBtn;
    @FXML
    private Label highScoreBtn;
    @FXML
    private Label exitBtn;
    @FXML
    private StackPane topLevel;

    @FXML
    public void initialize() {
        // Load custom TTF retro font
        Font retroFont = Font.loadFont(
                getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 20
        );
        // Fallback to Monospaced if font file isn't present yet
        if (retroFont != null) {
            gameTitle.setFont(Font.loadFont(
                    getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 36
            ));
            startBtn.setFont(retroFont);
            highScoreBtn.setFont(retroFont);
            exitBtn.setFont(retroFont);
        }

        File savedHighScore = new File("player-data");
        try(Scanner sc = new Scanner(savedHighScore)) {
            while (sc.hasNextLine()) {
                String thisLineData = sc.nextLine();
                if (thisLineData.contains("highScore")) {
                    PlayerData.setHighScore(Integer.parseInt(thisLineData.split("=")[1]));
                }
            }
        } catch (FileNotFoundException e) {
            PlayerData.setHighScore(0);
        }

        menuItems = new Label[]{startBtn, highScoreBtn, exitBtn};

        topLevel.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if (newScene != null) {
                topLevel.getScene().setOnKeyPressed(e -> {
                    if (selectedIndex == null) {
                        selectedIndex = 0;
                        updateSelection();
                        return;
                    }
                    if (e.getCode() == KeyCode.UP || e.getCode() == KeyCode.W) {
                        selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
                        updateSelection();
                    } else if (e.getCode() == KeyCode.DOWN || e.getCode() == KeyCode.S) {
                        selectedIndex = (selectedIndex + 1) % menuItems.length;
                        updateSelection();
                    } else if (e.getCode() == KeyCode.ENTER || e.getCode() == KeyCode.SPACE) {
                        executeMenuItem(selectedIndex);
                    }
                });
            }
        });

        IntStream.range(0, menuItems.length).forEach(iMenu -> {
            menuItems[iMenu].setOnMouseEntered(e -> {
                selectedIndex = iMenu;
                updateSelection();
            });
            menuItems[iMenu].setOnMouseExited(e -> {
                selectedIndex = null;
                updateSelection();
            });
            menuItems[iMenu].setOnMouseClicked(e -> executeMenuItem(iMenu));
        });
    }

    private void updateSelection() {
        for (int i = 0; i < menuItems.length; i++) {
            if (selectedIndex != null && i == selectedIndex) {
                menuItems[i].setText("> " + menuItems[i].getText().replaceAll("^> ", ""));
                menuItems[i].setStyle("-fx-text-fill: #00FFCC; -fx-effect: dropshadow(three-pass-box, #00FFCC, 10, 0, 0, 0);");
            } else {
                menuItems[i].setText(menuItems[i].getText().replaceAll("^> ", ""));
                menuItems[i].setStyle("-fx-text-fill: #888888; -fx-effect: null;");
            }
        }
    }

    private void executeMenuItem(int index) {
        switch (index) {
            case 0 -> startGame();
            case 1 -> System.out.println(PlayerData.getHighScore());
            case 2 -> System.exit(0);
        }
    }

    private void startGame() {
        try {
            logger.info("Starting a new game...");
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/se233/arkanoid/stage.fxml"));

            PlayerData.setCurrentStage(1); // always start at first stage every run.
            PlayerData.setLifeCount(2);

            Stage stage = (Stage) topLevel.getScene().getWindow();
            stage.setScene(new Scene(loader.load()));
            stage.setTitle("Stage - " + PlayerData.getCurrentStage());
        } catch (IOException e) {
            logger.error("Fail to load stage scene");
            e.printStackTrace();
        }
    }
}
