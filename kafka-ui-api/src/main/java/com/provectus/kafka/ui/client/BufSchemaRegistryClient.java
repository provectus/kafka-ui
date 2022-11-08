package com.provectus.kafka.ui.client;

import com.google.protobuf.DescriptorProtos.FileDescriptorProto;
import com.google.protobuf.DescriptorProtos.FileDescriptorSet;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.Descriptors.DescriptorValidationException;
import com.google.protobuf.Descriptors.FileDescriptor;
import com.google.protobuf.InvalidProtocolBufferException;
import com.provectus.kafka.ui.proto.gen.buf.alpha.image.v1.Image;
import com.provectus.kafka.ui.proto.gen.buf.alpha.registry.v1alpha1.GetImageRequest;
import com.provectus.kafka.ui.proto.gen.buf.alpha.registry.v1alpha1.GetImageResponse;
import com.provectus.kafka.ui.proto.gen.buf.alpha.registry.v1alpha1.ImageServiceGrpc;
import io.grpc.Channel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.Metadata;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.MetadataUtils;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BufSchemaRegistryClient {
  private ImageServiceGrpc.ImageServiceBlockingStub bufClient;

  public BufSchemaRegistryClient(String host, int port, String apiKey) {
    this(ManagedChannelBuilder.forAddress(String.format("api.%s", host), port).useTransportSecurity(), apiKey);
  }

  public BufSchemaRegistryClient(ManagedChannelBuilder<?> channelBuilder, String apiKey) {
    Channel channel = channelBuilder.build();
    bufClient = ImageServiceGrpc.newBlockingStub(channel);

    Metadata headers = new Metadata();
    Metadata.Key<String> bearerKey = Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER);
    headers.put(bearerKey, String.format("Bearer %s", apiKey));

    bufClient = bufClient.withInterceptors(MetadataUtils.newAttachHeadersInterceptor(headers));
  }

  public List<FileDescriptor> getFileDescriptors(String owner, String repo, String reference) {
    Image image;

    try {
      image = getImage(owner, repo, reference);
    } catch (StatusRuntimeException e) {
      log.error("Failed to get image", e);
      return new ArrayList<>();
    }

    FileDescriptorSet fileDescriptorSet;
    try {
      fileDescriptorSet = FileDescriptorSet.parseFrom(image.toByteArray());
    } catch (InvalidProtocolBufferException e) {
      log.error("Failed to parse Image into FileDescriptorSet", e);
      return new ArrayList<>();
    }

    Map<String, FileDescriptorProto> descriptorProtoIndex = new HashMap<>();

    for (int i = 0; i < fileDescriptorSet.getFileCount(); i++) {
      FileDescriptorProto p = fileDescriptorSet.getFile(i);
      descriptorProtoIndex.put(p.getName(), p);
    }

    final Map<String, FileDescriptor> descriptorCache = new HashMap<>();

    final List<FileDescriptor> allFileDescriptors = new ArrayList<>();
    try {
      for (int i = 0; i < fileDescriptorSet.getFileCount(); i++) {
        FileDescriptor desc = descriptorFromProto(fileDescriptorSet.getFile(i), descriptorProtoIndex, descriptorCache);
        allFileDescriptors.add(desc);
      }
    } catch (DescriptorValidationException e) {
      log.error("Failed to create dependencies map", e);
    }

    return allFileDescriptors;
  }

  public Optional<Descriptor> getDescriptor(String owner, String repo, String reference,
      String fullyQualifiedTypeName) {
    List<String> parts = Arrays.asList(fullyQualifiedTypeName.split("\\."));

    if (parts.isEmpty()) {
      log.warn("Cannot get package name and type name from", fullyQualifiedTypeName);
      return Optional.empty();
    }

    String packageName = String.join(".", parts.subList(0, parts.size() - 1));
    String typeName = parts.get(parts.size() - 1);

    log.info("Looking for type {} in package {}", typeName, packageName);

    List<FileDescriptor> fileDescriptors = getFileDescriptors(owner, repo, reference);

    return Optional.ofNullable(fileDescriptors
        .stream()
        .filter(f -> f.getPackage().equals(packageName))
        .map(f -> f.findMessageTypeByName(typeName))
        .filter(Objects::nonNull)
        .findFirst()
        .orElse(null));
  }

  private Image getImage(String owner, String repo, String reference) throws StatusRuntimeException {
    return bufClient.getImage(GetImageRequest.newBuilder()
        .setOwner(owner)
        .setRepository(repo)
        .setReference(reference)
        .build())
        .getImage();
  }

  // From
  // https://github.com/grpc-swagger/grpc-swagger/blob/master/grpc-swagger-core/src/main/java/io/grpc/grpcswagger/grpc/ServiceResolver.java#L118.
  private FileDescriptor descriptorFromProto(
      FileDescriptorProto descriptorProto,
      Map<String, FileDescriptorProto> descriptorProtoIndex,
      Map<String, FileDescriptor> descriptorCache) throws DescriptorValidationException {
    // First, check the cache.
    String descriptorName = descriptorProto.getName();
    if (descriptorCache.containsKey(descriptorName)) {
      return descriptorCache.get(descriptorName);
    }

    // Then, fetch all the required dependencies recursively.
    List<FileDescriptor> dependencies = new ArrayList<>();
    for (String dependencyName : descriptorProto.getDependencyList()) {
      if (!descriptorProtoIndex.containsKey(dependencyName)) {
        throw new IllegalArgumentException("Could not find dependency: " + dependencyName);
      }
      FileDescriptorProto dependencyProto = descriptorProtoIndex.get(dependencyName);
      dependencies.add(descriptorFromProto(dependencyProto, descriptorProtoIndex, descriptorCache));
    }

    // Finally, construct the actual descriptor.
    FileDescriptor[] empty = new FileDescriptor[0];
    return FileDescriptor.buildFrom(descriptorProto, dependencies.toArray(empty));
  }
}