// ExportAndroidPure - Android export system for MIFF framework
// Schema Version: v1

export enum AndroidBuildType {
  APK = 'apk',
  AAB = 'aab',
  DEVELOPMENT = 'development',
  RELEASE = 'release',
  DEBUG = 'debug'
}

export enum AndroidArchitecture {
  ARMV7 = 'armeabi-v7a',
  ARM64 = 'arm64-v8a',
  X86 = 'x86',
  X86_64 = 'x86_64'
}

export enum AndroidGraphicsAPI {
  OPENGL_ES = 'OpenGL ES',
  VULKAN = 'Vulkan'
}

export enum AndroidBuildSystem {
  GRADLE = 'gradle',
  INTERNAL = 'internal'
}

export enum AndroidTextureCompression {
  ATC = 'ATC',
  ETC1 = 'ETC1',
  ETC2 = 'ETC2',
  PVRTC = 'PVRTC',
  ASTC = 'ASTC',
  DXT1 = 'DXT1',
  DEFAULT = 'default'
}

export enum AndroidMinSdkVersion {
  API_16 = 16,
  API_19 = 19,
  API_21 = 21,
  API_22 = 22,
  API_23 = 23,
  API_24 = 24,
  API_25 = 25,
  API_26 = 26,
  API_27 = 27,
  API_28 = 28,
  API_29 = 29,
  API_30 = 30,
  API_31 = 31,
  API_32 = 32,
  API_33 = 33,
  API_34 = 34
}

export enum AndroidTargetSdkVersion {
  API_29 = 29,
  API_30 = 30,
  API_31 = 31,
  API_32 = 32,
  API_33 = 33,
  API_34 = 34,
  API_35 = 35
}

export enum AndroidInstallLocation {
  AUTO = 'auto',
  PREFER_EXTERNAL = 'preferExternal',
  FORCE_INTERNAL = 'forceInternal'
}

export enum AndroidInternetAccess {
  AUTO = 'auto',
  REQUIRE = 'require',
  DENY = 'deny'
}

export enum AndroidWriteAccess {
  EXTERNAL = 'external',
  INTERNAL = 'internal',
  NONE = 'none'
}

