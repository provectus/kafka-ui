ARG image
FROM ${image}

## Install connectors
RUN echo "\nInstalling JDBC connector...\n" && confluent-hub install --no-prompt confluentinc/kafka-connect-jdbc:latest