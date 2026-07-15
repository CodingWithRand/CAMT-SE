package se233.chapter2.controller;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import se233.chapter2.model.CurrencyEntity;

import javax.print.DocFlavor;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.charset.MalformedInputException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

public class FetchData {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static List<CurrencyEntity> fetchRange(String symbol, int N) {
        String dateEnd = LocalDate.now().format(formatter);
        String dateStart = LocalDate.now().minusDays(N).format(formatter);
        String urlStr = String.format("https://cmu.to/SE233currencyapi?base=THB&symbol=%s&start_date=%s&end_date=%s", symbol, dateStart, dateEnd);
        System.out.println(urlStr);
        List<CurrencyEntity> histList = new ArrayList<>();
        try {
            String retrievedJson = IOUtils.toString(new URL(urlStr), Charset.defaultCharset());
            JSONObject jsonOBJ = new JSONObject(retrievedJson).getJSONObject("rates");
            Iterator keysToCopyIterator = jsonOBJ.keys();
            while(keysToCopyIterator.hasNext()) {
                String key = (String) keysToCopyIterator.next();
                Double rate = Double.parseDouble(jsonOBJ.get(key).toString());
                histList.add(new CurrencyEntity(rate, key));
            }
            histList.sort(new Comparator<CurrencyEntity>() {
                @Override
                public int compare(CurrencyEntity o1, CurrencyEntity o2) {
                    return o1.getTimestamp().compareTo(o2.getTimestamp());
                }
            });
        } catch (MalformedInputException e) {
            System.err.println("Encounter a Malformed Url exception");
        } catch (IOException e) {
            System.err.println("Encounter an IO exception");
        }
        return histList;
    }
}
