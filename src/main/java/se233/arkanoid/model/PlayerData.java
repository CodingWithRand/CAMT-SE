package se233.arkanoid.model;

import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
import se233.arkanoid.model.StageData.Map;

public class PlayerData {
    private static final IntegerProperty currentScore = new SimpleIntegerProperty(0);
    private static int highScore;
    private static int currentStage;
    private static int lifeCount;

    public static int getCurrentScore() {
        return currentScore.get();
    }

    public static void setCurrentScore(int score) {
        currentScore.set(score);
    }

    public static IntegerProperty currentScoreProperty() {
        return currentScore;
    }

    public static int getHighScore() {
        return highScore;
    }

    public static void setHighScore(int score) {
        highScore = score;
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
}