module se233.helloworld {
    requires javafx.controls;
    requires javafx.fxml;


    opens se233.helloworld to javafx.fxml;
    exports se233.helloworld;
}