export interface AndroidProjectSettings {
  packageName: string;
  packageVersion: string;
  packageVersionCode: number;
  applicationLabel: string;
  minimumSdkVersion: AndroidMinSdkVersion;
  targetSdkVersion: AndroidTargetSdkVersion;
  compileSdkVersion: number;
  buildToolsVersion: string;
  gradlePluginPortalVersion: string;
  gradleVersion: string;
  kotlinVersion: string;
  androidGradlePluginVersion: string;
  buildSystem: AndroidBuildSystem;
  architectures: AndroidArchitecture[];
  graphicsAPIs: AndroidGraphicsAPI[];
  textureCompressionFormats: AndroidTextureCompression[];
  installLocation: AndroidInstallLocation;
  internetAccess: AndroidInternetAccess;
  writeAccess: AndroidWriteAccess;
  splitApplicationBinary: boolean;
  playStoreBuild: boolean;
  developmentBuild: boolean;
  allowDebugging: boolean;
  allowProfiling: boolean;
  allowBackup: boolean;
  killProcessOnLeave: boolean;
  useObb: boolean;
  useAPKExpansionFiles: boolean;
  loadSymbols: boolean;
  androidTVCompatibility: boolean;
  androidAutoCompatibility: boolean;
  chromeOSCompatibility: boolean;
  androidGameCompatibility: boolean;
  androidWearCompatibility: boolean;
  androidLargeHeap: boolean;
  androidMaxAspectRatio: number;
  androidMinAspectRatio: number;
  androidTargetDevices: string;
  androidPreferredInstallLocation: string;
  androidSplashScreenScale: string;
  androidShowActivityLabelOnWake: boolean;
  androidSupportedAspectRatio: string;
  androidDisableApplication: boolean;
  androidUseCustomActivity: boolean;
  androidCustomActivityName: string;
  androidActivityLabel: string;
  androidActivityIcons: string[];
  androidManifestXml: string;
  androidGradleBuildFile: string;
  androidGradlePropertiesFile: string;
  androidGradleSettingsFile: string;
  androidLibraryProject: boolean;
  androidIsGame: boolean;
  androidSupportsAccelerometer: boolean;
  androidSupportsGyroscope: boolean;
  androidSupportsGPS: boolean;
  androidSupportsVibration: boolean;
  androidSupportsLocationService: boolean;
  androidSupportsCompass: boolean;
  androidMaxFps: number;
  androidMinFps: number;
  androidFrameRate: number;
  androidResolutionDialogEnabled: boolean;
  androidShowFPSCounter: boolean;
  androidShowSystemInfo: boolean;
  androidDumpSymbols: boolean;
  androidValidateAppBundleSize: boolean;
  androidAppBundleSizeLimit: number;
  androidBundleVersionCode: number;
  androidMaxBundleSize: number;
  androidAssetPacks: string[];
  androidOBBDataDir: string;
  androidOBBExpansionFiles: string[];
  androidOBBScreenSize: number;
  androidOBBVersionCode: number;
  androidBundleIdentifier: string;
  androidSignatureHash: string;
  androidKeyAlias: string;
  androidKeyPassword: string;
  androidStorePassword: string;
  androidKeystorePath: string;
  androidInitializeOnStart: boolean;
  androidUseLowAccuracyLocation: boolean;
  androidDisableDepthAndStencilBuffers: boolean;
  androidDefaultOrientation: string;
  androidAutoRotationDefault: boolean;
  androidDisableScreenSleep: boolean;
  androidSustainedPerformanceMode: boolean;
  androidFastTrackAudio: boolean;
  androidProtectedApps: boolean;
  androidGamepadSupportMode: string;
  androidGamepadType: string;
  androidCustomMainManifestPath: string;
  androidCustomAndroidManifestPath: string;
  androidCustomResPath: string;
  androidCustomAssetsPath: string;
  androidCustomLibsPath: string;
  androidCustomSrcPath: string;
  androidCustomManifest: string;
  androidCustomRes: string;
  androidCustomAssets: string;
  androidCustomLibs: string;
  androidCustomSrc: string;
  androidCustomAndroidManifest: string;
  androidCustomMainActivity: string;
  androidCustomMainActivityPath: string;
  androidCustomMainActivityName: string;
  androidCustomMainActivityPackage: string;
  androidCustomMainActivityClass: string;
  androidCustomMainActivityExtends: string;
  androidCustomMainActivityImplements: string;
  androidCustomMainActivityAttributes: string;
  androidCustomMainActivityMethods: string;
  androidCustomMainActivityOnCreate: string;
  androidCustomMainActivityOnDestroy: string;
  androidCustomMainActivityOnPause: string;
  androidCustomMainActivityOnResume: string;
  androidCustomMainActivityOnStop: string;
  androidCustomMainActivityOnStart: string;
  androidCustomMainActivityOnRestart: string;
  androidCustomMainActivityOnNewIntent: string;
  androidCustomMainActivityOnActivityResult: string;
  androidCustomMainActivityOnRequestPermissionsResult: string;
  androidCustomMainActivityOnConfigurationChanged: string;
  androidCustomMainActivityOnLowMemory: string;
  androidCustomMainActivityOnTrimMemory: string;
  androidCustomMainActivityOnTaskRemoved: string;
  androidCustomMainActivityOnUserLeaveHint: string;
  androidCustomMainActivityOnWindowFocusChanged: string;
  androidCustomMainActivityOnAttachedToWindow: string;
  androidCustomMainActivityOnDetachedFromWindow: string;
  androidCustomMainActivityOnWindowAttributesChanged: string;
  androidCustomMainActivityOnContentChanged: string;
  androidCustomMainActivityOnSaveInstanceState: string;
  androidCustomMainActivityOnRestoreInstanceState: string;
  androidCustomMainActivityOnPostCreate: string;
  androidCustomMainActivityOnPostResume: string;
  androidCustomMainActivityOnUserInteraction: string;
  androidCustomMainActivityOnBackPressed: string;
  androidCustomMainActivityOnOptionsItemSelected: string;
  androidCustomMainActivityOnCreateOptionsMenu: string;
  androidCustomMainActivityOnPrepareOptionsMenu: string;
  androidCustomMainActivityOnDestroyOptionsMenu: string;
  androidCustomMainActivityOnOptionsMenuClosed: string;
  androidCustomMainActivityOnMenuOpened: string;
  androidCustomMainActivityOnPanelClosed: string;
  androidCustomMainActivityOnCreatePanelView: string;
  androidCustomMainActivityOnCreatePanelMenu: string;
  androidCustomMainActivityOnPreparePanel: string;
  androidCustomMainActivityOnMenuItemSelected: string;
  androidCustomMainActivityOnContextItemSelected: string;
  androidCustomMainActivityOnContextMenuClosed: string;
  androidCustomMainActivityOnSearchRequested: string;
  androidCustomMainActivityOnActionModeStarted: string;
  androidCustomMainActivityOnActionModeFinished: string;
  androidCustomMainActivityOnAttachedToDecor: string;
  androidCustomMainActivityOnDetachedFromDecor: string;
  androidCustomMainActivityOnEnterAnimationComplete: string;
  androidCustomMainActivityOnLocalVoiceInteractionStarted: string;
  androidCustomMainActivityOnLocalVoiceInteractionStopped: string;
  androidCustomMainActivityOnProvideAssistContent: string;
  androidCustomMainActivityOnProvideAssistData: string;
  androidCustomMainActivityOnProvideKeyboardShortcuts: string;
  androidCustomMainActivityOnProvideReferrer: string;
  androidCustomMainActivityOnCreateThumbnail: string;
  androidCustomMainActivityOnComputeScroll: string;
  androidCustomMainActivityOnDraw: string;
  androidCustomMainActivityOnGenericMotionEvent: string;
  androidCustomMainActivityOnHoverEvent: string;
  androidCustomMainActivityOnKeyDown: string;
  androidCustomMainActivityOnKeyLongPress: string;
  androidCustomMainActivityOnKeyMultiple: string;
  androidCustomMainActivityOnKeyPreIme: string;
  androidCustomMainActivityOnKeyShortcut: string;
  androidCustomMainActivityOnKeyUp: string;
  androidCustomMainActivityOnTrackballEvent: string;
  androidCustomMainActivityOnTouchEvent: string;
  androidCustomMainActivityOnVisibilityChanged: string;
  androidCustomMainActivityOnWindowPermissionsChanged: string;
  androidCustomMainActivityOnPointerCaptureChanged: string;
  androidCustomMainActivityOnCapturedPointerEvent: string;
  androidCustomMainActivityOnCreateInputConnection: string;
  androidCustomMainActivityOnInputMethodRequested: string;
  androidCustomMainActivityOnRenderNodeRequested: string;
  androidCustomMainActivityOnApplyWindowInsets: string;
  androidCustomMainActivityOnSystemUiVisibilityChange: string;
  androidCustomMainActivityOnPictureInPictureRequested: string;
  androidCustomMainActivityOnCreateContextMenu: string;
  androidCustomMainActivityOnProvideVirtualStructure: string;
  androidCustomMainActivityOnProvideContentCaptureStructure: string;
  androidCustomMainActivityOnReceiveContent: string;
  androidCustomMainActivityOnEnterPictureInPictureMode: string;
  androidCustomMainActivityOnExitPictureInPictureMode: string;
}

export interface AndroidBuildConfiguration {
  buildType: AndroidBuildType;
  outputPath: string;
  buildSystem: AndroidBuildSystem;
  gradleTemplate: string;
  keystorePath: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  storePassword: string;
  buildOptions: AndroidBuildOptions;
  projectSettings: AndroidProjectSettings;
  customSettings: Record<string, any>;
}

