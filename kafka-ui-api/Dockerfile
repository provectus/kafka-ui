FROM alpine:latest
RUN apk add openjdk13-jre
VOLUME /tmp
ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

ENV JAVA_OPTS=

EXPOSE 8080

CMD java $JAVA_OPTS -jar kafka-ui-api.jar
