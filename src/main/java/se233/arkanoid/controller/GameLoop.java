package se233.arkanoid.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.model.GameMoveableObject;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;
//import se233.chapter5part1.view.Score;

import java.util.List;

public class GameLoop implements Runnable {
    private static final Logger logger = LogManager.getLogger(GameLoop.class);
    private GameplayArea gameStage;
    private int frameRate;
    private float interval;
    private boolean running;
    public GameLoop(GameplayArea gameStage) {
        this.gameStage = gameStage;
        frameRate = 60;
        interval = 1000.0f / frameRate;
        running = true;
    }
    private void update(List<GameCharacter> gameCharacterList) {

        for (GameCharacter gameCharacter : gameCharacterList) {
            boolean leftPressed = gameStage.getKeys().isPressed(gameCharacter.getLeftKey());
            boolean rightPressed = gameStage.getKeys().isPressed(gameCharacter.getRightKey());
            boolean upPressed = gameStage.getKeys().isPressed(gameCharacter.getUpKey());

            if (leftPressed && rightPressed) {
                gameCharacter.stop();
            } else if (leftPressed) {
//                gameCharacter.getImageView().tick();
                logger.info("Going left");
                gameCharacter.moveLeft();
            } else if (rightPressed) {
//                gameCharacter.getImageView().tick();
                logger.info("Going right");
                gameCharacter.moveRight();
            } else {
                gameCharacter.stop();
            }}
            GameMoveableObject ball = gameStage.getBall();
            if (ball != null) {
                ball.move();

                for (GameCharacter paddle : gameCharacterList) {
                    ball.checkPaddleCollision(paddle);
                }

                // Create a frame-local queue for bricks destroyed during this tick
                List<Brick> bricksToRemove = new java.util.ArrayList<>();

                // Check collisions and collect destroyed bricks
                ball.checkBrickCollisions(gameStage.getCurrentObstacles(), bricksToRemove);

                // Batch remove destroyed bricks cleanly
                if (!bricksToRemove.isEmpty()) {
                    gameStage.removeDestroyedBricks(bricksToRemove);
                }
//            if (upPressed) {
//                gameCharacter.jump();
//            }
        }
    }
//    private void updateScore(List<Score> scoreList, List<GameCharacter> gameCharacterList) {
//        javafx.application.Platform.runLater(() -> {
//            for (int i = 0; i<scoreList.size(); i++) {
//                scoreList.get(i).setPoint(gameCharacterList.get(i).getScore());
//            }
//        });
//    }
    @Override
    public void run() {
        while (running) {
            float time = System.currentTimeMillis();
            update(gameStage.getGameCharacterList());
//            updateScore(gameStage.getScoreList(), gameStage.getGameCharacterList());
            time = System.currentTimeMillis() - time;
            if (time < interval) {
                try {
                    Thread.sleep((long) (interval - time));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            } else {
                try {
                    Thread.sleep((long) (interval - (interval % time)));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}