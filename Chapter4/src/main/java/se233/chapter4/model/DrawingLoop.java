package se233.chapter4.model;

import se233.chapter4.view.GameStage;

import java.util.List;

public class DrawingLoop implements Runnable {
    private GameStage gameStage;
    private int frameRate;
    private float interval;
    private boolean running;
    public DrawingLoop(GameStage gameStage) {
        this.gameStage = gameStage;
        frameRate = 60;
        interval = 1000.0f / frameRate;
        running = true;
    }
    private void checkDrawCollisions(List<GameCharacter> gameCharacter) {
        for(GameCharacter gc: gameCharacter) {
            gc.checkReachGameWall();
            gc.checkReachHighest();
            gc.checkReachFloor();
        }
    }
    private void paint(List<GameCharacter> gameCharacter) {
        for(GameCharacter gc: gameCharacter) gc.repaint();
    }
    @Override
    public void run() {
        while (running) {
            float time = System.currentTimeMillis();
            checkDrawCollisions(gameStage.getGameCharacter());
            paint(gameStage.getGameCharacter());
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
