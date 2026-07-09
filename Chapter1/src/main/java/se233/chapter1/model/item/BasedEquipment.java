package se233.chapter1.model.item;

import javafx.scene.input.DataFormat;

import java.io.Serializable;

public class BasedEquipment implements Serializable {
    private static int global_i = 0;
    public int i;
    public static final DataFormat DATA_FORMAT = new DataFormat("src.main.java.se233.chapter1.model.item.BasedEquipment");
    protected String name;
    protected String imgpath;
    public BasedEquipment() {
        this.i = global_i;
        global_i++;
    }
    public String getName() { return name; }
    public String getImagepath() { return imgpath; }
    public void setImagepath(String imgpath) { this.imgpath = imgpath; }
}
