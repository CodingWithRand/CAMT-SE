package se233.arkanoid.view;

import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.BrickType;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.model.StageData.Map;

import java.util.ArrayList;
import java.util.List;

public class StageBuilder {

    private static final double BRICK_WIDTH = 32.0;   // Display width on screen
    private static final double BRICK_HEIGHT = 16.0;  // Display height on screen
    private static final double OFFSET_TOP = 40.0;    // Top padding below HUD
    private static final double OFFSET_LEFT = 0.0;   // Left margin to center grid

    public static void setStageBg() {
        int stageNum = PlayerData.getCurrentStage();
        GameplayArea.stageBgImg.setViewport(new Rectangle2D(232 * ((stageNum - 1) % 4),0 , 224, 240));
    }

    public static List<Brick> buildStage(Image spriteSheet) {
        List<Brick> bricks = new ArrayList<>();
        int stageIndex = (PlayerData.getCurrentStage() - 1) % Map.STAGE.length;
        if (stageIndex < 0) stageIndex = 0;

        int[][] stageData = Map.STAGE[stageIndex];
        for (int row = 0; row < stageData.length; row++) {
            for (int col = 0; col < stageData[row].length; col++) {
                int brickId = stageData[row][col];

                if (brickId == 0) continue; // Skip empty air

                BrickType type = BrickType.fromId(brickId);
                Brick brick = new Brick(type, spriteSheet, BRICK_WIDTH, BRICK_HEIGHT);

                // Calculate screen position from array indices
                double posX = OFFSET_LEFT + (col * BRICK_WIDTH);
                double posY = OFFSET_TOP + (row * BRICK_HEIGHT);

                brick.setTranslateX(posX);
                brick.setTranslateY(posY);

                bricks.add(brick);
            }
        }
        return bricks;
    }
}