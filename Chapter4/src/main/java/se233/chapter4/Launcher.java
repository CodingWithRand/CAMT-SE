package se233.chapter4;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import se233.chapter4.controller.GameLoop;
import se233.chapter4.model.DrawingLoop;
import se233.chapter4.view.GameStage;

public class Launcher extends Application {
    public static void main(String[] args) {
        launch(args);
    }
    @Override
    public void start(Stage stage) {
        GameStage gameStage = new GameStage();
        GameLoop gameLoop = new GameLoop(gameStage);
        DrawingLoop drawingLoop = new DrawingLoop(gameStage);
        Scene scene = new Scene(gameStage, gameStage.WIDTH, gameStage.HEIGHT);
        stage.setTitle("Mario");
        stage.setScene(scene);
        stage.show();
        (new Thread(gameLoop)).start();
        (new Thread(drawingLoop)).start();
        scene.setOnKeyPressed(event -> gameStage.getKeys().add(event.getCode()));
        scene.setOnKeyReleased(event ->  gameStage.getKeys().remove(event.getCode()));
    }
}
