package se233.arkanoid.model.StageData;

import javafx.geometry.Rectangle2D;

public enum BrickType {
    EMPTY(0, 0, 0, 0, 0, 0, 0),
    RED(1, 0, 8, 1, 100, 16, 8),     // x=0, y=0, 1 hit, 100 pts
    BLUE(2, 16, 8, 1, 120, 16, 8),   // x=0, y=16, 1 hit, 120 pts
    SILVER(3, 0, 16, 2, 200, 16, 8), // x=0, y=32, 2 hits, 200 pts
    GOLD(4, 0, 24, -1, 0, 16, 8);    // x=0, y=48, Unbreakable (-1)

    private final int id;
    private final Rectangle2D viewport;
    private final int maxHp;
    private final int scoreValue;

    BrickType(int id, int spriteX, int spriteY, int maxHp, int scoreValue, int width, int height) {
        this.id = id;
        this.viewport = new Rectangle2D(spriteX, spriteY, width, height);
        this.maxHp = maxHp;
        this.scoreValue = scoreValue;
    }

    public Rectangle2D getViewport() { return viewport; }
    public int getMaxHp() { return maxHp; }
    public int getScoreValue() { return scoreValue; }

    public static BrickType fromId(int id) {
        for (BrickType type : values()) {
            if (type.id == id) return type;
        }
        return EMPTY;
    }
}