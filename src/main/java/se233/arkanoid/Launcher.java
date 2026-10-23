package se233.arkanoid;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class Launcher extends Application {
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/se233/arkanoid/main-menu.fxml"));
        Scene scene = new Scene(fxmlLoader.load());

        stage.setTitle("Retro Arkanoid Menu");
        stage.setScene(scene);
        stage.setResizable(false);
        stage.show();
    }
}
