package se233.arkanoid.view;

import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import se233.arkanoid.model.InvalidStageDataException;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.BrickType;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.model.StageData.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.List;

public class StageBuilder {
    private static final Logger logger = LogManager.getLogger(StageBuilder.class);

    private static final double BRICK_WIDTH = 32.0;   // Display width on screen
    private static final double BRICK_HEIGHT = 16.0;  // Display height on screen
    private static final double OFFSET_TOP = 40.0;    // Top padding below HUD
    private static final double OFFSET_LEFT = 0.0;   // Left margin to center grid

    public static void setStageBg() {
        try {
            int stageNum = PlayerData.getCurrentStage();
            if (GameplayArea.stageBgImg == null) {
                throw new InvalidStageDataException("StageBackground", "Stage background ImageView is uninitialized.");
            }
            GameplayArea.stageBgImg.setViewport(new Rectangle2D(232 * ((stageNum - 1) % 4), 0, 224, 240));
        } catch (InvalidStageDataException e) {
            logger.error("Failed to set stage background: {}", e.getMessage());
        }
    }

    public static List<Brick> buildStage(Image spriteSheet) {
        List<Brick> bricks = new ArrayList<>();

        try {
            if (spriteSheet == null) {
                throw new InvalidStageDataException("BrickSpriteSheet", "Sprite sheet image is null or failed to load.");
            }

            int stageIndex = (PlayerData.getCurrentStage() - 1) % Map.STAGE.length;
            if (stageIndex < 0) stageIndex = 0;

            if (Map.STAGE[stageIndex] == null) {
                throw new InvalidStageDataException("StageMap", "Stage data array is null for index: " + stageIndex);
            }

            int[][] stageData = Map.STAGE[stageIndex];
            for (int row = 0; row < stageData.length; row++) {
                for (int col = 0; col < stageData[row].length; col++) {
                    int brickId = stageData[row][col];

                    if (brickId == 0) continue; // Skip empty air

                    BrickType type = BrickType.fromId(brickId);
                    if (type == null) {
                        throw new InvalidStageDataException("BrickType", "Unknown brick ID encountered: " + brickId);
                    }

                    Brick brick = new Brick(type, spriteSheet, BRICK_WIDTH, BRICK_HEIGHT);

                    // Calculate screen position from array indices
                    double posX = OFFSET_LEFT + (col * BRICK_WIDTH);
                    double posY = OFFSET_TOP + (row * BRICK_HEIGHT);

                    brick.setTranslateX(posX);
                    brick.setTranslateY(posY);

                    bricks.add(brick);
                }
            }
        } catch (InvalidStageDataException e) {
            logger.error("Encountered stage building error: {}", e.getMessage(), e);
            // Fallback: return empty list or handle recovery gracefully so game doesn't crash on demo day
        }

        return bricks;
    }
}