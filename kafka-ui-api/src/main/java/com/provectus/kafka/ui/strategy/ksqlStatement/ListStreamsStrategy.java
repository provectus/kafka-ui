package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;


@Component
public class ListStreamsStrategy extends KsqlStatementStrategy {
    private final String requestPath = "/ksql";

    @SneakyThrows
    @Override
    public Object serializeResponse(String response) {
        JsonArray jsonArray = JsonParser.parseString(response).getAsJsonArray();
        return jsonArray.get(0).getAsJsonObject().get("streams").getAsJsonArray().toString();
    }

    @Override
    public boolean test(String sql) {
        return sql.trim().toLowerCase().matches("list streams;");
    }

    @Override
    protected String getRequestPath() {
        return requestPath;
    }
}
