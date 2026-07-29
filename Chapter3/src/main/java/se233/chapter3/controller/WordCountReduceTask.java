package se233.chapter3.controller;

import se233.chapter3.model.FileFreq;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collector;
import java.util.stream.Collectors;

public class WordCountReduceTask implements Callable<LinkedHashMap<String, List<FileFreq>>> {
    private Map<String, FileFreq>[] wordMap;
    public WordCountReduceTask(Map<String, FileFreq>[] wordMap) {
        this.wordMap = wordMap;
    }
    @Override
    public LinkedHashMap<String, List<FileFreq>> call() throws Exception {
        LinkedHashMap<String, List<FileFreq>> uniqueSets;
        List<Map<String, FileFreq>> wordMapList = new ArrayList<>(Arrays.asList(wordMap));
        uniqueSets = wordMapList.stream()
                .flatMap(m -> m.entrySet().stream())
                .collect(Collectors.groupingBy(
                        e -> e.getKey(),
                        Collector.of(
                                () -> new ArrayList<FileFreq>(),
                                (list, item) -> list.add(item.getValue()),
                                (current_list, new_items) -> {
                                    current_list.addAll(new_items);
                                    return current_list;
                                }
                        )
                ))
                .entrySet()
                .stream()
//                .sorted(Map.Entry.comparingByKey())
                .sorted((o1, o2) -> {
                    AtomicReference<Integer> totalFreq1 = new AtomicReference<>(0);
                    AtomicReference<Integer> totalFreq2 = new AtomicReference<>(0);
                    o1.getValue().forEach((o) -> {
                        totalFreq1.updateAndGet(v -> v + o.getFreq());
                    });
                    o2.getValue().forEach((o) -> {
                        totalFreq2.updateAndGet(v -> v + o.getFreq());
                    });

                    o1.getValue().sort((ff1, ff2) -> {
                        if(ff1.getFreq() > ff2.getFreq()) return -1;
                        else if(ff1.getFreq() < ff2.getFreq()) return 1;
                        else return 0;
                    });

                    o2.getValue().sort((ff1, ff2) -> {
                        if(ff1.getFreq() > ff2.getFreq()) return -1;
                        else if(ff1.getFreq() < ff2.getFreq()) return 1;
                        else return 0;
                    });

                    if(totalFreq1.get() > totalFreq2.get()) return -1;
                    else if (totalFreq1.get() < totalFreq2.get()) return 1;
                    else return 0;
                })
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue(), (v1, v2) -> v1, () -> new LinkedHashMap<>()));
        return uniqueSets;
    }
}
