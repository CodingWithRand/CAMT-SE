package se233.chapter6.model;

import javafx.geometry.Point2D;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.chapter6.view.GameStage;

import java.util.Random;

public class Food {
    private static final Logger logger = LogManager.getLogger(Food.class);
    private Point2D position;
    private Random rn;
    private int point;

    public Food(Point2D position, int point) {
        this.point = point;
        this.rn = new Random();
        this.position = position;
    }
    public Food(Point2D position) {
        this.point = 1;
        this.rn = new Random();
        this.position = position;
    }
    public Food(int point) {
        this.point = point;
        this.rn = new Random();
        this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
    }
    public Food() {
        this.point = 1;
        this.rn = new Random();
        this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
    }
    public void respawn() {
        Point2D prev_position = this.position;
        do {
            this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
        } while (prev_position == this.position);
        logger.info("food: x:{} y:{}",this.position.getX(), this.position.getY());
    }
    public Point2D getPosition() {
        return position;
    }
    public int getFoodPoint() { return point; }
}
