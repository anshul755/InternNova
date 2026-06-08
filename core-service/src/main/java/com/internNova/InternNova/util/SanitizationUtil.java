package com.internNova.InternNova.util;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public final class SanitizationUtil {

    private SanitizationUtil() {
    }

    public static String sanitizePlainText(String input) {
        if (input == null) {
            return "";
        }
        String stripped = input.replaceAll("<[^>]*>", "");
        stripped = stripped.replaceAll("[*_`#]", "");
        return stripped.trim();
    }

    public static List<String> sanitizeStringList(List<String> items) {
        if (items == null) {
            return Collections.emptyList();
        }
        return items.stream()
                .map(SanitizationUtil::sanitizePlainText)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
