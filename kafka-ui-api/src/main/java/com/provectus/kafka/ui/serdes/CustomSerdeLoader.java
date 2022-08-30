package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.Serde;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import lombok.Value;


class CustomSerdeLoader {

  @Value
  static class CustomSerde {
    Serde serde;
    ClassLoader classLoader;
  }

  // serde location -> classloader
  private final Map<Path, ClassLoader> classloaders = new ConcurrentHashMap<>();

  @SneakyThrows
  CustomSerde loadAndConfigure(String className,
                               String filePath,
                               PropertyResolver serdeProps,
                               PropertyResolver clusterProps,
                               PropertyResolver globalProps) {
    Path locationPath = Path.of(filePath);
    var serdeClassloader = createClassloader(locationPath);
    var origCL = ClassloaderUtil.compareAndSwapLoaders(serdeClassloader);
    try {
      var serdeClass = serdeClassloader.loadClass(className);
      var serde = (Serde) serdeClass.getDeclaredConstructor().newInstance();
      serde.configure(serdeProps, clusterProps, globalProps);
      return new CustomSerde(serde, serdeClassloader);
    } finally {
      ClassloaderUtil.compareAndSwapLoaders(origCL);
    }
  }

  private static boolean isArchive(Path path) {
    String archivePath = path.toString().toLowerCase();
    return Files.isReadable(path)
        && Files.isRegularFile(path)
        && (archivePath.endsWith(".jar") || archivePath.endsWith(".zip"));
  }

  @SneakyThrows
  private static List<URL> findArchiveFiles(Path location) {
    if (isArchive(location)) {
      return List.of(location.toUri().toURL());
    }
    if (Files.isDirectory(location)) {
      List<URL> archiveFiles = new ArrayList<>();
      try (var files = Files.walk(location)) {
        var paths = files.filter(CustomSerdeLoader::isArchive).collect(Collectors.toList());
        for (Path path : paths) {
          archiveFiles.add(path.toUri().toURL());
        }
      }
      return archiveFiles;
    }
    return List.of();
  }

  private ClassLoader createClassloader(Path location) {
    if (!Files.exists(location)) {
      throw new IllegalStateException("Location does not exist");
    }
    var archives = findArchiveFiles(location);
    if (archives.isEmpty()) {
      throw new IllegalStateException("No archive files were found");
    }
    // we assume that location's content does not change during serdes creation
    // so, we can reuse already created classloaders
    return classloaders.computeIfAbsent(location, l ->
        AccessController.doPrivileged(
            (PrivilegedAction<URLClassLoader>) () ->
                new ChildFirstClassloader(
                    archives.toArray(URL[]::new),
                    CustomSerdeLoader.class.getClassLoader())));
  }

  //---------------------------------------------------------------------------------

  // This Classloader first tries to load classes by itself. If class not fount
  // search is propagated to parent (this is opposite to how usual classloaders work)
  private static class ChildFirstClassloader extends URLClassLoader {

    private static final String JAVA_PACKAGE_PREFIX = "java.";

    ChildFirstClassloader(URL[] urls, ClassLoader parent) {
      super(urls, parent);
    }

    @Override
    protected synchronized Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
      // first check whether it's a system class, delegate to the system loader
      if (name.startsWith(JAVA_PACKAGE_PREFIX)) {
        return findSystemClass(name);
      }
      Class<?> loadedClass = findLoadedClass(name);
      if (loadedClass == null) {
        try {
          // start searching from current classloader
          loadedClass = findClass(name);
        } catch (ClassNotFoundException e) {
          // if not found - going to parent
          loadedClass = super.loadClass(name, resolve);
        }
      }
      if (resolve) {
        resolveClass(loadedClass);
      }
      return loadedClass;
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      List<URL> allRes = new LinkedList<>();
      Enumeration<URL> thisRes = findResources(name);
      if (thisRes != null) {
        while (thisRes.hasMoreElements()) {
          allRes.add(thisRes.nextElement());
        }
      }
      // then try finding resources from parent classloaders
      Enumeration<URL> parentRes = super.findResources(name);
      if (parentRes != null) {
        while (parentRes.hasMoreElements()) {
          allRes.add(parentRes.nextElement());
        }
      }
      return new Enumeration<>() {
        final Iterator<URL> it = allRes.iterator();

        @Override
        public boolean hasMoreElements() {
          return it.hasNext();
        }

        @Override
        public URL nextElement() {
          return it.next();
        }
      };
    }

    @Override
    public URL getResource(String name) {
      URL res = findResource(name);
      if (res == null) {
        res = super.getResource(name);
      }
      return res;
    }
  }

}
