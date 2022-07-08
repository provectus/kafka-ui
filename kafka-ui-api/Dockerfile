FROM alpine:3.15.0

RUN apk add --no-cache openjdk13-jre libc6-compat gcompat \
&& addgroup -S kafkaui && adduser -S kafkaui -G kafkaui

USER kafkaui

ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

ENV JAVA_OPTS=

EXPOSE 8080

CMD java $JAVA_OPTS -jar kafka-ui-api.jar
