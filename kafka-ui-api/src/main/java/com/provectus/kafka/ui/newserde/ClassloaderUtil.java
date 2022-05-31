package com.provectus.kafka.ui.newserde;

class ClassloaderUtil {

  static ClassLoader compareAndSwapLoaders(ClassLoader loader) {
    ClassLoader current = Thread.currentThread().getContextClassLoader();
    if (!current.equals(loader)) {
      Thread.currentThread().setContextClassLoader(loader);
    }
    return current;
  }
}
