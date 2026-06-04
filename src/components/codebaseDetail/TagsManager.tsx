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
    <section className="border border-slate-800/80 bg-[#080f1e]/90 rounded-lg p-4 font-sans shadow-lg shadow-black/40">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300 border-b border-slate-800/80 pb-2 uppercase tracking-wider">
        <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
        Tags
      </h3>

      {/* Existing tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) =>
          editingTag === tag.id ? (
            <div key={tag.id} className="flex items-center gap-1.5 rounded-md bg-[#0c152a] p-2 border border-slate-800 ring-1 ring-cyan-500/20">
              <input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-16 rounded bg-[#040814]/50 border border-slate-800 px-2 py-1 text-[10px] font-mono text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <select
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="rounded bg-[#040814]/50 border border-slate-800 px-1 py-1 text-[10px] font-sans text-slate-200 outline-none"
              >
                {PRESET_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={() => saveEdit(tag.id)} className="rounded bg-blue-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer">✓</button>
              <button onClick={() => setEditingTag(null)} className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[9px] text-slate-400 hover:bg-slate-700 transition-colors cursor-pointer">✕</button>
            </div>
          ) : (
            <span
              key={tag.id}
              className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: tag.color + '15', color: tag.color, border: `1px solid ${tag.color}25` }}
            >
              {tag.label}
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(tag) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] hover:text-cyan-400"
                title="Edit"
              >✎</button>
              <button
                onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] hover:text-red-400"
                title="Delete"
              >✕</button>
            </span>
          )
        )}
        {tags.length === 0 && <span className="text-xs text-slate-500 font-sans">No tags yet</span>}
      </div>

      {/* Add new tag */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="New tag…"
            className="w-full rounded-md border border-slate-800/80 bg-[#040814]/40 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all"
          />
          <button
            onClick={addTag}
            disabled={!newLabel.trim()}
            className="border border-slate-800 bg-[#12203f]/50 text-slate-200 hover:bg-[#12203f] hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all shrink-0"
          >
            Add
          </button>
        </div>
        <div className="flex gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={`h-4.5 w-4.5 rounded-full transition-all hover:scale-110 cursor-pointer ${newColor === c ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#080f1e] scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
