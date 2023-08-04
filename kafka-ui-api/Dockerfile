#FROM azul/zulu-openjdk-alpine:17-jre-headless
FROM azul/zulu-openjdk-alpine@sha256:a36679ac0d28cb835e2a8c00e1e0d95509c6c51c5081c7782b85edb1f37a771a

RUN apk add --no-cache \
    # snappy codec
    gcompat \
    # configuring timezones
    tzdata
RUN addgroup -S kafkaui && adduser -S kafkaui -G kafkaui

# creating folder for dynamic config usage (certificates uploads, etc)
RUN mkdir /etc/kafkaui/
RUN chown kafkaui /etc/kafkaui

USER kafkaui

ARG JAR_FILE
COPY "/target/${JAR_FILE}" "/kafka-ui-api.jar"

ENV JAVA_OPTS=

EXPOSE 8080

# see JmxSslSocketFactory docs to understand why add-opens is needed
CMD java --add-opens java.rmi/javax.rmi.ssl=ALL-UNNAMED  $JAVA_OPTS -jar kafka-ui-api.jar
