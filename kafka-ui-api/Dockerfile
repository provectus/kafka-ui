FROM openjdk:13
VOLUME /tmp
ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

EXPOSE 8080
CMD java -jar kafka-ui-api.jar