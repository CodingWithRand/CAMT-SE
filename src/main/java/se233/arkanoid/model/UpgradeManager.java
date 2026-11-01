package se233.arkanoid.model;

import javafx.application.Platform;
import se233.arkanoid.event.Life;
import se233.arkanoid.view.GameplayArea;

public record UpgradeManager() {

    private static final int nonUpgradeLifeCount = 2;
    private static final int nonUpgradeBallMaxVelocity = 7;
    private static final int nonUpgradePaddleMaxVelocity = 7;

    /**
     * 1. Increase paddle size (switches Vaus to wider sprite & increases hit box)
     */
    public static void applyIncreasePaddleSize(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            gameplayArea.getGameCharacterList().forEach(character -> {
                if (character instanceof Vaus vaus) {
                    vaus.setExpanded(true);
                    vaus.setIsArmed(false);
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
     * 3. Adjust ball speed (I change to maxVelocity, cuz at the start, the ball velocity is 0.)
     */
    public static void applyBallSpeedAdjustment(GameplayArea gameplayArea, int speedDelta) {
        Platform.runLater(() -> {
            Ball ball = gameplayArea.getBall();
            if (ball != null) {
                // Directly accelerate current velocities without touching max velocity caps
                int vx = ball.getxVelocity();
                int vy = ball.getyVelocity();

                // If ball hasn't been nudged/launched yet, give it a default upward trajectory
                if (vx == 0 && vy == 0) {
                    ball.setxVelocity(2);
                    ball.setyVelocity(-4);
                    return;
                }

                // Add speed delta while preserving exact directional sign (+ or -)
                int newVx = (vx > 0) ? vx + speedDelta : vx - speedDelta;
                int newVy = (vy > 0) ? vy + speedDelta : vy - speedDelta;

                ball.setxVelocity(newVx);
                ball.setyVelocity(newVy);
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

    public static void revertUpgrade(GameplayArea gameplayArea) {
        Platform.runLater(() -> {
            gameplayArea.getGameCharacterList().forEach(character -> {
                // 1
                if (character instanceof Vaus vaus) {
                    vaus.setExpanded(false);
                    // 7
                    vaus.setIsArmed(false);
                }
                // 2
                character.setxMaxVelocity(nonUpgradePaddleMaxVelocity); // Increase top speed by 3
            });
            Ball ball = gameplayArea.getBall();
            // 4
            for (int i = 0; i < PlayerData.getLifeCount() - nonUpgradeLifeCount; i++) {
                gameplayArea.fireEvent(new Life(Life.LOSE));
            }
//            while (PlayerData.getLifeCount() > nonUpgradeLifeCount) gameplayArea.fireEvent(new Life(Life.LOSE));
            if (ball != null) {
                // 3
                ball.setxMaxVelocity(nonUpgradeBallMaxVelocity);
                ball.setyMaxVelocity(nonUpgradeBallMaxVelocity);
                // 5
                ball.setPiercing(false);
            }
        });
        // 6
        PlayerData.setScoreMultiplier(1);
    }

    public static void armedWithBullets(GameplayArea gameplayArea) {
        gameplayArea.getGameCharacterList().forEach(character -> {if (character instanceof Vaus vaus) {
            vaus.setIsArmed(true);
            vaus.setExpanded(false); // Disable expansion so laser sprite sheet takes priority
        }});
    }

}
