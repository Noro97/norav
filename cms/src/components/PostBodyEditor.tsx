'use client'

import { useRef, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { MediaPicker, type MediaItem } from './MediaPicker'
import { mediaDisplaySrc, toMediaRef } from '@/lib/media-refs'

type PickerCallback = (url: string, meta?: { alt?: string }) => void

/**
 * The rich-text editor for a post body — TinyMCE, served by this app.
 *
 * The toolbar is the whole vocabulary a post has: two heading levels, emphasis,
 * lists, quotes, links, code and images. No fonts, colours or alignment — the
 * site's typography decides those, and anything the toolbar cannot make is
 * stripped on save anyway (lib/sanitize-post). Images come from the media
 * library, by picking or by pasting and dropping, never as pasted base64.
 *
 * It receives and hands back the editing form of the HTML, where an image's
 * src is the admin redirect; the caller converts to and from what is stored.
 */
export function PostBodyEditor({
  initialHtml,
  disabled,
  onChange,
}: {
  initialHtml: string
  disabled?: boolean
  onChange: (html: string) => void
}) {
  const [picking, setPicking] = useState<PickerCallback | null>(null)
  // TinyMCE owns its document after mount; the prop only seeds it.
  const seed = useRef(initialHtml)

  return (
    <>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        initialValue={seed.current}
        disabled={disabled}
        onEditorChange={(html) => onChange(html)}
        init={{
          menubar: false,
          branding: false,
          promotion: false,
          skin: 'oxide-dark',
          content_css: 'dark',
          plugins: 'lists link image code codesample autolink wordcount autoresize',
          toolbar:
            'undo redo | blocks | bold italic code | bullist numlist blockquote | link image codesample | removeformat | code',
          block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3',
          min_height: 420,
          autoresize_bottom_margin: 40,
          // Links and image sources are kept exactly as written: the redirect
          // path must survive untouched to be turned back into a reference.
          convert_urls: false,
          relative_urls: false,
          link_default_target: '_self',
          image_caption: true,
          image_dimensions: false,
          paste_data_images: false,
          codesample_languages: [
            { text: 'TypeScript', value: 'ts' },
            { text: 'JavaScript', value: 'js' },
            { text: 'TSX', value: 'tsx' },
            { text: 'SQL', value: 'sql' },
            { text: 'Shell', value: 'bash' },
            { text: 'JSON', value: 'json' },
            { text: 'CSS', value: 'css' },
          ],
          content_style:
            'body { font-family: Inter Tight, -apple-system, system-ui, sans-serif; font-size: 16px; line-height: 1.65; max-width: 68ch; margin: 16px auto; } img { max-width: 100%; height: auto; }',
          file_picker_types: 'image',
          file_picker_callback: (callback) => setPicking(() => callback as PickerCallback),
          // A pasted or dropped image goes into the library like any upload,
          // and into the text as a reference to it.
          images_upload_handler: async (blob) => {
            const form = new FormData()
            form.append('file', blob.blob(), blob.filename())
            const response = await fetch('/api/admin/media', { method: 'POST', body: form })
            const body = await response.json().catch(() => null)
            if (!response.ok) throw new Error(body?.error?.message ?? 'Upload failed.')
            return mediaDisplaySrc(toMediaRef(body.data.id))
          },
        }}
      />

      {picking && (
        <MediaPicker
          onClose={() => setPicking(null)}
          onSelect={(item: MediaItem) => {
            picking(mediaDisplaySrc(toMediaRef(item.id)), { alt: item.alt?.en ?? '' })
            setPicking(null)
          }}
        />
      )}
    </>
  )
}
