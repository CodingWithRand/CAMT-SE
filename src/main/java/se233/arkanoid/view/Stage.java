package se233.arkanoid.view;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.controller.DrawingLoop;
import se233.arkanoid.controller.GameLoop;
import se233.arkanoid.model.*;

import java.io.IOException;
import java.util.stream.IntStream;


public class Stage {
    private static Logger logger = LogManager.getLogger(Stage.class);

    @FXML
    private Label thisGameScore;
    @FXML
    private Label highestScore;
    @FXML
    private Label highScoreLabel;
    @FXML
    private GameplayArea gameplayArea;

    @FXML
    private VBox gameOverModal;
    @FXML
    private Label endTitle;
    @FXML
    private Label finalScoreLabel;
    @FXML
    private Label restartBtn;
    @FXML
    private Label backToMenu;

    @FXML
    private VBox upgradeModal;
    @FXML
    private Label upgradeTitle;
    @FXML
    private HBox upgrade1;
    @FXML
    private HBox upgrade2;
    @FXML
    private HBox upgrade3;
    @FXML
    private Label upgradeDesc1;
    @FXML
    private Label upgradeDesc2;
    @FXML
    private Label upgradeDesc3;

    private GameLoop gameLoop;
    private Integer selectedIndex = 0;
    private Label[] gameOverMenuItems;
    private HBox[] upgradeButtonItems;
    private static Upgrade[] upgrades;

    @FXML
    public void initialize() {
        // Load custom TTF retro font
        Font retroFont = Font.loadFont(
                getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 18
        );
        Font retroFontSmall = Font.loadFont(
                getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 11
        );
        // Fallback to Monospaced if font file isn't present yet
        if (retroFont != null) {
            highScoreLabel.setFont(Font.loadFont(
                    getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 24
            ));
            highestScore.setFont(retroFont);
            thisGameScore.setFont(retroFont);
            endTitle.setFont(Font.loadFont(
                    getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 36
            ));
            upgradeTitle.setFont(Font.loadFont(
                    getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 36
            ));
            restartBtn.setFont(retroFont);
            backToMenu.setFont(retroFont);
            finalScoreLabel.setFont(retroFont);
            upgradeDesc1.setFont(retroFontSmall);
            upgradeDesc2.setFont(retroFontSmall);
            upgradeDesc3.setFont(retroFontSmall);
        }

        thisGameScore.setText(Integer.toString(PlayerData.getCurrentScore()));
        highestScore.setText(Integer.toString(PlayerData.getHighScore()));

        thisGameScore.textProperty().bind(PlayerData.currentScoreProperty().asString());
        gameplayArea.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if(newScene != null) {
                gameplayArea.getScene().windowProperty().addListener((obsWindow, oldWindow, newWindow) -> {
                    if (newWindow instanceof javafx.stage.Stage stage) {
                        // Wait for the window to actually display before requesting focus
                        stage.setOnShown(e -> {
                            Platform.runLater(() -> {
                                gameplayArea.requestFocus();
                            });
                        });
                    }
                });
                gameplayArea.getScene().addEventFilter(KeyEvent.KEY_PRESSED, event -> {
                    if(event.getCode() == KeyCode.R) restart();
                    else gameplayArea.getKeys().add(event.getCode());
                });
                gameplayArea.getScene().addEventFilter(KeyEvent.KEY_RELEASED, event ->  gameplayArea.getKeys().remove(event.getCode()));
            }
        });

        DrawingLoop drawingLoop = new DrawingLoop(gameplayArea);
        gameLoop = new GameLoop(gameplayArea, gameOverModal);
        GameLoop.restart(gameLoop);
        (new Thread(drawingLoop)).start();

        gameOverMenuItems = new Label[]{restartBtn, backToMenu};
        upgradeButtonItems = new HBox[]{upgrade1, upgrade2, upgrade3};
        upgrades = new Upgrade[]{
                new Upgrade(upgradeDesc1).randU().genUDescTemplate().assignedDescTo(),
                new Upgrade(upgradeDesc2).randU().genUDescTemplate().assignedDescTo(),
                new Upgrade(upgradeDesc3).randU().genUDescTemplate().assignedDescTo()
        };

        gameOverModal.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if (newScene != null) {
                gameOverModal.getScene().setOnKeyPressed(e -> {
                    if (selectedIndex == null) {
                        selectedIndex = 0;
                        updateSelection();
                        return;
                    }
                    if (e.getCode() == KeyCode.UP || e.getCode() == KeyCode.W) {
                        selectedIndex = (selectedIndex - 1 + gameOverMenuItems.length) % gameOverMenuItems.length;
                        updateSelection();
                    } else if (e.getCode() == KeyCode.DOWN || e.getCode() == KeyCode.S) {
                        selectedIndex = (selectedIndex + 1) % gameOverMenuItems.length;
                        updateSelection();
                    } else if (e.getCode() == KeyCode.ENTER || e.getCode() == KeyCode.SPACE) {
                        executeMenuItem(selectedIndex);
                    }
                });
            }
        });

        IntStream.range(0, gameOverMenuItems.length).forEach(iMenu -> {
            gameOverMenuItems[iMenu].setOnMouseEntered(e -> {
                selectedIndex = iMenu;
                updateSelection();
            });
            gameOverMenuItems[iMenu].setOnMouseExited(e -> {
                selectedIndex = null;
                updateSelection();
            });
            gameOverMenuItems[iMenu].setOnMouseClicked(e -> executeMenuItem(iMenu));
        });

