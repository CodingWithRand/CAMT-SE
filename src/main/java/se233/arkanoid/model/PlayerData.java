package se233.arkanoid.model;

import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.model.StageData.Map;

public record PlayerData() {
    private static final Logger logger = LogManager.getLogger(PlayerData.class);
    private static final IntegerProperty currentScore = new SimpleIntegerProperty(0);
    private static final IntegerProperty currentHighScore = new SimpleIntegerProperty(0);
    private static int currentStage;
    private static int lifeCount;
    private static double scoreMultiplier = 1.0;

    public static double getScoreMultiplier() {
        return scoreMultiplier;
    }

    public static void setScoreMultiplier(double multiplier) {
        scoreMultiplier = multiplier;
    }
    public static int getCurrentScore() {
        return currentScore.get();
    }

    public static void setCurrentScore(int score) {
        currentScore.set(score);
        if(getCurrentScore() > getHighScore()) {
            logger.info("New high score! Saving...");
            setHighScore(score);
            saveHighScoreToFile();
        }
    }

    public static IntegerProperty currentScoreProperty() {
        return currentScore;
    }
    public static IntegerProperty currentHighScoreProperty() {
        return currentHighScore;
    }


    public static int getHighScore() {
        return currentHighScore.get();
    }

    public static void setHighScore(int score) {
        currentHighScore.set(score);
    }

    public static int getCurrentStage() {
        return currentStage;
    }

    public static void setCurrentStage(int stage) {
        currentStage = stage <= 0 ? 1 : Math.min(stage, Map.STAGE.length);
    }

    public static int getLifeCount() {
        return lifeCount;
    }

    public static void setLifeCount(int lives) {
        lifeCount = lives;
    }
    public static void checkAndUpdateHighScore() {
        if (getCurrentScore() > getHighScore()) {
            setHighScore(getCurrentScore());
            saveHighScoreToFile();
        }
    }
    public static void resetState() {
        // always start at first stage every run.
        currentStage = 1;
        currentScore.set(0);
        lifeCount = 2;
        scoreMultiplier = 1.0;
    }
    public static void saveHighScoreToFile() {
        try (java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.File("player-data"))) {
            writer.println("highScore=" + getHighScore());
        } catch (java.io.FileNotFoundException e) {
            e.printStackTrace();
        }
    }
}