module se233.chapter1 {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.xml;


    opens se233.chapter1 to javafx.fxml;
    exports se233.chapter1;
}