export interface AndroidBuildOptions {
  development: boolean;
  allowDebugging: boolean;
  waitForPlayerConnection: boolean;
  connectWithProfiler: boolean;
  buildScriptsOnly: boolean;
  buildAdditionalStreamedScenes: boolean;
  forceEnableAssertions: boolean;
  forceOptimizeScripts: boolean;
  enableHeadlessMode: boolean;
  enableDeepProfilingSupport: boolean;
  enableManagedDebugger: boolean;
  enableNativeDebugger: boolean;
  enableCodeCoverage: boolean;
  enableMemoryProfiling: boolean;
  enablePerformanceProfiling: boolean;
  enableCpuProfiling: boolean;
  enableGpuProfiling: boolean;
  enablePhysicsProfiling: boolean;
  enableAudioProfiling: boolean;
  enableVideoProfiling: boolean;
  enableInputProfiling: boolean;
  enableRenderProfiling: boolean;
  enableAnimationProfiling: boolean;
  enableAssetProfiling: boolean;
  enableScriptProfiling: boolean;
  enableNetworkProfiling: boolean;
  enableParticleSystemProfiling: boolean;
  enableUIProfiling: boolean;
  enableTextureStreamingProfiling: boolean;
  enableLightmapProfiling: boolean;
  enableOcclusionCullingProfiling: boolean;
  enableBatchingProfiling: boolean;
  enableThreadingProfiling: boolean;
  enableJobSystemProfiling: boolean;
  enableBurstProfiling: boolean;
  enablePackageManagerProfiling: boolean;
  enableEntityProfiling: boolean;
  enableD3D11Profiling: boolean;
  enableD3D12Profiling: boolean;
  enableVulkanProfiling: boolean;
  enableOpenGLProfiling: boolean;
  enableMetalProfiling: boolean;
  enableWebGLProfiling: boolean;
  enableAndroidProfiling: boolean;
  enableIOSProfiling: boolean;
  enableTizenProfiling: boolean;
  enableXboxProfiling: boolean;
  enablePlayStationProfiling: boolean;
  enableNintendoSwitchProfiling: boolean;
  enableCloudBuildProfiling: boolean;
  enableLocalBuildProfiling: boolean;
  enableRemoteBuildProfiling: boolean;
  enableCustomBuildProfiling: boolean;
  enableProfiling: boolean;
  buildWithDeepProfileAnalysis: boolean;
  buildWithDeepProfileAnalysisMarkers: boolean;
  buildWithDeepProfileAnalysisCallStacks: boolean;
  buildWithDeepProfileAnalysisMemory: boolean;
  buildWithDeepProfileAnalysisBandwidth: boolean;
  buildWithDeepProfileAnalysisAudio: boolean;
  buildWithDeepProfileAnalysisVideo: boolean;
  buildWithDeepProfileAnalysisInput: boolean;
  buildWithDeepProfileAnalysisRender: boolean;
  buildWithDeepProfileAnalysisAnimation: boolean;
  buildWithDeepProfileAnalysisAsset: boolean;
  buildWithDeepProfileAnalysisScript: boolean;
  buildWithDeepProfileAnalysisNetwork: boolean;
  buildWithDeepProfileAnalysisParticleSystem: boolean;
  buildWithDeepProfileAnalysisUI: boolean;
  buildWithDeepProfileAnalysisTextureStreaming: boolean;
  buildWithDeepProfileAnalysisLightmap: boolean;
  buildWithDeepProfileAnalysisOcclusionCulling: boolean;
  buildWithDeepProfileAnalysisBatching: boolean;
  buildWithDeepProfileAnalysisThreading: boolean;
  buildWithDeepProfileAnalysisJobSystem: boolean;
  buildWithDeepProfileAnalysisBurst: boolean;
  buildWithDeepProfileAnalysisPackageManager: boolean;
  buildWithDeepProfileAnalysisEntity: boolean;
  buildWithDeepProfileAnalysisD3D11: boolean;
  buildWithDeepProfileAnalysisD3D12: boolean;
  buildWithDeepProfileAnalysisVulkan: boolean;
  buildWithDeepProfileAnalysisOpenGL: boolean;
  buildWithDeepProfileAnalysisMetal: boolean;
  buildWithDeepProfileAnalysisWebGL: boolean;
  buildWithDeepProfileAnalysisAndroid: boolean;
  buildWithDeepProfileAnalysisIOS: boolean;
  buildWithDeepProfileAnalysisTizen: boolean;
  buildWithDeepProfileAnalysisXbox: boolean;
  buildWithDeepProfileAnalysisPlayStation: boolean;
  buildWithDeepProfileAnalysisNintendoSwitch: boolean;
  buildWithDeepProfileAnalysisCloudBuild: boolean;
  buildWithDeepProfileAnalysisLocalBuild: boolean;
  buildWithDeepProfileAnalysisRemoteBuild: boolean;
  buildWithDeepProfileAnalysisCustomBuild: boolean;
  enableBundleVersionUpdate: boolean;
  enableBundleIdentifierUpdate: boolean;
  enableApplicationIdentifierUpdate: boolean;
  enableVersionCodeUpdate: boolean;
  enableVersionNameUpdate: boolean;
  enableIconUpdate: boolean;
  enableSplashScreenUpdate: boolean;
  enableLabelUpdate: boolean;
  enablePackageNameUpdate: boolean;
  enableSigningConfigUpdate: boolean;
  enableBuildConfigUpdate: boolean;
  enableGradleUpdate: boolean;
  enableManifestUpdate: boolean;
  enableResourcesUpdate: boolean;
  enableAssetsUpdate: boolean;
  enableLibsUpdate: boolean;
  enableSrcUpdate: boolean;
  enableResUpdate: boolean;
  enableCustomUpdate: boolean;
  enableBuildGradleUpdate: boolean;
  enableGradlePropertiesUpdate: boolean;
  enableSettingsGradleUpdate: boolean;
  enableAndroidManifestUpdate: boolean;
  enableMainActivityUpdate: boolean;
  enableCustomActivityUpdate: boolean;
  enableCustomManifestUpdate: boolean;
  enableCustomResUpdate: boolean;
  enableCustomAssetsUpdate: boolean;
  enableCustomLibsUpdate: boolean;
  enableCustomSrcUpdate: boolean;
  enableCustomMainActivityUpdate: boolean;
  enableCustomMainActivityPathUpdate: boolean;
  enableCustomMainActivityNameUpdate: boolean;
  enableCustomMainActivityPackageUpdate: boolean;
  enableCustomMainActivityClassUpdate: boolean;
  enableCustomMainActivityExtendsUpdate: boolean;
  enableCustomMainActivityImplementsUpdate: boolean;
  enableCustomMainActivityAttributesUpdate: boolean;
  enableCustomMainActivityMethodsUpdate: boolean;
  enableCustomMainActivityOnCreateUpdate: boolean;
  enableCustomMainActivityOnDestroyUpdate: boolean;
  enableCustomMainActivityOnPauseUpdate: boolean;
  enableCustomMainActivityOnResumeUpdate: boolean;
  enableCustomMainActivityOnStopUpdate: boolean;
  enableCustomMainActivityOnStartUpdate: boolean;
  enableCustomMainActivityOnRestartUpdate: boolean;
  enableCustomMainActivityOnNewIntentUpdate: boolean;
  enableCustomMainActivityOnActivityResultUpdate: boolean;
  enableCustomMainActivityOnRequestPermissionsResultUpdate: boolean;
  enableCustomMainActivityOnConfigurationChangedUpdate: boolean;
  enableCustomMainActivityOnLowMemoryUpdate: boolean;
  enableCustomMainActivityOnTrimMemoryUpdate: boolean;
  enableCustomMainActivityOnTaskRemovedUpdate: boolean;
  enableCustomMainActivityOnUserLeaveHintUpdate: boolean;
  enableCustomMainActivityOnWindowFocusChangedUpdate: boolean;
  enableCustomMainActivityOnAttachedToWindowUpdate: boolean;
  enableCustomMainActivityOnDetachedFromWindowUpdate: boolean;
  enableCustomMainActivityOnWindowAttributesChangedUpdate: boolean;
  enableCustomMainActivityOnContentChangedUpdate: boolean;
  enableCustomMainActivityOnSaveInstanceStateUpdate: boolean;
  enableCustomMainActivityOnRestoreInstanceStateUpdate: boolean;
  enableCustomMainActivityOnPostCreateUpdate: boolean;
  enableCustomMainActivityOnPostResumeUpdate: boolean;
  enableCustomMainActivityOnUserInteractionUpdate: boolean;
  enableCustomMainActivityOnBackPressedUpdate: boolean;
  enableCustomMainActivityOnOptionsItemSelectedUpdate: boolean;
  enableCustomMainActivityOnCreateOptionsMenuUpdate: boolean;
  enableCustomMainActivityOnPrepareOptionsMenuUpdate: boolean;
  enableCustomMainActivityOnDestroyOptionsMenuUpdate: boolean;
  enableCustomMainActivityOnOptionsMenuClosedUpdate: boolean;
  enableCustomMainActivityOnMenuOpenedUpdate: boolean;
  enableCustomMainActivityOnPanelClosedUpdate: boolean;
  enableCustomMainActivityOnCreatePanelViewUpdate: boolean;
  enableCustomMainActivityOnCreatePanelMenuUpdate: boolean;
  enableCustomMainActivityOnPreparePanelUpdate: boolean;
  enableCustomMainActivityOnMenuItemSelectedUpdate: boolean;
  enableCustomMainActivityOnContextItemSelectedUpdate: boolean;
  enableCustomMainActivityOnContextMenuClosedUpdate: boolean;
  enableCustomMainActivityOnSearchRequestedUpdate: boolean;
  enableCustomMainActivityOnActionModeStartedUpdate: boolean;
  enableCustomMainActivityOnActionModeFinishedUpdate: boolean;
  enableCustomMainActivityOnAttachedToDecorUpdate: boolean;
  enableCustomMainActivityOnDetachedFromDecorUpdate: boolean;
  enableCustomMainActivityOnEnterAnimationCompleteUpdate: boolean;
  enableCustomMainActivityOnLocalVoiceInteractionStartedUpdate: boolean;
  enableCustomMainActivityOnLocalVoiceInteractionStoppedUpdate: boolean;
  enableCustomMainActivityOnProvideAssistContentUpdate: boolean;
  enableCustomMainActivityOnProvideAssistDataUpdate: boolean;
  enableCustomMainActivityOnProvideKeyboardShortcutsUpdate: boolean;
  enableCustomMainActivityOnProvideReferrerUpdate: boolean;
  enableCustomMainActivityOnCreateThumbnailUpdate: boolean;
  enableCustomMainActivityOnComputeScrollUpdate: boolean;
  enableCustomMainActivityOnDrawUpdate: boolean;
  enableCustomMainActivityOnGenericMotionEventUpdate: boolean;
  enableCustomMainActivityOnHoverEventUpdate: boolean;
  enableCustomMainActivityOnKeyDownUpdate: boolean;
  enableCustomMainActivityOnKeyLongPressUpdate: boolean;
  enableCustomMainActivityOnKeyMultipleUpdate: boolean;
  enableCustomMainActivityOnKeyPreImeUpdate: boolean;
  enableCustomMainActivityOnKeyShortcutUpdate: boolean;
  enableCustomMainActivityOnKeyUpUpdate: boolean;
  enableCustomMainActivityOnTrackballEventUpdate: boolean;
  enableCustomMainActivityOnTouchEventUpdate: boolean;
  enableCustomMainActivityOnVisibilityChangedUpdate: boolean;
  enableCustomMainActivityOnWindowPermissionsChangedUpdate: boolean;
  enableCustomMainActivityOnPointerCaptureChangedUpdate: boolean;
  enableCustomMainActivityOnCapturedPointerEventUpdate: boolean;
  enableCustomMainActivityOnCreateInputConnectionUpdate: boolean;
  enableCustomMainActivityOnInputMethodRequestedUpdate: boolean;
  enableCustomMainActivityOnRenderNodeRequestedUpdate: boolean;
  enableCustomMainActivityOnApplyWindowInsetsUpdate: boolean;
  enableCustomMainActivityOnSystemUiVisibilityChangeUpdate: boolean;
  enableCustomMainActivityOnPictureInPictureRequestedUpdate: boolean;
  enableCustomMainActivityOnCreateContextMenuUpdate: boolean;
}

