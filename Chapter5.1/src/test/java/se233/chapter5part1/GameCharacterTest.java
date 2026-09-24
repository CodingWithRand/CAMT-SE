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
    Field xVelocityField, yVelocityField, yAccelerationField, characterWidthField, characterHeightField;
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
        characterWidthField = gameCharacter.getClass().getDeclaredField("characterWidth");
        characterHeightField = gameCharacter.getClass().getDeclaredField("characterHeight");
        xVelocityField.setAccessible(true);
        yVelocityField.setAccessible(true);
        yAccelerationField.setAccessible(true);
        characterWidthField.setAccessible(true);
        characterHeightField.setAccessible(true);
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
    public void hitWallOnLeftSide_andCharacterPositionStayTheSame() throws IllegalAccessException {
        gameCharacter = new GameCharacter(0, 0, 0, "assets/Character1.png", 4, 3, 2, characterWidthField.getInt(gameCharacter), 97, KeyCode.A, KeyCode.D, KeyCode.W);
        int beforeMoveLeft = gameCharacter.getX();
        gameCharacter.moveLeft();
        gameCharacter.moveX();
        gameCharacter.checkReachGameWall();
        int afterMoveLeft = gameCharacter.getX();
        System.out.println(afterMoveLeft);
        assertTrue(beforeMoveLeft == afterMoveLeft && afterMoveLeft == 0, "Character hit the wall on the left and doesn't move even push it");
    }
    @Test
    public void hitWallOnRightSide_andCharacterPositionStayTheSame() throws IllegalAccessException {
        gameCharacter = new GameCharacter(0, GameStage.WIDTH - (int)(characterWidthField.getInt(gameCharacter) * 1.2), 0, "assets/Character1.png", 4, 3, 2, characterWidthField.getInt(gameCharacter), 97, KeyCode.A, KeyCode.D, KeyCode.W);
//        gameCharacter.applyCss();
//        gameCharacter.layout();
        int beforeMoveRight = gameCharacter.getX();
        gameCharacter.moveRight();
        gameCharacter.moveX();
        gameCharacter.checkReachGameWall();
        int afterMoveRight = gameCharacter.getX();
        System.out.println(beforeMoveRight + " " + afterMoveRight);
        assertTrue(beforeMoveRight == afterMoveRight && afterMoveRight == (GameStage.WIDTH - (int)(characterWidthField.getInt(gameCharacter) * 1.2)), "Character hit the wall on the right and doesn't move even push it");
    }
    @Test
    public void successfullyJumpOnGround() {
        //generate character on the ground or in ground.
        gameCharacter = new GameCharacter(0, 0, GameStage.GROUND - 90 /* in ground by 7 px */, "assets/Character1.png", 4, 3, 2, 111, 97, KeyCode.A, KeyCode.D, KeyCode.W);
        gameCharacter.checkReachFloor(); // make sure it's on ground.
        gameCharacter.jump();
        assertTrue(gameCharacter.isJumping(), "Can jump, on the ground now.");
    }
    @Test
    public void cannotJumpWhenAirborne() {
        gameCharacter.checkReachFloor(); // make sure it's on ground.
        gameCharacter.jump();
        assertFalse(gameCharacter.isJumping(), "Cannot jump as still in the air");
    }

    @Test
    public void whenACharacterCollideWithAnotherOneHorizontally_itsXPositionStayTheSame() throws IllegalAccessException {
        // hit from the right by anotherGameCharacter
        GameCharacter anotherGameCharacter = new GameCharacter(1, characterWidthField.getInt(gameCharacter) + gameCharacter.getX(), 30, "assets/Character2.png", 4, 4 ,1, 129,66, KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP);
//        System.out.println(characterWidthField.getInt(gameCharacter) + " " + gameCharacter.getX());
//        System.out.println(anotherGameCharacter.getX());
        int caseAPosBeforeMovedToOverlappedFromRight = anotherGameCharacter.getX();
//        System.out.println(gameCharacter.getBoundsInParent().intersects(anotherGameCharacter.getBoundsInParent()));
//        System.out.println(gameCharacter.getBoundsInParent().toString());
//        System.out.println(anotherGameCharacter.getBoundsInParent().toString());
        anotherGameCharacter.moveLeft();
        anotherGameCharacter.moveX();
        // suppose after the move, anotherGameCharacter will overlap with gameCharacter, with gameCharacter as being passive while anotherGameCharacter being active.
        // skip the box boundary checking and collision checking on both side.
        // nvm.
        // if (cA.getBoundsInParent().intersects(cB.getBoundsInParent())) {
        //      if(cA.collided(cB) == false) {
        //          cB.collided(cA);
        //      }
        // }

        // subject status know -> anotherGameCharacter collide into gameCharacter


        if (gameCharacter.getBoundsInParent().intersects(anotherGameCharacter.getBoundsInParent()))
            anotherGameCharacter.collided(gameCharacter);
        int caseAPosAfterCollisionCheck = anotherGameCharacter.getX();

        // hit from the left by gameCharacter
        int caseBPosBeforeMovedToOverlappedFromLeft = gameCharacter.getX();
        gameCharacter.moveRight();
        gameCharacter.moveX();
        if (anotherGameCharacter.getBoundsInParent().intersects(gameCharacter.getBoundsInParent()))
            gameCharacter.collided(anotherGameCharacter);
        int caseBPosAfterCollisionCheck = gameCharacter.getX();

//        System.out.println(caseAPosBeforeMovedToOverlappedFromRight + " " + caseAPosAfterCollisionCheck + " " + caseBPosBeforeMovedToOverlappedFromLeft + " " + caseBPosAfterCollisionCheck);

        assertTrue(caseAPosBeforeMovedToOverlappedFromRight == caseAPosAfterCollisionCheck && caseBPosBeforeMovedToOverlappedFromLeft == caseBPosAfterCollisionCheck);
    }

    @Test
    public void whenACharacterCollideFromTheTopWithAnotherOne_scoreIncrease() throws IllegalAccessException {
        GameCharacter anotherGameCharacter = new GameCharacter(1, gameCharacter.getX(), gameCharacter.getY() + characterHeightField.getInt(gameCharacter), "assets/Character2.png", 4, 4 ,1, 129,66, KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP);
        int scoreBeforeCollide = gameCharacter.getScore();
        gameCharacter.moveY();
        if (anotherGameCharacter.getBoundsInParent().intersects(gameCharacter.getBoundsInParent())) gameCharacter.collided(anotherGameCharacter);
        int scoreAfterCollide = gameCharacter.getScore();

        assertTrue(scoreBeforeCollide < scoreAfterCollide, "Score increased by 1 after stomping.");
    }
}
