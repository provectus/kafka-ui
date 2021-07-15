package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.provectus.kafka.ui.model.KsqlCommand;

public abstract class KsqlStatementStrategy {
    protected String host = null;
    protected KsqlCommand ksqlCommand = null;

    public String getUri() {
        if (this.host != null) { return this.host + this.getRequestPath(); }
        return null;
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

    public abstract Object serializeResponse(String response);

    public abstract boolean test(String sql);

    protected abstract String getRequestPath();
}
