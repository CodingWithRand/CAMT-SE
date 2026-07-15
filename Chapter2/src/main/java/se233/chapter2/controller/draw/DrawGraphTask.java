package se233.chapter2.controller.draw;

import javafx.geometry.Insets;
import javafx.scene.chart.CategoryAxis;
import javafx.scene.chart.LineChart;
import javafx.scene.chart.NumberAxis;
import javafx.scene.chart.XYChart;
import javafx.scene.layout.VBox;
import se233.chapter2.model.Currency;
import se233.chapter2.model.CurrencyEntity;

import java.util.concurrent.Callable;

public class DrawGraphTask implements Callable<VBox> {
    Currency currency;
    public DrawGraphTask(Currency currency) {
        this.currency = currency;
    }
    @Override
    public VBox call() throws Exception {
        VBox graphPane = new VBox(10);
        graphPane.setPadding(new Insets(0, 25, 5, 25));
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis yAxis = new NumberAxis();
        yAxis.setAutoRanging(true);
        LineChart lineChart = new LineChart(xAxis, yAxis);
        lineChart.setLegendVisible(false);
        if (this.currency != null) {
            XYChart.Series series = new XYChart.Series();
            double minY = Double.MAX_VALUE;
            double maxY = Double.MIN_VALUE;
            for (CurrencyEntity c: currency.getHistorical()) {
                series.getData().add(new XYChart.Data(c.getTimestamp(), c.getRate()));
                if(c.getRate() > maxY) maxY = c.getRate();
                if(c.getRate() < minY) minY = c.getRate();
            }
            yAxis.setAutoRanging(false);
            yAxis.setLowerBound(minY-(maxY-minY)/2);
            yAxis.setUpperBound(maxY+(maxY-minY)/2);
            yAxis.setTickUnit((maxY-minY)/2);
            lineChart.getData().add(series);
        }
        graphPane.getChildren().add(lineChart);
        return graphPane;
    }
}
