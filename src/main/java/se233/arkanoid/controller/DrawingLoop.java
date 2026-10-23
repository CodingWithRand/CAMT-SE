package se233.arkanoid.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.view.GameplayArea;
import se233.arkanoid.view.Stage;

import java.util.List;

public class DrawingLoop implements Runnable {
    private static final Logger logger = LogManager.getLogger(DrawingLoop.class);
    private GameplayArea gameStage;
    private int frameRate;
    private float interval;
    private boolean running;
    public DrawingLoop(GameplayArea gameStage) {
        this.gameStage = gameStage;
        frameRate = 60;
        interval = 1000.0f / frameRate; // 1000 ms = 1 second
        running = true;
    }
    private void checkDrawCollisions(List<GameCharacter> gameCharacterList) {
        for (GameCharacter gameCharacter : gameCharacterList) {
            gameCharacter.checkReachGameWall();
//            gameCharacter.checkReachHighest();
//            gameCharacter.checkReachFloor();
        }
        GameCharacter cA = gameCharacterList.get(0);
//        GameCharacter cB = gameCharacterList.get(1);
//        if (cA.getBoundsInParent().intersects(cB.getBoundsInParent())) {
//            if (cA.collided(cB) == false) {
//                cB.collided(cA);
//            }
//        }
    }
    private void paint(List<GameCharacter> gameCharacterList) {
        for (GameCharacter gameCharacter : gameCharacterList) {
            gameCharacter.repaint();
        }
    }
    @Override
    public void run() {
        while (running) {
            float time = System.currentTimeMillis();

            checkDrawCollisions(gameStage.getGameCharacterList());
            paint(gameStage.getGameCharacterList());

            time = System.currentTimeMillis() - time;
            if (time < interval) {
                try {
                    Thread.sleep((long) (interval - time));
                } catch (InterruptedException e) {
                }
            } else {
                try {
                    Thread.sleep((long) (interval - (interval % time)));
                } catch (InterruptedException e) {
                }
            }
        }
    }
}

