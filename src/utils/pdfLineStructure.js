export function reconstructPdfPageText(items = [], yTolerance = 2) {
  const normalizedItems = items
    .map((item) => ({
      text: String(item?.str || '').trim(),
      x: Array.isArray(item?.transform) ? Number(item.transform[4] || 0) : 0,
      y: Array.isArray(item?.transform) ? Number(item.transform[5] || 0) : 0
    }))
    .filter((item) => item.text)
    .sort((left, right) => {
      if (Math.abs(left.y - right.y) > yTolerance) {
        return right.y - left.y
      }

      return left.x - right.x
    })

  const lines = []

  for (const item of normalizedItems) {
    const currentLine = lines[lines.length - 1]

    if (!currentLine || Math.abs(currentLine.y - item.y) > yTolerance) {
      lines.push({ y: item.y, items: [item] })
      continue
    }

    currentLine.items.push(item)
  }

  return lines
    .map((line) =>
      line.items
        .sort((left, right) => left.x - right.x)
        .map((item) => item.text)
        .join(' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n')
}
