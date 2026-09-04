package se233.chapter4.controller;

import se233.chapter4.model.GameCharacter;
import se233.chapter4.view.GameStage;

import java.util.List;

public class GameLoop implements Runnable {
    private GameStage gameStage;
    private int frameRate;
    private float interval;
    private boolean running;
    public GameLoop(GameStage gameStage) {
        this.gameStage = gameStage;
//        frameRate = 60;
        frameRate = 10;
        interval = 1000.0f / frameRate;
        running = true;
    }
    private void update(List<GameCharacter> gameCharacter) {
        for(GameCharacter gc: gameCharacter) {
            boolean leftPressed = gameStage.getKeys().isPressed(gc.getLeftKey());
            boolean rightPressed = gameStage.getKeys().isPressed(gc.getRightKey());
            boolean upPressed = gameStage.getKeys().isPressed(gc.getUpKey());

            if (leftPressed && rightPressed) gc.stop();
            else if (leftPressed) {
                gc.getImageView().tick();
                gc.moveLeft();
                gc.trace();
            }
            else if (rightPressed) {
                gc.getImageView().tick();
                gc.moveRight();
                gc.trace();
            }
            else gc.stop();

            if(upPressed) gc.jump();
        }
    }
    @Override
    public void run() {
        while(running) {
            float time = System.currentTimeMillis();
            update(gameStage.getGameCharacter());
            time  = System.currentTimeMillis() - time;
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
