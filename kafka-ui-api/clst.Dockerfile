FROM openjdk:13.0.2-jdk-buster

RUN addgroup --system kafkaui && adduser --system kafkaui --ingroup kafkaui

USER kafkaui

ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

ENV JAVA_OPTS=

EXPOSE 8080

CMD java $JAVA_OPTS -jar kafka-ui-api.jar