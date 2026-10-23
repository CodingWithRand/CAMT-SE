module se233.arkanoid {
    requires javafx.controls;
    requires javafx.fxml;
    requires org.apache.logging.log4j;

    opens se233.arkanoid to javafx.fxml;
    exports se233.arkanoid;
    exports se233.arkanoid.controller;
    opens se233.arkanoid.controller to javafx.fxml;
    exports se233.arkanoid.view;
    opens se233.arkanoid.view to javafx.fxml;
}