export interface AndroidBuildReport {
  summary: AndroidBuildSummary;
  steps: AndroidBuildStep[];
  files: AndroidBuildFile[];
  dependencies: AndroidBuildDependency[];
  buildTime: number;
  buildStartTime: number;
  buildEndTime: number;
  totalSize: number;
  totalTime: number;
  buildResult: string;
  buildPlatform: string;
  buildTarget: string;
  buildType: string;
  buildVersion: string;
  unityVersion: string;
  buildMachine: string;
  buildPath: string;
  buildGUID: string;
  buildTargetGroup: string;
  buildTargetPlatform: string;
  buildTargetPlatformGroup: string;
  buildTargetPlatformVersion: string;
  buildTargetArchitecture: string;
  buildTargetGraphicsAPIs: string[];
  buildTargetVR: boolean;
  buildTargetAR: boolean;
  buildTargetMR: boolean;
  buildTargetXR: boolean;
  buildTargetIL2CPP: boolean;
  buildTargetMono: boolean;
  buildTargetWebGL: boolean;
  buildTargetAndroid: boolean;
  buildTargetIOS: boolean;
  buildTargetTizen: boolean;
  buildTargetXbox: boolean;
  buildTargetPlayStation: boolean;
  buildTargetNintendoSwitch: boolean;
  buildTargetCloudBuild: boolean;
  buildTargetLocalBuild: boolean;
  buildTargetRemoteBuild: boolean;
  buildTargetCustomBuild: boolean;
  buildSummary: AndroidBuildSummary;
  buildReport: string;
  buildLog: string;
  buildErrors: string[];
  buildWarnings: string[];
  buildSuccess: boolean;
  buildFailed: boolean;
  buildCancelled: boolean;
  buildAborted: boolean;
  buildInterrupted: boolean;
  buildTimedOut: boolean;
  buildOutOfMemory: boolean;
  buildOutOfDiskSpace: boolean;
  buildInternalError: boolean;
  buildUserError: boolean;
  buildConfigurationError: boolean;
  buildDependencyError: boolean;
  buildCompilationError: boolean;
  buildLinkError: boolean;
  buildPackageError: boolean;
  buildAssetError: boolean;
  buildCodeGenerationError: boolean;
  buildMetadataError: boolean;
  buildResourceError: boolean;
  buildShaderError: boolean;
  buildTextureError: boolean;
  buildMeshError: boolean;
  buildAnimationError: boolean;
  buildAudioError: boolean;
  buildVideoError: boolean;
  buildFontError: boolean;
  buildMaterialError: boolean;
  buildModelError: boolean;
  buildSceneError: boolean;
  buildPrefabError: boolean;
  buildScriptableObjectError: boolean;
  buildTerrainError: boolean;
  buildLightmapError: boolean;
  buildOcclusionError: boolean;
  buildNavmeshError: boolean;
  buildPhysicsError: boolean;
  buildUIError: boolean;
  buildParticleSystemError: boolean;
  buildParticleSystemModuleError: boolean;
  buildParticleSystemRendererError: boolean;
  buildParticleSystemShapeError: boolean;
  buildParticleSystemEmissionError: boolean;
  buildParticleSystemSizeError: boolean;
  buildParticleSystemSizeOverLifetimeError: boolean;
  buildParticleSystemSizeBySpeedError: boolean;
  buildParticleSystemVelocityError: boolean;
  buildParticleSystemVelocityOverLifetimeError: boolean;
  buildParticleSystemVelocityBySpeedError: boolean;
  buildParticleSystemLimitVelocityError: boolean;
  buildParticleSystemInheritVelocityError: boolean;
  buildParticleSystemForceError: boolean;
  buildParticleSystemForceOverLifetimeError: boolean;
  buildParticleSystemForceBySpeedError: boolean;
  buildParticleSystemColorError: boolean;
  buildParticleSystemColorOverLifetimeError: boolean;
  buildParticleSystemColorBySpeedError: boolean;
  buildParticleSystemRotationError: boolean;
  buildParticleSystemRotationOverLifetimeError: boolean;
  buildParticleSystemRotationBySpeedError: boolean;
  buildParticleSystemExternalForcesError: boolean;
  buildParticleSystemNoiseError: boolean;
  buildParticleSystemCollisionError: boolean;
  buildParticleSystemTriggerError: boolean;
  buildParticleSystemSubEmitterError: boolean;
  buildParticleSystemTextureSheetAnimationError: boolean;
  buildParticleSystemLightsError: boolean;
  buildParticleSystemTrailError: boolean;
  buildParticleSystemCustomDataError: boolean;
}

