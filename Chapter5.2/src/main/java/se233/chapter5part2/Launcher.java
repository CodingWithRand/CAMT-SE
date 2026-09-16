package se233.chapter5part2;

import javafx.application.Application;
import javafx.geometry.Point2D;
import javafx.scene.Scene;
import javafx.stage.Stage;
import se233.chapter5part2.controller.GameLoop;
import se233.chapter5part2.model.Food;
import se233.chapter5part2.model.Snake;
import se233.chapter5part2.view.GameStage;

public class Launcher extends Application {
    public static void main(String[] args) { launch(args); }
    @Override
    public void start(Stage primaryStage) {
        GameStage gameStage = new GameStage();
        Snake snake = new Snake(new Point2D(gameStage.WIDTH/2, gameStage.HEIGHT/2));
        Food food = new Food();
        GameLoop gameLoop = new GameLoop(gameStage, snake, food);
        Scene scene = new Scene(gameStage, gameStage.WIDTH*gameStage.TILE_SIZE, gameStage.HEIGHT*gameStage.TILE_SIZE);
        scene.setOnKeyPressed(event-> gameStage.setKey(event.getCode()));
        scene.setOnKeyReleased(event -> gameStage.setKey(null));
        primaryStage.setTitle("Snake Game");
        primaryStage.setScene(scene);
        primaryStage.setResizable(false);
        primaryStage.show();
        (new Thread(gameLoop)).start();
    }
}