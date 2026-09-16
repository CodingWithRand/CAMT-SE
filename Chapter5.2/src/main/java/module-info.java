module se233.chapter5part2 {
    requires javafx.controls;
    requires javafx.fxml;

    opens se233.chapter5part2 to javafx.fxml;
    exports se233.chapter5part2;
}