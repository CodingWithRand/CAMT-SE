package se233.chapter2.view;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.FlowPane;
import se233.chapter2.controller.AllEventHandlers;

import java.time.LocalDateTime;

public class TopPane extends FlowPane {
    private Button refresh;
    private Button add;
    private Button base;
    private Label update;
    public TopPane() {
        this.setPadding(new Insets(10));
        this.setHgap(10);
        this.setPrefSize(640, 20);
        base = new Button("Base");
        add = new Button("Add");
        refresh = new Button("Refresh");
        base.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onBaseChange();
            }
        });
        refresh.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onRefresh();
            }
        });
        add.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onAdd();
            }
        });
        update = new Label();
        refreshPane();
        this.getChildren().addAll(base, refresh, add, update);
    }
    public void refreshPane() {
        update.setText(String.format("Last update: %s", LocalDateTime.now().toString()));
    }
}
