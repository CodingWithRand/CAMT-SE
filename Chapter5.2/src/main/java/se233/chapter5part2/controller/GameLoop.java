package se233.chapter5part2.controller;

import javafx.scene.input.KeyCode;
import se233.chapter5part2.model.Direction;
import se233.chapter5part2.model.Food;
import se233.chapter5part2.model.Snake;
import se233.chapter5part2.view.GameStage;

import java.util.List;

public class GameLoop implements Runnable {
    private GameStage gameStage;
    private Snake snake;
    private Food food;
    private Food specialFood;
    private float interval = 1000.0f / 10;
    private boolean running;
    public GameLoop(GameStage gameStage, Snake snake, Food food, Food specialFood) {
        this.snake = snake;
        this.gameStage = gameStage;
        this.food = food;
        this.specialFood = specialFood;
        running = true;
    }
    private void keyProcess() {
        KeyCode curKey = gameStage.getKey();
        Direction curDirection = snake.getDirection();
        if (curKey == KeyCode.UP && curDirection != Direction.DOWN)
            snake.setDirection(Direction.UP);
        else if (curKey == KeyCode.DOWN && curDirection != Direction.UP)
            snake.setDirection(Direction.DOWN);
        else if (curKey == KeyCode.LEFT && curDirection != Direction.RIGHT)
            snake.setDirection(Direction.LEFT);
        else if (curKey == KeyCode.RIGHT && curDirection != Direction.LEFT)
            snake.setDirection(Direction.RIGHT);
        snake.move();
    }
    private void checkCollision() {
        if (snake.collided(food)) {
            snake.grow();
            food.respawn();
        }
        if (snake.collided(specialFood)) {
            for(int i = 0; i<specialFood.getFoodPoint(); i++) snake.grow();
            specialFood.respawn();
        }
        if (snake.checkDead()) { running = false; }
    }
    private void redraw() { gameStage.render(snake, food, specialFood); }
    @Override
    public void run() {
        while (running) {
            keyProcess();
            checkCollision();
            redraw();
            try {
                Thread.sleep((long) (interval));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        gameStage.gameEnd();
    }
}