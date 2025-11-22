'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo,
    Code
} from 'lucide-react'

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 mb-2 border-b border-gray-700 bg-gray-800 rounded-t-md">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('bold') ? 'bg-gray-700 text-white' : ''}`}
                title="Negrita"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('italic') ? 'bg-gray-700 text-white' : ''}`}
                title="Cursiva"
            >
                <Italic size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-white' : ''}`}
                title="Título 2"
            >
                <Heading1 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700 text-white' : ''}`}
                title="Título 3"
            >
                <Heading2 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('bulletList') ? 'bg-gray-700 text-white' : ''}`}
                title="Lista con viñetas"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('orderedList') ? 'bg-gray-700 text-white' : ''}`}
                title="Lista numerada"
            >
                <ListOrdered size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('blockquote') ? 'bg-gray-700 text-white' : ''}`}
                title="Cita"
            >
                <Quote size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-gray-700 text-gray-300 ${editor.isActive('codeBlock') ? 'bg-gray-700 text-white' : ''}`}
                title="Bloque de código"
            >
                <Code size={18} />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1 self-center"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                title="Deshacer"
            >
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                title="Rehacer"
            >
                <Redo size={18} />
            </button>
        </div>
    )
}

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="w-full border border-gray-600 rounded-md overflow-hidden bg-gray-900">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor
