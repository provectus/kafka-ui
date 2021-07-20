package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import org.springframework.stereotype.Component;

@Component
public class SelectStrategy extends KsqlStatementStrategy {
    private final String requestPath = "/query";

    @Override
    public KsqlCommandResponse serializeResponse(JsonNode response) {
        System.out.println(response);
        return serializeQueryResponse(response);
    }

    @Override
    protected String getRequestPath() {
        return requestPath;
    }


    @Override
    protected String getTestRegExp() {
        return "select (.*) from (.*);";
    }
}
