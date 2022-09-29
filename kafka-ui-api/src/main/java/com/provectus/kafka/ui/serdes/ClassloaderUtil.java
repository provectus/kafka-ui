package com.provectus.kafka.ui.serdes;

class ClassloaderUtil {

  static ClassLoader compareAndSwapLoaders(ClassLoader loader) {
    ClassLoader current = Thread.currentThread().getContextClassLoader();
    if (!current.equals(loader)) {
      Thread.currentThread().setContextClassLoader(loader);
    }
    return current;
  }
}