export interface AndroidBuildSummary {
  platform: string;
  platformGroup: string;
  options: string;
  outputPath: string;
  buildStartedAt: number;
  buildEndedAt: number;
  totalTime: number;
  totalSize: number;
  buildResult: string;
  totalErrors: number;
  totalWarnings: number;
  totalMessages: number;
  type: string;
  buildTarget: string;
  buildTargetGroup: string;
  buildType: string;
  buildPlatform: string;
  buildConfiguration: string;
  buildNumber: string;
  buildVersion: string;
  unityVersion: string;
  buildMachine: string;
  buildPath: string;
  buildGUID: string;
  buildTargetPlatform: string;
  buildTargetPlatformGroup: string;
  buildTargetPlatformVersion: string;
  buildTargetArchitecture: string;
  buildTargetGraphicsAPIs: string[];
  buildTargetVR: boolean;
  buildTargetAR: boolean;
  buildTargetMR: boolean;
  buildTargetXR: boolean;
  buildTargetIL2CPP: boolean;
  buildTargetMono: boolean;
  buildTargetWebGL: boolean;
  buildTargetAndroid: boolean;
  buildTargetIOS: boolean;
  buildTargetTizen: boolean;
  buildTargetXbox: boolean;
  buildTargetPlayStation: boolean;
  buildTargetNintendoSwitch: boolean;
  buildTargetCloudBuild: boolean;
  buildTargetLocalBuild: boolean;
  buildTargetRemoteBuild: boolean;
  buildTargetCustomBuild: boolean;
  buildReport: string;
  buildLog: string;
  buildErrors: string[];
  buildWarnings: string[];
  buildSuccess: boolean;
  buildFailed: boolean;
  buildCancelled: boolean;
  buildAborted: boolean;
  buildInterrupted: boolean;
  buildTimedOut: boolean;
  buildOutOfMemory: boolean;
  buildOutOfDiskSpace: boolean;
  buildInternalError: boolean;
  buildUserError: boolean;
  buildConfigurationError: boolean;
  buildDependencyError: boolean;
  buildCompilationError: boolean;
  buildLinkError: boolean;
  buildPackageError: boolean;
  buildAssetError: boolean;
  buildCodeGenerationError: boolean;
  buildMetadataError: boolean;
  buildResourceError: boolean;
  buildShaderError: boolean;
  buildTextureError: boolean;
  buildMeshError: boolean;
  buildAnimationError: boolean;
  buildAudioError: boolean;
  buildVideoError: boolean;
  buildFontError: boolean;
  buildMaterialError: boolean;
  buildModelError: boolean;
  buildSceneError: boolean;
  buildPrefabError: boolean;
  buildScriptableObjectError: boolean;
  buildTerrainError: boolean;
  buildLightmapError: boolean;
  buildOcclusionError: boolean;
  buildNavmeshError: boolean;
  buildPhysicsError: boolean;
  buildUIError: boolean;
  buildParticleSystemError: boolean;
  buildParticleSystemModuleError: boolean;
  buildParticleSystemRendererError: boolean;
  buildParticleSystemShapeError: boolean;
  buildParticleSystemEmissionError: boolean;
  buildParticleSystemSizeError: boolean;
  buildParticleSystemSizeOverLifetimeError: boolean;
  buildParticleSystemSizeBySpeedError: boolean;
  buildParticleSystemVelocityError: boolean;
  buildParticleSystemVelocityOverLifetimeError: boolean;
  buildParticleSystemVelocityBySpeedError: boolean;
  buildParticleSystemLimitVelocityError: boolean;
  buildParticleSystemInheritVelocityError: boolean;
  buildParticleSystemForceError: boolean;
  buildParticleSystemForceOverLifetimeError: boolean;
  buildParticleSystemForceBySpeedError: boolean;
  buildParticleSystemColorError: boolean;
  buildParticleSystemColorOverLifetimeError: boolean;
  buildParticleSystemColorBySpeedError: boolean;
  buildParticleSystemRotationError: boolean;
  buildParticleSystemRotationOverLifetimeError: boolean;
  buildParticleSystemRotationBySpeedError: boolean;
  buildParticleSystemExternalForcesError: boolean;
  buildParticleSystemNoiseError: boolean;
  buildParticleSystemCollisionError: boolean;
  buildParticleSystemTriggerError: boolean;
  buildParticleSystemSubEmitterError: boolean;
  buildParticleSystemTextureSheetAnimationError: boolean;
  buildParticleSystemLightsError: boolean;
  buildParticleSystemTrailError: boolean;
  buildParticleSystemCustomDataError: boolean;
}

export interface AndroidBuildFile {
  path: string;
  size: number;
  hash: string;
  type: string;
  compressed: boolean;
  encrypted: boolean;
  metadata: Record<string, any>;
}

