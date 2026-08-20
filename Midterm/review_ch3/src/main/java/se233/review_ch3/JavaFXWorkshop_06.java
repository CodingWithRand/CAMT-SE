/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package se233.review_ch3;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 *
 * @author mhrimaz
 */
public class JavaFXWorkshop_06 extends Application {
    
    @Override
    public void start(Stage stage) throws Exception {
        // Load UI from fxml UI structure file, no more UI code in "views" folder.
        // You can be a hardcore and code the fxml yourself, or use SceneBuilder program to drag and drop components, easily arrange, and configure them (no-code)
        Parent root = FXMLLoader.load(getClass().getResource("FXMLDocument.fxml"));
        
        Scene scene = new Scene(root);
        
        stage.setScene(scene);
        stage.show();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }
    
}
