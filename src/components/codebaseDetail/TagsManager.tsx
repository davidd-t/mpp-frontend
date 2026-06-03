import { useState } from 'react'
import { api, type Tag } from '../../api'

const PRESET_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#ec4899']

export default function TagsManager({ codebaseId, tags, onTagsChange }: {
  codebaseId: string
  tags: Tag[]
  onTagsChange: (tags: Tag[]) => void
}) {
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editColor, setEditColor] = useState('')

  async function addTag() {
    if (!newLabel.trim()) return
    try {
      const tag = await api.createTag(codebaseId, { label: newLabel.trim(), color: newColor })
      onTagsChange([...tags, tag])
      setNewLabel('')
    } catch (err) {
      console.error('Failed to add tag', err)
    }
  }

  async function removeTag(tagId: string) {
    try {
      await api.deleteTag(tagId)
      onTagsChange(tags.filter((t) => t.id !== tagId))
    } catch (err) {
      console.error('Failed to remove tag', err)
    }
  }

  async function saveEdit(tagId: string) {
    try {
      const updated = await api.updateTag(tagId, { label: editLabel, color: editColor })
      onTagsChange(tags.map((t) => t.id === tagId ? updated : t))
      setEditingTag(null)
    } catch (err) {
      console.error('Failed to update tag', err)
    }
  }

  function startEdit(tag: Tag) {
    setEditingTag(tag.id)
    setEditLabel(tag.label)
    setEditColor(tag.color)
  }

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">Tags</h3>

      {/* Existing tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) =>
          editingTag === tag.id ? (
            <div key={tag.id} className="flex items-center gap-1 rounded-lg border border-white/20 bg-zinc-800 p-1.5">
              <input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-20 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <select
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="rounded bg-zinc-700 px-1 py-0.5 text-xs text-zinc-200 outline-none"
              >
                {PRESET_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={() => saveEdit(tag.id)} className="rounded bg-cyan-500 px-1.5 py-0.5 text-[10px] font-semibold text-black hover:bg-cyan-400">✓</button>
              <button onClick={() => setEditingTag(null)} className="rounded bg-zinc-600 px-1.5 py-0.5 text-[10px] text-zinc-200 hover:bg-zinc-500">✕</button>
            </div>
          ) : (
            <span
              key={tag.id}
              className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: tag.color + '25', color: tag.color, border: `1px solid ${tag.color}40` }}
            >
              {tag.label}
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(tag) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                title="Edit"
              >✎</button>
              <button
                onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] hover:text-rose-400"
                title="Delete"
              >✕</button>
            </span>
          )
        )}
        {tags.length === 0 && <span className="text-xs text-zinc-500">No tags yet</span>}
      </div>

      {/* Add new tag */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="New tag..."
            className="flex-1 rounded border border-white/15 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          />
          <button
            onClick={addTag}
            disabled={!newLabel.trim()}
            className="rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <div className="flex gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
