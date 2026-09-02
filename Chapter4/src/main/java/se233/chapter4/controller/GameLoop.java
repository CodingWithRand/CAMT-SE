package se233.chapter4.controller;

import se233.chapter4.model.GameCharacter;
import se233.chapter4.view.GameStage;

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
    private void update(GameCharacter gameCharacter) {
        boolean leftPressed = gameStage.getKeys().isPressed(gameCharacter.getLeftKey());
        boolean rightPressed = gameStage.getKeys().isPressed(gameCharacter.getRightKey());
        boolean upPressed = gameStage.getKeys().isPressed(gameCharacter.getUpKey());

        if (leftPressed && rightPressed) gameCharacter.stop();
        else if (leftPressed) {
            gameCharacter.getImageView().tick();
            gameCharacter.moveLeft();
            gameStage.getGameCharacter().trace();
        }
        else if (rightPressed) {
            gameCharacter.getImageView().tick();
            gameCharacter.moveRight();
            gameStage.getGameCharacter().trace();
        }
        else gameCharacter.stop();

        if(upPressed) gameCharacter.jump();
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
