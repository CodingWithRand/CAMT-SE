package se233.chapter3.model;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBufferedFile;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;

public class PdfDocument {
    private String name;
    private String filePath;
    private PDDocument document;
    private LinkedHashMap<String, List<FileFreq>> uniqueSets;
    public PdfDocument(String filePath) throws IOException {
        this.name = Paths.get(filePath).getFileName().toString();
        this.filePath = filePath;
        File pdfFile = new File(filePath);
        this.document = Loader.loadPDF(new RandomAccessReadBufferedFile(pdfFile));
    }

    public PDDocument getDocument() {
        return document;
    }

    public String getName() {
        return name;
    }

    public String getFilePath() {
        return filePath;
    }
}
