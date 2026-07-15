package se233.chapter2.controller;

import javafx.scene.control.Alert;
import se233.chapter2.Launcher;
import se233.chapter2.model.Currency;

import java.util.List;
import java.util.concurrent.Callable;

public class WatchTask implements Callable<Void> {
    @Override
    public Void call() {
        List<Currency> allCurrency = Launcher.getCurrencyList();
        String found = "";
        for(int i = 0; i < allCurrency.size(); i++) {
            if (allCurrency.get(i).getWatchRate()!= 0 && allCurrency.get(i).getWatchRate() > allCurrency.get(i).getCurrency().getRate())  {
                if(found.equals("")) {
                    found = allCurrency.get(i).getShortCode();
                } else {
                    found = found + " and " + allCurrency.get(i).getShortCode();
                }
            }
        }
        if(!found.equals("")) {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle(null);
            alert.setHeaderText(null);
            if(found.length() > 3) {
                alert.setContentText(String.format("%s have become lower than the watch rate!", found));
            } else {
                alert.setContentText(String.format("%s has become lower than the watch rates!", found));
            }
            alert.showAndWait();
        }
        return null;
    }
}
