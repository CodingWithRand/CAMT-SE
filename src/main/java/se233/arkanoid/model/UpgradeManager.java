package se233.arkanoid.model;

import javafx.application.Platform;
import se233.arkanoid.event.Life;
import se233.arkanoid.view.GameplayArea;

public class UpgradeManager {

    /**
     * 1. Increase paddle size (switches Vaus to wider sprite & increases hit box)
     */
    public static void applyIncreasePaddleSize(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            gameplayArea.getGameCharacterList().forEach(character -> {
                if (character instanceof Vaus vaus) {
                    vaus.setExpanded(true);
                }
            });
        });
    }

    /**
     * 2. Increase paddle movement speed by raising max velocity
     */
    public static void applyIncreasePaddleSpeed(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            gameplayArea.getGameCharacterList().forEach(character -> {
                character.setxMaxVelocity(character.getxMaxVelocity() + 3); // Increase top speed by 3
            });
        });
    }

    /**
     * 3. Adjust ball speed
     */
    public static void applyBallSpeedAdjustment(GameplayArea gameplayArea, int speedDelta) {
        Platform.runLater(() -> {
            Ball ball = gameplayArea.getBall();
            if (ball != null) {
                ball.setxVelocity(ball.getxVelocity() + (int) Math.signum(ball.getxVelocity()) * speedDelta);
                ball.setyVelocity(ball.getyVelocity() + (int) Math.signum(ball.getyVelocity()) * speedDelta);
            }
        });
    }

    /**
     * 4. Gain an additional life
     */
    public static void applyGainLife(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            gameplayArea.fireEvent(new Life(Life.GAIN));
        });
    }

    /**
     * 5. Allow the ball to pass through destructible bricks (Piercing Ball mode)
     */
    public static void applyPiercingBall(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            Ball ball = gameplayArea.getBall();
            if (ball != null) {
                ball.setPiercing(true);
            }
        });
    }

    /**
     * 6. Increase score multiplier from destroying bricks (+50% bonus points)
     */
    public static void applyScoreMultiplier() {
        PlayerData.setScoreMultiplier(PlayerData.getScoreMultiplier() + 0.5);
    }
}
/**
button.setOnAction(e -> {
      UpgradeManager.applyIncreasePaddleSize(gameplayArea);
closeUpgradeModalAndResumeGame();
});
 */