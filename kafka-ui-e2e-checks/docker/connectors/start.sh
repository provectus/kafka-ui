#! /bin/bash
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' kafka-connect0:8083)" != "200" ]]
    do sleep 5
done

echo "\n --------------Creating connectors..."
for filename in /connectors/*.json; do
  curl -X POST -H "Content-Type: application/json" -d @$filename http://kafka-connect0:8083/connectors
done
