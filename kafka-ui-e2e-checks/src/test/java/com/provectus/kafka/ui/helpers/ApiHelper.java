package com.provectus.kafka.ui.helpers;

import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.steps.kafka.KafkaSteps;
import lombok.SneakyThrows;
import net.minidev.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ApiHelper {
    int partitions = 1;
    short replicationFactor = 1;
    String newTopic = "new-topic";
    @SneakyThrows
    private void sendRequest(String method, String additionalURL, JSONObject jsonObject){
        URL url = new URL(TestConfiguration.BASE_URL+additionalURL);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setDoOutput(true);
        con.setDoInput(true);
        con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        con.setRequestProperty("Accept", "application/json");
        switch (method) {
            case "POST":
                con.setRequestMethod("POST");
                OutputStream os = con.getOutputStream();
                os.write(jsonObject.toString().getBytes("UTF-8"));
                os.close();
                break;
            case "DELETE":
                con.setRequestMethod("DELETE");
                con.getResponseMessage();
                break;
        }
        assertTrue(con.getResponseCode()==200);
        InputStream in = new BufferedInputStream(con.getInputStream());
        String result = org.apache.commons.io.IOUtils.toString(in, "UTF-8");
        in.close();
        con.disconnect();
    }


    @SneakyThrows
    public void createTopic(String clusterName, String topicName) {
        JSONObject topic = new JSONObject();
        topic.put("name",topicName);
        topic.put("partitions",partitions);
        topic.put("replicationFactor",replicationFactor);
        sendRequest("POST","api/clusters/"+clusterName+"/topics",topic);

    }

    @SneakyThrows
    public void deleteTopic(String clusterName, String topicName) {
        sendRequest("DELETE","api/clusters/"+clusterName+"/topics/"+topicName,null);
    }

}
