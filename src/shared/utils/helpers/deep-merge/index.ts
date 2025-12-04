function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function isArray(item: any): boolean {
  return Array.isArray(item)
}

export function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) {
    return target
  }


  if (target === null || target === undefined) {
    return source
  }

  if (isArray(target) && isArray(source)) {
    const output = [...target]

    source.forEach((item: unknown, index: number) => {
      if (item !== null && item !== undefined) {
        if (isObject(item) && isObject(output[index])) {
          output[index] = deepMerge(output[index], item)
        } else if (isArray(item) && isArray(output[index])) {
          output[index] = deepMerge(output[index], item)
        } else {
          output[index] = item
        }
      }
    })

    return output
  }

  if (isObject(target) && isObject(source)) {
    const output = { ...target }

    Object.keys(source).forEach(key => {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (sourceValue === null || sourceValue === undefined) {
        return
      }

      if (isArray(sourceValue)) {
        output[key] = deepMerge(targetValue || [], sourceValue)
      } else if (isObject(sourceValue)) {
        output[key] = deepMerge(targetValue || {}, sourceValue)
      } else {
        output[key] = sourceValue
      }
    })

    return output
  }

  return source
}
