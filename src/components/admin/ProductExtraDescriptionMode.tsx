'use client'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { useField } from '@payloadcms/ui'

type DescriptionMode = 'visual' | 'html'

type LexicalTextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: 1
}

type LexicalElementNode = {
  children: LexicalTextNode[]
  direction: null
  format: string
  indent: number
  textFormat: number
  textStyle: string
  type: 'paragraph'
  version: 1
}

type LexicalHeadingNode = Omit<LexicalElementNode, 'type'> & {
  tag: 'h1' | 'h2' | 'h3' | 'h4'
  type: 'heading'
}

type LexicalListItemNode = {
  children: LexicalTextNode[]
  direction: null
  format: string
  indent: number
  type: 'listitem'
  value: number
  version: 1
}

type LexicalListNode = {
  children: LexicalListItemNode[]
  direction: null
  format: string
  indent: number
  listType: 'bullet' | 'number'
  start: number
  tag: 'ul' | 'ol'
  type: 'list'
  version: 1
}

type LexicalRootNode = {
  children: Array<LexicalElementNode | LexicalHeadingNode | LexicalListNode>
  direction: null
  format: string
  indent: number
  type: 'root'
  version: 1
}

type LexicalState = {
  root?: LexicalRootNode
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 1 << 1
const FORMAT_UNDERLINE = 1 << 3

const textNode = (text: string, format = 0): LexicalTextNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraphNode = (children: LexicalTextNode[]): LexicalElementNode => ({
  type: 'paragraph',
  children: children.length ? children : [textNode('')],
  direction: null,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const headingNode = (children: LexicalTextNode[], tag: 'h1' | 'h2' | 'h3' | 'h4'): LexicalHeadingNode => ({
  type: 'heading',
  tag,
  children: children.length ? children : [textNode('')],
  direction: null,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const listNode = (
  items: Array<LexicalTextNode[]>,
  listType: 'bullet' | 'number',
): LexicalListNode => ({
  type: 'list',
  tag: listType === 'number' ? 'ol' : 'ul',
  listType,
  start: 1,
  children: items.map((itemChildren, index) => ({
    type: 'listitem',
    value: index + 1,
    direction: null,
    format: '',
    indent: 0,
    version: 1,
    children: itemChildren.length ? itemChildren : [textNode('')],
  })),
  direction: null,
  format: '',
  indent: 0,
  version: 1,
})

const normalizeText = (text: string): string => text.replace(/\s+/g, ' ').trim()

const collectInlineTextNodes = (node: Node, inheritedFormat = 0): LexicalTextNode[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeText(node.textContent || '')
    return text ? [textNode(text, inheritedFormat)] : []
  }

  if (!(node instanceof HTMLElement)) return []

  const tag = node.tagName.toLowerCase()
  let nextFormat = inheritedFormat

  if (tag === 'strong' || tag === 'b') nextFormat |= FORMAT_BOLD
  if (tag === 'em' || tag === 'i') nextFormat |= FORMAT_ITALIC
  if (tag === 'u') nextFormat |= FORMAT_UNDERLINE

  if (tag === 'br') return [textNode('', nextFormat)]

  const textNodes: LexicalTextNode[] = []

  node.childNodes.forEach((child) => {
    textNodes.push(...collectInlineTextNodes(child, nextFormat))
  })

  return textNodes
}

const extractBlocksFromNode = (node: Node): Array<LexicalElementNode | LexicalHeadingNode | LexicalListNode> => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeText(node.textContent || '')
    return text ? [paragraphNode([textNode(text)])] : []
  }

  if (!(node instanceof HTMLElement)) return []

  const tag = node.tagName.toLowerCase()

  if (tag === 'p') {
    return [paragraphNode(collectInlineTextNodes(node))]
  }

  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
    return [headingNode(collectInlineTextNodes(node), tag)]
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(node.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((li) => collectInlineTextNodes(li))

    return items.length ? [listNode(items, tag === 'ol' ? 'number' : 'bullet')] : []
  }

  const blocks: Array<LexicalElementNode | LexicalHeadingNode | LexicalListNode> = []
  node.childNodes.forEach((child) => {
    blocks.push(...extractBlocksFromNode(child))
  })

  if (!blocks.length) {
    const textNodes = collectInlineTextNodes(node)
    if (textNodes.length) {
      blocks.push(paragraphNode(textNodes))
    }
  }

  return blocks
}

const htmlToLexicalState = (html: string): LexicalState => {
  if (!html.trim()) {
    return {
      root: {
        type: 'root',
        children: [paragraphNode([textNode('')])],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = Array.from(doc.body.childNodes).flatMap((node) => extractBlocksFromNode(node))

  if (!nodes.length) {
    nodes.push(paragraphNode([textNode('')]))
  }

  return {
    root: {
      type: 'root',
      children: nodes,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export const ProductExtraDescriptionMode = () => {
  const { value: modeValue, setValue: setModeValue } = useField<DescriptionMode>({
    path: 'descriptionMode',
  })
  const { value: richValue, setValue: setRichValue } = useField<LexicalState>({
    path: 'extraDescription',
  })
  const { value: htmlValue, setValue: setHTMLValue } = useField<string | null>({
    path: 'descriptionHTML',
  })

  const mode: DescriptionMode = modeValue === 'html' ? 'html' : 'visual'

  const switchMode = (nextMode: DescriptionMode) => {
    if (nextMode === mode) return

    if (nextMode === 'html') {
      if (richValue && typeof richValue === 'object' && richValue.root) {
        const generatedHTML = convertLexicalToHTML({
          data: richValue as never,
        })

        if (generatedHTML.trim()) {
          setHTMLValue(generatedHTML)
        }
      }
    } else if (nextMode === 'visual' && htmlValue && String(htmlValue).trim()) {
      setRichValue(htmlToLexicalState(String(htmlValue)))
    }

    setModeValue(nextMode)
  }

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Режим доп. описания</div>
      <div style={{ display: 'inline-flex', border: '1px solid var(--theme-elevation-250)', borderRadius: 8 }}>
        <button
          type="button"
          onClick={() => switchMode('visual')}
          style={{
            padding: '0.45rem 0.8rem',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'visual' ? 'var(--theme-elevation-200)' : 'transparent',
            color: 'var(--theme-text)',
            borderRadius: 8,
          }}
        >
          Визуальный редактор
        </button>
        <button
          type="button"
          onClick={() => switchMode('html')}
          style={{
            padding: '0.45rem 0.8rem',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'html' ? 'var(--theme-elevation-200)' : 'transparent',
            color: 'var(--theme-text)',
            borderRadius: 8,
          }}
        >
          HTML
        </button>
      </div>
    </div>
  )
}