// 3 upgrades selection handling
        IntStream.range(0, 3).forEach(ui -> {
            upgradeButtonItems[ui].setOnMouseClicked(e -> {
                // 1. Execute the selected upgrade safely
                upgrades[ui].execute(gameplayArea);

                // 2. Hide the upgrade modal & make it mouse-transparent again
                upgradeModal.setVisible(false);
                upgradeModal.setMouseTransparent(true);

                // 3. Re-roll random upgrades for the future
                upgrades = new Upgrade[]{
                        new Upgrade(upgradeDesc1).randU().genUDescTemplate().assignedDescTo(),
                        new Upgrade(upgradeDesc2).randU().genUDescTemplate().assignedDescTo(),
                        new Upgrade(upgradeDesc3).randU().genUDescTemplate().assignedDescTo()
                };

                // 4. Resume gameplay and focus back on the board
                GameLoop.startStage();
                gameplayArea.requestFocus();
            });
            upgradeButtonItems[ui].setOnMouseClicked(e -> {
                upgradeModal.setVisible(false);
                upgradeModal.setMouseTransparent(true);
                gameplayArea.setMouseTransparent(false);
                upgrades[ui].execute(gameplayArea);
            });
            upgradeButtonItems[ui].setOnMouseEntered(e -> upgradeButtonItems[ui].setOpacity(0.5));
            upgradeButtonItems[ui].setOnMouseExited(e -> upgradeButtonItems[ui].setOpacity(1));
        });
    }

    private void updateSelection() {
        for (int i = 0; i < gameOverMenuItems.length; i++) {
            if (selectedIndex != null && i == selectedIndex) {
                gameOverMenuItems[i].setText("> " + gameOverMenuItems[i].getText().replaceAll("^> ", ""));
                gameOverMenuItems[i].setStyle("-fx-text-fill: #00FFCC; -fx-effect: dropshadow(three-pass-box, #00FFCC, 10, 0, 0, 0);");
            } else {
                gameOverMenuItems[i].setText(gameOverMenuItems[i].getText().replaceAll("^> ", ""));
                gameOverMenuItems[i].setStyle("-fx-text-fill: #888888; -fx-effect: null;");
            }
        }
    }

    private void executeMenuItem(int index) {
        switch (index) {
            case 0 -> {
                GameLoop.gameOver();
                Platform.runLater(this::restart);
            }
            case 1 -> backToMenu();
        }
    }

    private void backToMenu() {
        try {
            logger.info("Back to menu...");
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/se233/arkanoid/main-menu.fxml"));

            javafx.stage.Stage stage = (javafx.stage.Stage) gameOverModal.getScene().getWindow();
            stage.setScene(new Scene(loader.load()));
            stage.setTitle("Retro Arkanoid Menu");
        } catch (IOException e) {
            logger.error("Fail to load stage scene");
            e.printStackTrace();
        }
    }

    private void restart() {
        PlayerData.setLifeCount(2);
        PlayerData.setCurrentStage(1);
        PlayerData.setCurrentScore(0);
        Platform.runLater(() -> {
            gameOverModal.setVisible(false);
            gameOverModal.setMouseTransparent(true);
            gameOverModal.toBack();
            gameplayArea.stageSetup();
            for(GameCharacter gameCharacter: gameplayArea.getGameCharacterList()) {
                ((Vaus) gameCharacter).setIsArmed(false);
                gameCharacter.respawn();
            }
            gameplayArea.getBall().respawn();
            gameplayArea.setMouseTransparent(false);
            gameplayArea.requestFocus();
            UpgradeManager.revertUpgrade(gameplayArea);
        });

        ((javafx.stage.Stage) gameplayArea.getScene().getWindow()).setTitle("Stage - 1");
        GameLoop.restart(gameLoop);
    }

    public static Upgrade[] getUpgrades() { return upgrades; }
}