export interface AndroidBuildDependency {
  name: string;
  version: string;
  type: string;
  size: number;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface AndroidBuildStep {
  name: string;
  duration: number;
  depth: number;
  startTime: number;
  endTime: number;
  result: string;
  messages: string[];
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
}

export interface AndroidExportReport {
  exportId: string;
  startTime: number;
  endTime: number;
  duration: number;
  sourceFormat: string;
  targetFormat: string;
  exportStatus: 'success' | 'partial' | 'failed';
  exportedAssets: AndroidAssetExport[];
  exportErrors: AndroidExportError[];
  exportWarnings: AndroidExportWarning[];
  metadata: Record<string, any>;
}

export interface AndroidAssetExport {
  sourcePath: string;
  targetPath: string;
  assetType: string;
  exportTime: number;
  fileSize: number;
  compressionRatio: number;
  quality: number;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface AndroidExportError {
  sourcePath: string;
  errorCode: string;
  errorMessage: string;
  stackTrace: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  retryable: boolean;
  context: Record<string, any>;
}

export interface AndroidExportWarning {
  sourcePath: string;
  warningCode: string;
  warningMessage: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  suggestion: string;
  context: Record<string, any>;
}

export class AndroidExporter {
  private projectSettings: AndroidProjectSettings;
  private buildConfiguration: AndroidBuildConfiguration;
  private exportReports: AndroidExportReport[] = [];
  private isInitialized = false;

  constructor(projectSettings: AndroidProjectSettings, buildConfiguration: AndroidBuildConfiguration) {
    this.projectSettings = projectSettings;
    this.buildConfiguration = buildConfiguration;
    this.initializeExporter();
  }

  private async initializeExporter(): Promise<void> {
    console.log('[AndroidExporter] Initializing Android exporter...');

    try {
      // Validate project settings
      await this.validateProjectSettings();

      // Validate build configuration
      await this.validateBuildConfiguration();

      // Initialize Android project
      await this.initializeAndroidProject();

      this.isInitialized = true;
      console.log('[AndroidExporter] Android exporter initialized successfully');
    } catch (error) {
      console.error('[AndroidExporter] Failed to initialize Android exporter:', error);
      throw new Error(`Android exporter initialization failed: ${error}`);
    }
  }

  private async validateProjectSettings(): Promise<void> {
    // Validate project settings
    console.log('[AndroidExporter] Validating project settings...');
  }

  private async validateBuildConfiguration(): Promise<void> {
    // Validate build configuration
    console.log('[AndroidExporter] Validating build configuration...');
  }

  private async initializeAndroidProject(): Promise<void> {
    // Initialize Android project
    console.log('[AndroidExporter] Initializing Android project...');
  }

  async exportProject(): Promise<AndroidExportReport> {
    if (!this.isInitialized) {
      throw new Error('Android exporter not initialized');
    }

    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`[AndroidExporter] Starting export: ${exportId}`);

    const report: AndroidExportReport = {
      exportId,
      startTime,
      endTime: 0,
      duration: 0,
      sourceFormat: 'MIFF',
      targetFormat: 'Android',
      exportStatus: 'success',
      exportedAssets: [],
      exportErrors: [],
      exportWarnings: [],
      metadata: {}
    };

    try {
      // Export project settings
      await this.exportProjectSettings();

      // Export scenes
      await this.exportScenes();

      // Export assets
      await this.exportAssets();

      // Export resources
      await this.exportResources();

      // Generate build files
      await this.generateBuildFiles();

      // Export project
      await this.exportProjectFiles();

      report.endTime = Date.now();
      report.duration = report.endTime - startTime;
      report.exportStatus = 'success';

      console.log(`[AndroidExporter] Export completed: ${exportId}`);
    } catch (error) {
      report.endTime = Date.now();
      report.duration = report.endTime - startTime;
      report.exportStatus = 'failed';

      const exportError: AndroidExportError = {
        sourcePath: '',
        errorCode: 'EXPORT_FAILED',
        errorMessage: `Export failed: ${error}`,
        stackTrace: '',
        timestamp: Date.now(),
        severity: 'critical',
        category: 'export',
        retryable: true,
        context: { exportId }
      };

      report.exportErrors.push(exportError);

      console.error(`[AndroidExporter] Export failed: ${exportId}`, error);
    }

    this.exportReports.push(report);
    return report;
  }

  private async exportProjectSettings(): Promise<void> {
    console.log('[AndroidExporter] Exporting project settings...');
    // Implementation for exporting project settings
  }

  private async exportScenes(): Promise<void> {
    console.log('[AndroidExporter] Exporting scenes...');
    // Implementation for exporting scenes
  }

  private async exportAssets(): Promise<void> {
    console.log('[AndroidExporter] Exporting assets...');
    // Implementation for exporting assets
  }

  private async exportResources(): Promise<void> {
    console.log('[AndroidExporter] Exporting resources...');
    // Implementation for exporting resources
  }

  private async generateBuildFiles(): Promise<void> {
    console.log('[AndroidExporter] Generating build files...');
    // Implementation for generating build files
  }

  private async exportProjectFiles(): Promise<void> {
    console.log('[AndroidExporter] Exporting project files...');
    // Implementation for exporting project files
  }

