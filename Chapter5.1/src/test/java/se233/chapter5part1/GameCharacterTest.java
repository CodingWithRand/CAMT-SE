package se233.chapter5part1;

import javafx.scene.input.KeyCode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.chapter5part1.model.GameCharacter;
import se233.chapter5part1.view.GameStage;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

public class GameCharacterTest {
    Field xVelocityField, yVelocityField, yAccelerationField;
    private GameCharacter gameCharacter;

    @BeforeAll
    public static void initJfxRuntime() {
        javafx.application.Platform.startup(() -> {});
    }

    @BeforeEach
    public void setup() throws NoSuchFieldException {
        gameCharacter = new GameCharacter(0, 30, 30, "assets/Character1.png", 4, 3, 2, 111, 97, KeyCode.A, KeyCode.D, KeyCode.W);
        xVelocityField = gameCharacter.getClass().getDeclaredField("xVelocity");
        yVelocityField = gameCharacter.getClass().getDeclaredField("yVelocity");
        yAccelerationField = gameCharacter.getClass().getDeclaredField("yAcceleration");
        xVelocityField.setAccessible(true);
        yVelocityField.setAccessible(true);
        yAccelerationField.setAccessible(true);
    }

    @Test
    public void respawn_givenNewGameCharacter_thenCoordinatesAre30_30() {
        gameCharacter.respawn();
        assertEquals(30, gameCharacter.getX(), "Initial x");
        assertEquals(30, gameCharacter.getY(), "Initial y");
    }

    @Test
    public void respawn_givenNewGameCharacter_thenScoreIs0() {
        gameCharacter.respawn();
        assertEquals(0, gameCharacter.getScore(), "Initial score");
    }
    
    @Test
    public void moveX_givenMoveRightOnce_thenXCoordinateIncreasedByxVelocityField() throws IllegalAccessException {
        gameCharacter.respawn();
        gameCharacter.moveRight();
        gameCharacter.moveX();
        assertEquals(30 + xVelocityField.getInt(gameCharacter), gameCharacter.getX(), " Move right x");
    }
    @Test
    public void moveY_givenTwoConsecutiveCalls_thenYVelocityIncreases() throws IllegalAccessException {
        gameCharacter.respawn();
        gameCharacter.moveY();
        int yVelocity1 = yVelocityField.getInt(gameCharacter);
        gameCharacter.moveY();
        int yVelocity2 = yVelocityField.getInt(gameCharacter);
        assertTrue(yVelocity2 > yVelocity1, "Velocity is increasing");
    }
    @Test
    public void moveY_givenTwoConsecutiveCalls_thenYAccelerationUnchanged() throws IllegalAccessException {
        gameCharacter.respawn();
        gameCharacter.moveY();
        int yAcceleration1 = yAccelerationField.getInt(gameCharacter);
        gameCharacter.moveY();
        int yAcceleration2 = yAccelerationField.getInt(gameCharacter);
        assertTrue(yAcceleration1 == yAcceleration2, "Acceleration is not change");
    }
    @Test
    public void hitWallOnLeftSide_andCharacterPositionStayTheSame() {
        gameCharacter = new GameCharacter(0, 0, 0, "assets/Character1.png", 4, 3, 2, 111, 97, KeyCode.A, KeyCode.D, KeyCode.W);
        int beforeMoveLeft = gameCharacter.getX();
        gameCharacter.moveLeft();
        gameCharacter.moveX();
        gameCharacter.checkReachGameWall();
        int afterMoveLeft = gameCharacter.getX();
        System.out.println(afterMoveLeft);
        assertTrue(beforeMoveLeft == afterMoveLeft && afterMoveLeft == 0, "Character hit the wall on the left and doesn't move even push it");
    }
    @Test
    public void hitWallOnRightSide_andCharacterPositionStayTheSame() {
        gameCharacter = new GameCharacter(0, GameStage.WIDTH - (int)(111 * 1.2), 0, "assets/Character1.png", 4, 3, 2, 111, 97, KeyCode.A, KeyCode.D, KeyCode.W);
//        gameCharacter.applyCss();
//        gameCharacter.layout();
        int beforeMoveRight = gameCharacter.getX();
        gameCharacter.moveRight();
        gameCharacter.moveX();
        gameCharacter.checkReachGameWall();
        int afterMoveRight = gameCharacter.getX();
        System.out.println(beforeMoveRight + " " + afterMoveRight);
        assertTrue(beforeMoveRight == afterMoveRight && afterMoveRight == (GameStage.WIDTH - (int)(111 * 1.2)), "Character hit the wall on the right and doesn't move even push it");
    }
    @Test
    public void successfullyJumpOnGround() {
        gameCharacter.checkReachFloor(); // make sure it's on ground.

    }
    @Test
    public void cannotJumpWhenAirborne() {

    }
}
