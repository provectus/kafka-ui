package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.model.KsqlResponseTable;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public abstract class KsqlStatementStrategy {
    protected String host = null;
    protected KsqlCommand ksqlCommand = null;

    public String getUri() {
        if (this.host != null) {
            return this.host + this.getRequestPath();
        }
        return null;
    }

    public boolean test(String sql) {
        return sql.trim().toLowerCase().matches(getTestRegExp());
    }

    public KsqlStatementStrategy host(String host) {
        this.host = host;
        return this;
    }

    public KsqlCommand getKsqlCommand() {
        return ksqlCommand;
    }

    public KsqlStatementStrategy ksqlCommand(KsqlCommand ksqlCommand) {
        this.ksqlCommand = ksqlCommand;
        return this;
    }

    protected KsqlResponseTable getKsqlTable(JsonNode node) {
        KsqlResponseTable table = new KsqlResponseTable();
        table.headers(new ArrayList<>()).rows(new ArrayList<>());
        if (node.size() > 0) {
            List<String> keys = getTableHeaders(node.get(0));
            List<List<String>> rows = getTableRows(node, keys);
            table.headers(keys).rows(rows);
        }
        return table;
    }

    protected KsqlResponseTable serializeTableResponse(JsonNode response, String path) {
        if (response.isArray() && response.size() > 0) {
            JsonNode first = response.get(0);
            JsonNode items = first.path(path);
            return this.getKsqlTable(items);
        }
        throw new InternalError("Invalid data format");
    }

    private List<List<String>> getTableRows(JsonNode node, List<String> keys) {
        if (node.isArray() && node.size() > 0) {
            return StreamSupport.stream(node.spliterator(), false)
                    .map(row -> keys.stream()
                            .map(header -> row.get(header).asText())
                            .collect(Collectors.toList())
                    )
                    .collect(Collectors.toList());
        }
        // TODO: handle
        throw new InternalError("Invalid data format");
    }

    private List<String> getTableHeaders(JsonNode node) {
        if (node.isObject()) {
            return StreamSupport.stream(
                    Spliterators.spliteratorUnknownSize(node.fieldNames(), Spliterator.ORDERED), false
            ).collect(Collectors.toList());
        }
        // TODO: handle
        throw new InternalError("Invalid data format");
    }

    public abstract KsqlResponseTable serializeResponse(JsonNode response);

    protected abstract String getRequestPath();

    protected abstract String getTestRegExp();
}
