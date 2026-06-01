// src/utils/performance.js

export function measureFPS(duration = 1000) {
  return new Promise((resolve) => {
    let frames = 0
    let lastTime = performance.now()

    const count = () => {
      frames++
      const now = performance.now()
      if (now - lastTime >= duration) {
        resolve(frames / (duration / 1000))
      } else {
        requestAnimationFrame(count)
      }
    }

    requestAnimationFrame(count)
  })
}

export function detectDeviceCapability() {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  return {
    hasWebGL: !!gl,
    devicePixelRatio: window.devicePixelRatio,
    cores: navigator.hardwareConcurrency || 4,
    memory: navigator.deviceMemory || 4,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  }
}

export function getPerformanceConfig() {
  const capability = detectDeviceCapability()

  // Low-end device detection
  if (capability.isMobile && capability.memory < 4) {
    return {
      maxParticles: 30,
      particleQuality: 'low',
      disableShimmer: true,
      reducedAnimations: true,
    }
  }

  // Mid-range
  if (capability.cores < 4 || capability.devicePixelRatio < 2) {
    return {
      maxParticles: 45,
      particleQuality: 'medium',
      disableShimmer: false,
      reducedAnimations: false,
    }
  }

  // High-end
  return {
    maxParticles: 60,
    particleQuality: 'high',
    disableShimmer: false,
    reducedAnimations: false,
  }
}
