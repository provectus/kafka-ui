package com.provectus.kafka.ui.manualSuite.suite;

import com.provectus.kafka.ui.manualSuite.BaseManual;
import io.qase.api.annotation.QaseId;
import org.testng.SkipException;
import org.testng.annotations.Test;

public class DataMaskingTests extends BaseManual {

    @QaseId(262)
    @Test
    public void testCaseA() {
        throw new SkipException("Skip test exception");
    }

    @QaseId(264)
    @Test
    public void testCaseB() {
        throw new SkipException("Skip test exception");
    }

    @QaseId(265)
    @Test
    public void testCaseC() {
        throw new SkipException("Skip test exception");
    }
}
