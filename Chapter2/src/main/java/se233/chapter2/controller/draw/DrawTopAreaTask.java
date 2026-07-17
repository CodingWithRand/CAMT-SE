package se233.chapter2.controller.draw;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import se233.chapter2.model.Currency;

import java.util.concurrent.Callable;

public class DrawTopAreaTask implements Callable<Pane> {
    private Currency currency;
    private Button unwatch;
    private Button watch;
    private Button delete;
    public DrawTopAreaTask(Currency currency, Button unwatch, Button watch, Button delete) {
        this.currency = currency;
        this.unwatch = unwatch;
        this.watch = watch;
        this.delete = delete;
    }

    @Override
    public Pane call() throws Exception {
        HBox topArea = new HBox(10);
        topArea.setPadding(new Insets(5));
        topArea.getChildren().addAll(unwatch, watch, delete);
        ((HBox) topArea).setAlignment(Pos.CENTER_RIGHT);
        return topArea;
    }
}