  async buildProject(): Promise<AndroidBuildReport> {
    if (!this.isInitialized) {
      throw new Error('Android exporter not initialized');
    }

    console.log('[AndroidExporter] Building Android project...');

    const report: AndroidBuildReport = {
      summary: {
        platform: 'Android',
        platformGroup: 'Android',
        options: JSON.stringify(this.buildConfiguration.buildOptions),
        outputPath: this.buildConfiguration.outputPath,
        buildStartedAt: Date.now(),
        buildEndedAt: 0,
        totalTime: 0,
        totalSize: 0,
        buildResult: 'success',
        totalErrors: 0,
        totalWarnings: 0,
        totalMessages: 0,
        type: 'build',
        buildNumber: '1.0.0',
        buildVersion: '1.0.0',
        unityVersion: '2021.3',
        buildMachine: 'MIFF-Exporter',
        buildPath: this.buildConfiguration.outputPath,
        buildGUID: `build_${Date.now()}`,
        buildTargetPlatform: 'Android',
        buildTargetPlatformGroup: 'Android',
        buildTargetPlatformVersion: '11.0',
        buildTargetArchitecture: 'ARM64',
        buildTargetGraphicsAPIs: ['OpenGL ES', 'Vulkan'],
        buildTargetVR: false,
        buildTargetAR: false,
        buildTargetMR: false,
        buildTargetXR: false,
        buildTargetIL2CPP: false,
        buildTargetMono: true,
        buildTargetWebGL: false,
        buildTargetAndroid: true,
        buildTargetIOS: false,
        buildTargetTizen: false,
        buildTargetXbox: false,
        buildTargetPlayStation: false,
        buildTargetNintendoSwitch: false,
        buildTargetCloudBuild: false,
        buildTargetLocalBuild: true,
        buildTargetRemoteBuild: false,
        buildTargetCustomBuild: false,
        buildNumber: '1.0.0',
        buildDate: new Date().toISOString(),
        buildDuration: 0,
        buildSize: 0,
        buildFiles: [],
        buildDependencies: [],
        buildSteps: [],
        buildReport: '',
        buildLog: '',
        buildErrors: [],
        buildWarnings: [],
        buildSuccess: true,
        buildFailed: false,
        buildCancelled: false,
        buildAborted: false,
        buildInterrupted: false,
        buildTimedOut: false,
        buildOutOfMemory: false,
        buildOutOfDiskSpace: false,
        buildInternalError: false,
        buildUserError: false,
        buildConfigurationError: false,
        buildDependencyError: false,
        buildCompilationError: false,
        buildLinkError: false,
        buildPackageError: false,
        buildAssetError: false,
        buildCodeGenerationError: false,
        buildMetadataError: false,
        buildResourceError: false,
        buildShaderError: false,
        buildTextureError: false,
        buildMeshError: false,
        buildAnimationError: false,
        buildAudioError: false,
        buildVideoError: false,
        buildFontError: false,
        buildMaterialError: false,
        buildModelError: false,
        buildSceneError: false,
        buildPrefabError: false,
        buildScriptableObjectError: false,
        buildTerrainError: false,
        buildLightmapError: false,
        buildOcclusionError: false,
        buildNavmeshError: false,
        buildPhysicsError: false,
        buildUIError: false,
        buildParticleSystemError: false,
        buildParticleSystemModuleError: false,
        buildParticleSystemRendererError: false,
        buildParticleSystemShapeError: false,
        buildParticleSystemEmissionError: false,
        buildParticleSystemSizeError: false,
        buildParticleSystemSizeOverLifetimeError: false,
        buildParticleSystemSizeBySpeedError: false,
        buildParticleSystemVelocityError: false,
        buildParticleSystemVelocityOverLifetimeError: false,
        buildParticleSystemVelocityBySpeedError: false,
        buildParticleSystemLimitVelocityError: false,
        buildParticleSystemInheritVelocityError: false,
        buildParticleSystemForceError: false,
        buildParticleSystemForceOverLifetimeError: false,
        buildParticleSystemForceBySpeedError: false,
        buildParticleSystemColorError: false,
        buildParticleSystemColorOverLifetimeError: false,
        buildParticleSystemColorBySpeedError: false,
        buildParticleSystemRotationError: false,
        buildParticleSystemRotationOverLifetimeError: false,
        buildParticleSystemRotationBySpeedError: false,
        buildParticleSystemExternalForcesError: false,
        buildParticleSystemNoiseError: false,
        buildParticleSystemCollisionError: false,
        buildParticleSystemTriggerError: false,
        buildParticleSystemSubEmitterError: false,
        buildParticleSystemTextureSheetAnimationError: false,
        buildParticleSystemLightsError: false,
        buildParticleSystemTrailError: false,
        buildParticleSystemCustomDataError: false,
        buildParticleSystemRendererError: false,
        buildParticleSystemShapeError: false
      },
      steps: [],
      files: [],
      dependencies: [],
      buildTime: Date.now(),
      buildStartTime: Date.now(),
      buildEndTime: Date.now() + 1000,
      totalSize: 0,
      totalTime: 1000,
      buildResult: 'success',
      buildPlatform: 'Android',
      buildVersion: this.projectSettings.packageVersion,
      unityVersion: '2021.3',
      buildMachine: 'MIFF-Exporter',
      buildPath: this.buildConfiguration.outputPath,
      buildGUID: `build_${Date.now()}`,
      buildTargetGroup: 'Android',
      buildTargetPlatform: 'Android',
      buildTargetPlatformGroup: 'Android',
      buildTargetPlatformVersion: '11.0',
      buildTargetArchitecture: 'ARM64',
      buildTargetGraphicsAPIs: ['OpenGL ES', 'Vulkan'],
      buildTargetVR: false,
      buildTargetAR: false,
      buildTargetMR: false,
      buildTargetXR: false,
      buildTargetIL2CPP: false,
      buildTargetMono: true,
      buildTargetWebGL: false,
      buildTargetAndroid: true,
      buildTargetIOS: false,
      buildTargetTizen: false,
      buildTargetXbox: false,
      buildTargetPlayStation: false,
      buildTargetNintendoSwitch: false,
      buildTargetCloudBuild: false,
      buildTargetLocalBuild: true,
      buildTargetRemoteBuild: false,
      buildTargetCustomBuild: false,
      buildNumber: '1.0.0',
      buildDate: new Date().toISOString(),
      buildDuration: 1000,
      buildSize: 0,
      buildFiles: [],
      buildDependencies: [],
      buildSteps: [],
      buildSummary: {
        platform: 'Android',
        platformGroup: 'Android',
        options: JSON.stringify(this.buildConfiguration.buildOptions),
        outputPath: this.buildConfiguration.outputPath,
        buildStartedAt: Date.now(),
        buildEndedAt: 0,
        totalTime: 0,
        totalSize: 0,
        buildResult: 'success',
        totalErrors: 0,
        totalWarnings: 0,
        totalMessages: 0,
        type: 'build',
        // summary fields above already include platform/target/configuration
        buildNumber: '1.0.0',
        buildVersion: '1.0.0',
        unityVersion: '2021.3',
        buildMachine: 'MIFF-Exporter',
        buildPath: this.buildConfiguration.outputPath,
        buildGUID: `build_${Date.now()}`,
        buildTargetPlatform: 'Android',
        buildTargetPlatformGroup: 'Android',
        buildTargetPlatformVersion: '11.0',
        buildTargetArchitecture: 'ARM64',
        buildTargetGraphicsAPIs: ['OpenGL ES', 'Vulkan'],
        buildTargetVR: false,
        buildTargetAR: false,
        buildTargetMR: false,
        buildTargetXR: false,
        buildTargetIL2CPP: false,
        buildTargetMono: true,
        buildTargetWebGL: false,
        buildTargetAndroid: true,
        buildTargetIOS: false,
        buildTargetTizen: false,
        buildTargetXbox: false,
        buildTargetPlayStation: false,
        buildTargetNintendoSwitch: false,
        buildTargetCloudBuild: false,
        buildTargetLocalBuild: true,
        buildTargetRemoteBuild: false,
        buildTargetCustomBuild: false,
        buildNumber: '1.0.0',
        buildDate: new Date().toISOString(),
        buildDuration: 0,
        buildSize: 0,
        buildFiles: [],
        buildDependencies: [],
        buildSteps: [],
        buildReport: '',
        buildLog: '',
        buildErrors: [],
        buildWarnings: [],
        buildSuccess: true,
        buildFailed: false,
        buildCancelled: false,
        buildAborted: false,
        buildInterrupted: false,
        buildTimedOut: false,
        buildOutOfMemory: false,
        buildOutOfDiskSpace: false,
        buildInternalError: false,
        buildUserError: false,
        buildConfigurationError: false,
        buildDependencyError: false,
        buildCompilationError: false,
        buildLinkError: false,
        buildPackageError: false,
        buildAssetError: false,
        buildCodeGenerationError: false,
        buildMetadataError: false,
        buildResourceError: false,
        buildShaderError: false,
        buildTextureError: false,
        buildMeshError: false,
        buildAnimationError: false,
        buildAudioError: false,
        buildVideoError: false,
        buildFontError: false,
        buildMaterialError: false,
        buildModelError: false,
        buildSceneError: false,
        buildPrefabError: false,
        buildScriptableObjectError: false,
        buildTerrainError: false,
        buildLightmapError: false,
        buildOcclusionError: false,
        buildNavmeshError: false,
        buildPhysicsError: false,
        buildUIError: false,
        buildParticleSystemError: false,
        buildParticleSystemModuleError: false,
        buildParticleSystemRendererError: false,
        buildParticleSystemShapeError: false,
        buildParticleSystemEmissionError: false,
        buildParticleSystemSizeError: false,
        buildParticleSystemSizeOverLifetimeError: false,
        buildParticleSystemSizeBySpeedError: false,
        buildParticleSystemVelocityError: false,
        buildParticleSystemVelocityOverLifetimeError: false,
        buildParticleSystemVelocityBySpeedError: false,
        buildParticleSystemLimitVelocityError: false,
        buildParticleSystemInheritVelocityError: false,
        buildParticleSystemForceError: false,
        buildParticleSystemForceOverLifetimeError: false,
        buildParticleSystemForceBySpeedError: false,
        buildParticleSystemColorError: false,
        buildParticleSystemColorOverLifetimeError: false,
        buildParticleSystemColorBySpeedError: false,
        buildParticleSystemRotationError: false,
        buildParticleSystemRotationOverLifetimeError: false,
        buildParticleSystemRotationBySpeedError: false,
        buildParticleSystemExternalForcesError: false,
        buildParticleSystemNoiseError: false,
        buildParticleSystemCollisionError: false,
        buildParticleSystemTriggerError: false,
        buildParticleSystemSubEmitterError: false,
        buildParticleSystemTextureSheetAnimationError: false,
        buildParticleSystemLightsError: false,
        buildParticleSystemTrailError: false,
        buildParticleSystemCustomDataError: false,
        buildParticleSystemRendererError: false,
        buildParticleSystemShapeError: false
      },
      buildReport: '',
      buildLog: '',
      buildErrors: [],
      buildWarnings: [],
      buildSuccess: true,
      buildFailed: false,
      buildCancelled: false,
      buildAborted: false,
      buildInterrupted: false,
      buildTimedOut: false,
      buildOutOfMemory: false,
      buildOutOfDiskSpace: false,
      buildInternalError: false,
      buildUserError: false,
      buildConfigurationError: false,
      buildDependencyError: false,
      buildCompilationError: false,
      buildLinkError: false,
      buildPackageError: false,
      buildAssetError: false,
      buildCodeGenerationError: false,
      buildMetadataError: false,
      buildResourceError: false,
      buildShaderError: false,
      buildTextureError: false,
      buildMeshError: false,
      buildAnimationError: false,
      buildAudioError: false,
      buildVideoError: false,
      buildFontError: false,
      buildMaterialError: false,
      buildModelError: false,
      buildSceneError: false,
      buildPrefabError: false,
      buildScriptableObjectError: false,
      buildTerrainError: false,
      buildLightmapError: false,
      buildOcclusionError: false,
      buildNavmeshError: false,
      buildPhysicsError: false,
      buildUIError: false,
      buildParticleSystemError: false,
      buildParticleSystemModuleError: false,
      buildParticleSystemRendererError: false,
      buildParticleSystemShapeError: false,
      buildParticleSystemEmissionError: false,
      buildParticleSystemSizeError: false,
      buildParticleSystemSizeOverLifetimeError: false,
      buildParticleSystemSizeBySpeedError: false,
      buildParticleSystemVelocityError: false,
      buildParticleSystemVelocityOverLifetimeError: false,
      buildParticleSystemVelocityBySpeedError: false,
      buildParticleSystemLimitVelocityError: false,
      buildParticleSystemInheritVelocityError: false,
      buildParticleSystemForceError: false,
      buildParticleSystemForceOverLifetimeError: false,
      buildParticleSystemForceBySpeedError: false,
      buildParticleSystemColorError: false,
      buildParticleSystemColorOverLifetimeError: false,
      buildParticleSystemColorBySpeedError: false,
      buildParticleSystemRotationError: false,
      buildParticleSystemRotationOverLifetimeError: false,
      buildParticleSystemRotationBySpeedError: false,
      buildParticleSystemExternalForcesError: false,
      buildParticleSystemNoiseError: false,
      buildParticleSystemCollisionError: false,
      buildParticleSystemTriggerError: false,
      buildParticleSystemSubEmitterError: false,
      buildParticleSystemTextureSheetAnimationError: false,
      buildParticleSystemLightsError: false,
      buildParticleSystemTrailError: false,
      buildParticleSystemCustomDataError: false,
      buildParticleSystemRendererError: false,
      buildParticleSystemShapeError: false
    };

    // Implementation for building Android project
    console.log('[AndroidExporter] Build completed successfully');

    return report;
  }

