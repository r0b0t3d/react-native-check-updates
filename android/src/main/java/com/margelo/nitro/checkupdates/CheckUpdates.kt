package com.margelo.nitro.checkupdates
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class CheckUpdates : HybridCheckUpdatesSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
