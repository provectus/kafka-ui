package com.provectus.kafka.ui.config;

import io.netty.channel.ChannelOption;
import io.netty.channel.socket.nio.NioChannelOption;
import jdk.net.ExtendedSocketOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.ReactiveOAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.WebClientReactiveAuthorizationCodeTokenResponseClient;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class SecurityAuthConfig {

  public static class ConfigurableReactiveAuthClient extends WebClientReactiveAuthorizationCodeTokenResponseClient {

    public ConfigurableReactiveAuthClient(HttpClient httpClient) {
      var connector = new ReactorClientHttpConnector(httpClient);
      setWebClient(WebClient.builder().clientConnector(connector).build());
    }
  }

  @Bean
  public ReactiveOAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> authClient(
      HttpClientProperties properties) {
    HttpClient httpClient = httpClientWithProperties(properties);
    return new ConfigurableReactiveAuthClient(httpClient);
  }

  private HttpClient httpClientWithProperties(HttpClientProperties properties) {
    HttpClient httpClient = HttpClient.create();
    Integer connectTimeoutMillis = properties.getConnectTimeoutMillis();
    Boolean socketKeepAlive = properties.getSocketKeepAlive();
    if (connectTimeoutMillis != null) {
      httpClient = httpClient.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeoutMillis);
    }
    Integer tcpKeepIdle = properties.getTcpKeepIdle();
    Integer tcpKeepInterval = properties.getTcpKeepInterval();

    if (socketKeepAlive != null) {
      httpClient = httpClient.option(ChannelOption.SO_KEEPALIVE, socketKeepAlive);
    }
    if (tcpKeepIdle != null) {
      httpClient = httpClient.option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPIDLE), tcpKeepIdle);
    }
    if (tcpKeepInterval != null) {
      httpClient = httpClient.option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPINTERVAL), tcpKeepInterval);
    }
    Integer tcpKeepCount = properties.getTcpKeepCount();
    if (tcpKeepCount != null) {
      httpClient = httpClient.option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPCOUNT), tcpKeepCount);
    }
    return httpClient;
  }

}
