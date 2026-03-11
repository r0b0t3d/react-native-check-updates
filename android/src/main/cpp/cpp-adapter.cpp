#include <jni.h>
#include "inappupdatesOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::inappupdates::registerAllNatives();
  });
}
