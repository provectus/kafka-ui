package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Component;

@Component
public class ListTopicsStrategy extends KsqlStatementStrategy {
    private final String requestPath = "/ksql";

    @Override
    public Object serializeResponse(String response) {
        JsonArray jsonArray = JsonParser.parseString(response).getAsJsonArray();
        return jsonArray.get(0).getAsJsonObject().get("topics").getAsJsonArray().toString();
    }

    @Override
    public boolean test(String sql) {
        return sql.trim().toLowerCase().matches("(list|show) topics;");
    }

    @Override
    protected String getRequestPath() {
        return requestPath;
    }
}
