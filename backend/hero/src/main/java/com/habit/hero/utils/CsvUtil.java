package com.habit.hero.utils;

import com.opencsv.CSVWriter;
import com.opencsv.ICSVWriter;
import lombok.experimental.UtilityClass;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@UtilityClass
public class CsvUtil {

    public static void writeHeader(CSVWriter writer, String... headers){
        writer.writeNext(headers);
    }

    public static void writeRow(CSVWriter writer, List<String> values) {
        writer.writeNext(values.toArray(new String[0]));
    }

    //Create CSVWriter from OutputStream (UTF-8)
    public static CSVWriter createWriter(OutputStream outputStream){
        return new CSVWriter(
                new OutputStreamWriter(outputStream, StandardCharsets.UTF_8),
                CSVWriter.DEFAULT_SEPARATOR,
                CSVWriter.NO_QUOTE_CHARACTER,
                CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                CSVWriter.DEFAULT_LINE_END
        );
    }

    //safely close writer
    public static void closeQuietly(CSVWriter writer){
        if (writer == null) return;
        try {
            writer.flush();
            writer.close();
        } catch (IOException ignore) {

        }
    }
}
