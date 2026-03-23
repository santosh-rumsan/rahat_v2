/**
 * Resolves %%variable%% placeholders in a service body template.
 *
 * - String values: replaces %%key%% with the corresponding string value.
 * - Array expansion: when an array element is exactly "%%key%%" and the
 *   variable value is a string[], the placeholder element is replaced
 *   (spread) with all values in that array.
 */
export function resolveServiceBody(
  node: unknown,
  vars: Record<string, string | string[]>,
): unknown {
  if (Array.isArray(node)) {
    const result: unknown[] = []
    for (const item of node) {
      if (typeof item === 'string') {
        const key = extractPlaceholderKey(item)
        if (key !== null && key in vars && Array.isArray(vars[key])) {
          // Expand array placeholder inline
          result.push(...(vars[key] as string[]))
        } else {
          result.push(replaceStringVars(item, vars))
        }
      } else {
        result.push(resolveServiceBody(item, vars))
      }
    }
    return result
  }

  if (node !== null && typeof node === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      result[k] = resolveServiceBody(v, vars)
    }
    return result
  }

  if (typeof node === 'string') {
    return replaceStringVars(node, vars)
  }

  return node
}

function extractPlaceholderKey(s: string): string | null {
  const m = s.match(/^%%(\w+)%%$/)
  return m ? m[1] : null
}

function replaceStringVars(s: string, vars: Record<string, string | string[]>): string {
  return s.replace(/%%(\w+)%%/g, (_, key: string) => {
    const val = vars[key]
    if (val === undefined) return `%%${key}%%`
    if (Array.isArray(val)) return val.join(',')
    return val
  })
}
