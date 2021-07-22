FROM adoptopenjdk/openjdk13:x86_64-alpine-jre-13.0.2_8
VOLUME /tmp
ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

EXPOSE 8080
CMD java -jar kafka-ui-api.jar