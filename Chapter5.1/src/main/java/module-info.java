module se233.chapter5part1 {
    requires javafx.controls;
    requires javafx.fxml;

    opens se233.chapter5part1 to javafx.fxml;
    exports se233.chapter5part1;
}