package se233.chapter2.view;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import se233.chapter2.controller.AllEventHandlers;
import se233.chapter2.controller.draw.DrawCurrencyInfoTask;
import se233.chapter2.controller.draw.DrawGraphTask;
import se233.chapter2.controller.draw.DrawTopAreaTask;
import se233.chapter2.model.Currency;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;

public class CurrencyPane extends BorderPane {
    private Currency currency;
    private Button unwatch;
    private Button watch;
    private Button delete;
    public CurrencyPane(Currency currency) {
        this.unwatch = new Button("Unwatch");
        this.watch = new Button("Watch");
        this.delete = new Button("Delete");
        this.unwatch.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onUnwatch(currency.getShortCode());
            }
        });
        this.watch.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onWatch(currency.getShortCode());
            }
        });
        this.delete.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                AllEventHandlers.onDelete(currency.getShortCode());
            }
        });
        this.setPadding(new Insets(0));
        this.setPrefSize(640, 300);
        this.setStyle("-fx-border-color: black");
        try {
            this.refreshPane(currency);
        } catch (ExecutionException e) {
            System.out.println("Encountered and execution exception");
        } catch (InterruptedException e) {
            System.out.println("Encountered an interupted exception.");
        }
    }
    public void refreshPane(Currency currency) throws ExecutionException, InterruptedException {
        this.currency = currency;
        FutureTask futureGraphTask = new FutureTask<VBox>(new DrawGraphTask(currency));
        FutureTask futureCurrencyTask = new FutureTask<Pane>(new DrawCurrencyInfoTask(currency));
        FutureTask futureTopTask = new FutureTask<Pane>(new DrawTopAreaTask(currency, this.watch, this.unwatch, this.delete));
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(futureGraphTask);
        executor.execute(futureCurrencyTask);
        executor.execute(futureTopTask);
        VBox currencyGraph = (VBox) futureGraphTask.get();
        Pane currencyInfo = (Pane) futureCurrencyTask.get();
        Pane topArea = (Pane) futureTopTask.get();
        this.setTop(topArea);
        this.setLeft(currencyInfo);
        this.setCenter(currencyGraph);
    }
}
