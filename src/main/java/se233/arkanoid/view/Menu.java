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

import java.io.IOException;

public class Menu {
    private static final Logger logger = LogManager.getLogger(Menu.class);
    private int selectedIndex = 0;
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

        menuItems = new Label[]{startBtn, highScoreBtn, exitBtn};

        topLevel.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if (newScene != null) {
                topLevel.getScene().setOnKeyPressed(e -> {
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
    }

    private void updateSelection() {
        for (int i = 0; i < menuItems.length; i++) {
            if (i == selectedIndex) {
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
            case 1 -> System.out.println("Opening High Scores...");
            case 2 -> System.exit(0);
        }
    }

    private void startGame() {
        try {
            logger.info("Starting a new game...");
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/se233/arkanoid/stage.fxml"));

            Stage stage = (Stage) topLevel.getScene().getWindow();
            stage.setScene(new Scene(loader.load()));
            stage.setTitle("Stage - 1");
        } catch (IOException e) {
            logger.error("Fail to load stage scene");
            e.printStackTrace();
        }
    }
}
