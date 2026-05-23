import pdfParse from 'pdf-parse'

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    ['txt', 'md', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json'].includes(ext)
  ) {
    return buffer.toString('utf-8')
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  return `[Unsupported file type: ${filename}. Text extraction skipped.]`
}
