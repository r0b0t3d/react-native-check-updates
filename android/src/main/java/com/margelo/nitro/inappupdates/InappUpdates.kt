package com.margelo.nitro.inappupdates

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import androidx.activity.result.contract.ActivityResultContracts
import com.facebook.proguard.annotations.DoNotStrip
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.tasks.await

@DoNotStrip
class InappUpdates : HybridInappUpdatesSpec(), Application.ActivityLifecycleCallbacks {
  private val context = NitroModules.applicationContext!!
  private val appUpdateManager = AppUpdateManagerFactory.create(context)
  private var appUpdateInfo: AppUpdateInfo? = null
  private var listener: InstallStateUpdatedListener? = null
  private var jsProgressListener: ((Double) -> Unit)? = null

  override fun dispose() {
    super.dispose()
    listener?.let { appUpdateManager.unregisterListener(it) }
    listener = null
    jsProgressListener = null
  }

  // Keep a launcher for the update flow
  override fun checkForUpdate(): Promise<UpdateResult> {
    return Promise.async {
      val info = appUpdateManager.appUpdateInfo.await()
      Log.d("InappUpdates", "Update info ${info.updateAvailability()}")
      if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
        appUpdateInfo = info
      }
      UpdateResult(
        available = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE,
        info = UpdateInfo(
          versionCode = info.updateAvailability().toDouble(),
          availableVersionCode = info.availableVersionCode().toDouble(),
          updatePriority = info.updatePriority().toDouble(),
          version = "",
          releaseNotes = "",
          appUrl = ""
        )
      )
    }
  }

  override fun startUpdate(mode: UpdateMode): Promise<Boolean> {
    return Promise.async {
      appUpdateInfo?.let {
        val type =
          if (mode == UpdateMode.IMMEDIATE) AppUpdateType.IMMEDIATE else AppUpdateType.FLEXIBLE
        context.currentActivity?.let { activity ->
          if (type == AppUpdateType.FLEXIBLE) {
            listener = InstallStateUpdatedListener { state ->
              when (state.installStatus()) {
                InstallStatus.DOWNLOADING -> {
                  val percent = if (state.totalBytesToDownload() > 0)
                    (state.bytesDownloaded() * 100 / state.totalBytesToDownload()).toInt()
                  else 0
                  jsProgressListener?.invoke(percent.toDouble())
                }

                InstallStatus.DOWNLOADED -> {
                  // notify JS: ready to install
                  jsProgressListener?.invoke(100.toDouble())
                  // unregister listener
                  appUpdateManager.unregisterListener(listener!!)
                }

                else -> {}
              }
            }
          }
          val success = try {
            appUpdateManager.startUpdateFlowForResult(
              it,
              activity,
              AppUpdateOptions.defaultOptions(type),
              REQUEST_CODE
            )
            true
          } catch (e: Exception) {
            e.printStackTrace()
            false
          }
          success
        }
      }
      false
    }
  }

  override fun completeUpdate(): Promise<Boolean> {
    return Promise.async {
      appUpdateManager.completeUpdate()
      true
    }
  }

  override fun onProgress(progress: (Double) -> Unit) {
    jsProgressListener = progress
  }

  // 👇 This mimics your `onResume` logic
  override fun onActivityResumed(activity: Activity) {
    appUpdateManager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
      if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
        appUpdateManager.startUpdateFlowForResult(
          appUpdateInfo,
          context.currentActivity!!,
          AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),
          REQUEST_CODE
        )
      }
      if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
        appUpdateManager.completeUpdate()
      }
    }
  }

  // Required overrides, but unused
  override fun onActivityCreated(a: Activity, b: Bundle?) {}
  override fun onActivityStarted(a: Activity) {}
  override fun onActivityPaused(a: Activity) {}
  override fun onActivityStopped(a: Activity) {}
  override fun onActivitySaveInstanceState(a: Activity, outState: Bundle) {}
  override fun onActivityDestroyed(a: Activity) {}


  companion object {
    private const val REQUEST_CODE = 1234
  }
}
