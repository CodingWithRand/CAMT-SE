package se233.arkanoid.model;

import javafx.scene.control.Label;
import se233.arkanoid.view.GameplayArea;

import java.util.Random;

public class Upgrade {
    public String getuDesc() {
        return uDesc;
    }

    public enum UpgradeType {
        PADDLE_SIZE,
        PADDLE_SPEED,
        BALL_SPEED,
        GAIN_LIFE,
        PIERCING_BALL,
        NX_SCORE
    }

    private static int typesNum = 6;
    private String uDesc;
    private UpgradeType uType;
    private Label assignedLabel;

    public Upgrade(Label label) {
        this.assignedLabel = label;
    }

    public Upgrade randU() {
        Random random = new Random(System.currentTimeMillis());
        this.uType = UpgradeType.values()[random.nextInt(typesNum)];
        return this;
    }

    public Upgrade genUDescTemplate() {
        switch (uType) {
            case PADDLE_SIZE -> this.uDesc = "Increase paddle size";
            case PADDLE_SPEED -> this.uDesc = "Increase paddle movement speed by 40%";
            case BALL_SPEED -> this.uDesc = "Increase ball speed by 40%";
            case GAIN_LIFE -> this.uDesc = "+1 Life";
            case PIERCING_BALL -> this.uDesc = "Piercing Ball mode";
            case NX_SCORE -> this.uDesc = "+50% bonus points for each brick";
        }
        return this;
    }

    public Upgrade assignedDescTo() {
        this.assignedLabel.setText(this.uDesc);
        return this;
    }

    public void execute(Object... args) {
        GameplayArea gpA = (GameplayArea) args[0];
        Integer speedDelta = (Integer) args[1];
        switch (uType) {
            case PADDLE_SIZE -> UpgradeManager.applyIncreasePaddleSize(gpA);
            case PADDLE_SPEED -> UpgradeManager.applyIncreasePaddleSpeed(gpA);
            case BALL_SPEED -> UpgradeManager.applyBallSpeedAdjustment(gpA, speedDelta == null ? 3 : Math.abs(speedDelta));
            case GAIN_LIFE -> UpgradeManager.applyGainLife(gpA);
            case PIERCING_BALL -> UpgradeManager.applyPiercingBall(gpA);
            case NX_SCORE -> UpgradeManager.applyScoreMultiplier();
        }
    }
}
