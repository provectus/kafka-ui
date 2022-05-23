ARG image
FROM ${image}

## Install connectors
RUN echo "\nInstalling all required connectors...\n" && \
confluent-hub install --no-prompt confluentinc/kafka-connect-jdbc:latest && \
confluent-hub install --no-prompt confluentinc/kafka-connect-github:latest && \
confluent-hub install --no-prompt confluentinc/kafka-connect-s3:latest