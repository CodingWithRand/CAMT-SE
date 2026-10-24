package se233.arkanoid.model;

import se233.arkanoid.model.StageData.Map;

// 1 player game, no need to go crazy
public record PlayerData() {
    private static int currentScore;
    private static int highScore;
    private static int currentStage;
    private static int lifeCount;

    public static int getCurrentScore() {
        return currentScore;
    }

    public static void setCurrentScore(int currentScore) {
        PlayerData.currentScore = currentScore;
    }

    public static int getHighScore() {
        return highScore;
    }

    public static void setHighScore(int highScore) {
        PlayerData.highScore = highScore;
    }

    public static int getCurrentStage() {
        return currentStage;
    }

    public static void setCurrentStage(int currentStage) {
        PlayerData.currentStage = currentStage <= 0 ? 1 : Math.min(currentStage, Map.STAGE.length);
    }

    public static int getLifeCount() {
        return lifeCount;
    }

    public static void setLifeCount(int lifeCount) {
        PlayerData.lifeCount = lifeCount;
    }
}
