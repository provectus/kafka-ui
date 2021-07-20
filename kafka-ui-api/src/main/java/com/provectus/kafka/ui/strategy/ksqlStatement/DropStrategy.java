package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import org.springframework.stereotype.Component;


@Component
public class DropStrategy extends KsqlStatementStrategy {
    private final String requestPath = "/ksql";
    private final String responseValueKey = "commandStatus";

    @Override
    public KsqlCommandResponse serializeResponse(JsonNode response) {
        return serializeMessageResponse(response, responseValueKey);
    }

    @Override
    protected String getRequestPath() {
        return requestPath;
    }

    @Override
    protected String getTestRegExp() {
        return "drop (table|stream) (.*);";
    }
}
