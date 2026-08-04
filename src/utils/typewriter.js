function splitCharacters(text) {
  return Array.from(text)
}

export function createTypewriter({ interval = 30, onUpdate }) {
  let renderedText = ''
  let queue = []
  let timer = null
  let cancelled = false
  let drainResolvers = []

  const resolveDrain = () => {
    if (timer || queue.length > 0) return
    drainResolvers.forEach((resolve) => resolve(renderedText))
    drainResolvers = []
  }

  const scheduleNextCharacter = () => {
    if (cancelled || timer || queue.length === 0) {
      resolveDrain()
      return
    }

    timer = setTimeout(() => {
      timer = null
      const nextCharacter = queue.shift()

      if (nextCharacter !== undefined) {
        renderedText += nextCharacter
        onUpdate(renderedText)
      }

      scheduleNextCharacter()
    }, interval)
  }

  const enqueue = (text) => {
    if (cancelled || !text) return
    queue.push(...splitCharacters(text))
    scheduleNextCharacter()
  }

  const replace = (text) => {
    if (cancelled) return

    let commonPrefixLength = 0
    while (
      commonPrefixLength < renderedText.length &&
      commonPrefixLength < text.length &&
      renderedText[commonPrefixLength] === text[commonPrefixLength]
    ) {
      commonPrefixLength += 1
    }

    const commonPrefix = text.slice(0, commonPrefixLength)
    if (commonPrefix !== renderedText) {
      renderedText = commonPrefix
      onUpdate(renderedText)
    }

    queue = splitCharacters(text.slice(commonPrefixLength))
    scheduleNextCharacter()
  }

  const drain = () => {
    if (!timer && queue.length === 0) return Promise.resolve(renderedText)

    return new Promise((resolve) => {
      drainResolvers.push(resolve)
    })
  }

  const cancel = () => {
    cancelled = true
    queue = []
    if (timer) clearTimeout(timer)
    timer = null
    resolveDrain()
  }

  return { cancel, drain, enqueue, replace }
}
