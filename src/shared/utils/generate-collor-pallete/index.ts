type ColorVariants = {
  ultraLight: string
  tint: string
  original: string
  shade: string
  deep: string
}

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function generateColorVariants(hex: string): ColorVariants {
  const [h, s, l] = hexToHsl(hex)

  // ultraLight: very washed out, close to white — high lightness, low saturation
  const ultraLight = hslToHex(h, clamp(s * 0.4, 10, 50), clamp(l + 35, 85, 97))

  // tint: lighter but still recognizable — bumps lightness, softens saturation slightly
  const tint = hslToHex(h, clamp(s * 0.8, 20, 90), clamp(l + 18, 60, 85))

  // shade: darker, richer version — drops lightness, keeps saturation
  const shade = hslToHex(h, clamp(s * 1.05, 20, 100), clamp(l - 18, 20, 60))

  // deep: much darker, almost shadow-like — significantly drops lightness
  const deep = hslToHex(h, clamp(s * 0.9, 15, 90), clamp(l - 38, 8, 35))

  return {
    ultraLight,
    tint,
    original: hex,
    shade,
    deep
  }
}