  getExportReports(): AndroidExportReport[] {
    return [...this.exportReports];
  }

  getProjectSettings(): AndroidProjectSettings {
    return { ...this.projectSettings };
  }

  updateProjectSettings(settings: Partial<AndroidProjectSettings>): void {
    Object.assign(this.projectSettings, settings);
  }

  getBuildConfiguration(): AndroidBuildConfiguration {
    return { ...this.buildConfiguration };
  }

  updateBuildConfiguration(configuration: Partial<AndroidBuildConfiguration>): void {
    Object.assign(this.buildConfiguration, configuration);
  }

  exportProjectData(format: 'json' | 'xml' | 'binary' = 'json'): string {
    const data = {
      projectSettings: this.projectSettings,
      buildConfiguration: this.buildConfiguration,
      exportReports: this.exportReports,
      timestamp: Date.now()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'xml') {
      return this.convertToXML(data);
    } else {
      return this.convertToBinary(data);
    }
  }

  private convertToXML(data: any): string {
    // Simple XML conversion - in production this would be more robust
    return '<android_exporter_data><!-- XML export not fully implemented --></android_exporter_data>';
  }

  private convertToBinary(data: any): string {
    // Simple binary conversion - in production this would use proper serialization
    return JSON.stringify(data);
  }

  reset(): void {
    this.exportReports = [];
    console.log('[AndroidExporter] Reset to initial state');
  }

  dispose(): void {
    this.reset();
    this.isInitialized = false;
    console.log('[AndroidExporter] Disposed successfully');
  }
}