FROM azul/zulu-openjdk-alpine:17

RUN addgroup -S kafkaui && adduser -S kafkaui -G kafkaui

USER kafkaui

ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

ENV JAVA_OPTS=

EXPOSE 8080

CMD java $JAVA_OPTS -jar kafka-ui-api.jar
