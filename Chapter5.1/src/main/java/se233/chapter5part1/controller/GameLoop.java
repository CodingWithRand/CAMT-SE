package se233.chapter5part1.controller;

import se233.chapter5part1.model.GameCharacter;
import se233.chapter5part1.view.GameStage;
import se233.chapter5part1.view.Score;

import java.util.List;

public class GameLoop implements Runnable {
    private GameStage gameStage;
    private int frameRate;
    private float interval;
    private boolean running;
    public GameLoop(GameStage gameStage) {
        this.gameStage = gameStage;
        frameRate = 10;
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
                gameCharacter.getImageView().tick();
                gameCharacter.moveLeft();
            } else if (rightPressed) {
                gameCharacter.getImageView().tick();
                gameCharacter.moveRight();
            } else {
                gameCharacter.stop();
            }

            if (upPressed) {
                gameCharacter.jump();
            }
        }
    }
    private void updateScore(List<Score> scoreList, List<GameCharacter> gameCharacterList) {
        javafx.application.Platform.runLater(() -> {
            for (int i = 0; i<scoreList.size(); i++) {
                scoreList.get(i).setPoint(gameCharacterList.get(i).getScore());
            }
        });
    }
    @Override
    public void run() {
        while (running) {
            float time = System.currentTimeMillis();
            update(gameStage.getGameCharacterList());
            updateScore(gameStage.getScoreList(), gameStage.getGameCharacterList());
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