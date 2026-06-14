/**
 * Lightweight word splitter for GSAP stagger animations.
 * No paid GSAP SplitText required.
 *
 * Usage (DOM):
 *   splitTextDOM(element)  → wraps each word in .word-clip > .word-inner spans
 *
 * Usage (React):
 *   splitTextReact(str)    → returns an array of JSX-safe word objects
 */

export interface SplitWord {
  word: string
  index: number
  total: number
}

/**
 * Returns metadata for each word in the string.
 * React components use this to render word spans.
 */
export function splitTextWords(text: string): SplitWord[] {
  const words = text.split(/\s+/).filter(Boolean)
  return words.map((word, index) => ({
    word,
    index,
    total: words.length,
  }))
}

/**
 * Wraps words in a DOM element in overflow-hidden spans
 * so GSAP can stagger-translate them in from below.
 *
 * Structure per word:
 *   <span class="word-clip">
 *     <span class="word-inner">word</span>
 *   </span>
 *
 * Returns the array of inner span elements for GSAP targeting.
 */
export function splitTextDOM(el: HTMLElement): HTMLElement[] {
  const originalHTML = el.textContent ?? ''
  const words = originalHTML.split(/\s+/).filter(Boolean)

  el.innerHTML = words
    .map(
      (word) =>
        `<span class="word-clip"><span class="word-inner">${word}</span></span> `
    )
    .join('')

  return Array.from(el.querySelectorAll('.word-inner')) as HTMLElement[]
}

/**
 * Splits text into lines by grouping words that fit within a container width.
 * Returns line arrays of word strings.
 * NOTE: Relies on a rendered DOM element — call after layout is complete.
 */
export function splitTextLines(el: HTMLElement): string[][] {
  const words = splitTextDOM(el)
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentTop: number | null = null

  words.forEach((wordEl) => {
    const rect = wordEl.getBoundingClientRect()
    if (currentTop === null) {
      currentTop = rect.top
    }

    if (Math.abs(rect.top - currentTop) > 5) {
      lines.push([...currentLine])
      currentLine = []
      currentTop = rect.top
    }

    currentLine.push(wordEl.textContent ?? '')
  })

  if (currentLine.length) {
    lines.push(currentLine)
  }

  return lines
}
