package com.provectus.kafka.ui.utils.qaseIO;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;

public class MethodNameUtils {

    public static String formatTestCaseTitle(String testMethodName) {
        String[] split = StringUtils.splitByCharacterTypeCamelCase(testMethodName);

        String[] name = Arrays.stream(split).map(String::toLowerCase).toArray(String[]::new);

        String[] subarray = ArrayUtils.subarray(name, 1, name.length);

        ArrayList<String> stringList = new ArrayList<>(Arrays.asList(subarray));
        stringList.add(0, StringUtils.capitalize(name[0]));

        return StringUtils.join(stringList, " ");
    }
}
