package se233.chapter5part1.view;

import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class Score extends Pane {
    Label point;
    public Score(int x, int y) {
        point = new Label("0");
        setTranslateX(x);
        setTranslateY(y);
        point.setFont(Font.font("Verdana", FontWeight.BOLD, 30));
        point.setTextFill(Color.web("#FFF"));
        getChildren().addAll(point);
    }
    public void setPoint(int score) {
        this.point.setText(Integer.toString(score));
    }
}
