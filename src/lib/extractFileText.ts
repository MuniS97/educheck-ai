import * as pdfjs from 'pdfjs-dist'
import mammoth from 'mammoth'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const MAX_CHARS = 900_000 // stay under Firestore 1MB doc limit

async function extractPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const parts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    if (pageText.trim()) parts.push(pageText)
  }

  return parts.join('\n\n')
}

async function extractDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

async function extractPlainText(file: File): Promise<string> {
  return file.text()
}

/**
 * Extract text from files in the browser (no Firebase Storage needed).
 * Works on Spark/free Firebase plan.
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  const parts: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    try {
      let text = ''
      if (file.type === 'application/pdf' || ext === 'pdf') {
        text = await extractPdf(file)
      } else if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === 'docx'
      ) {
        text = await extractDocx(file)
      } else if (
        file.type.startsWith('text/') ||
        ['txt', 'md', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'json', 'html', 'css', 'c', 'cpp'].includes(
          ext,
        )
      ) {
        text = await extractPlainText(file)
      } else if (ext === 'pptx') {
        text = `[${file.name}: PPTX text extraction not supported in browser — paste content as text.]`
      } else {
        text = `[${file.name}: unsupported type — paste content as text.]`
      }

      if (text.trim()) {
        parts.push(`--- ${file.name} ---\n${text.trim()}`)
      }
    } catch {
      parts.push(`--- ${file.name} ---\n[Could not read this file.]`)
    }
  }

  const combined = parts.join('\n\n')
  if (combined.length > MAX_CHARS) {
    return combined.slice(0, MAX_CHARS) + '\n\n[Content truncated — file too large for storage.]'
  }
  return combined
}

export function getFileNames(files: File[]): string[] {
  return files.map((f) => f.name)
}
