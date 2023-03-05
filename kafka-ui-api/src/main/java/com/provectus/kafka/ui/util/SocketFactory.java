package com.provectus.kafka.ui.util;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import javax.net.ssl.SSLContext;
import lombok.SneakyThrows;

public class SocketFactory extends javax.net.ssl.SSLSocketFactory {

  private final javax.net.ssl.SSLSocketFactory defaultSocketFactory;

  private final static ThreadLocal<KafkaCluster> SSL_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();


  @SneakyThrows
  public SocketFactory() {
    this.defaultSocketFactory = SSLContext.getDefault().getSocketFactory();
  }

  private SocketFactory createFactoryFromThreaLocal(){
    return null;
  }

  @Override
  public String[] getDefaultCipherSuites() {
    return defaultSocketFactory.getDefaultCipherSuites();
  }

  @Override
  public String[] getSupportedCipherSuites() {
    return defaultSocketFactory.getSupportedCipherSuites();
  }

  @Override
  public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
    return defaultSocketFactory.createSocket(s, host, port, autoClose);
  }

  @Override
  public Socket createSocket(String host, int port) throws IOException, UnknownHostException {
    return defaultSocketFactory.createSocket(host, port);
  }

  @Override
  public Socket createSocket(String host, int port, InetAddress localHost, int localPort)
      throws IOException, UnknownHostException {
    return defaultSocketFactory.createSocket(host, port, localHost, localPort);
  }

  @Override
  public Socket createSocket(InetAddress host, int port) throws IOException {
    return defaultSocketFactory.createSocket(host, port);
  }

  @Override
  public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
      throws IOException {
    return defaultSocketFactory.createSocket(address, port, localAddress, localPort);
  }
}
