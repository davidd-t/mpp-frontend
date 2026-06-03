import { useState } from 'react'
import { STATUSES, validate } from './model'

export default function CodebaseForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initialValues?.name ?? '',
    language: initialValues?.language ?? '',
    filesCount: initialValues?.filesCount ?? 0,
    status: initialValues?.status ?? 'indexed',
    path: initialValues?.path ?? '',
    embeddingModel: initialValues?.embeddingModel ?? '',
    summary: initialValues?.summary ?? ''
  })

  const [errors, setErrors] = useState(() => validate(values))

  function update(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function submit() {
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input value={values.name} onChange={(event) => update('name', event.target.value)} className="input" />
        </Field>

        <Field label="Language" error={errors.language}>
          <input value={values.language} onChange={(event) => update('language', event.target.value)} className="input" />
        </Field>

        <Field label="Files" error={errors.filesCount}>
          <input
            type="number"
            value={values.filesCount}
            onChange={(event) => update('filesCount', Number(event.target.value))}
            className="input"
          />
        </Field>

        <Field label="Status" error={errors.status}>
          <select value={values.status} onChange={(event) => update('status', event.target.value)} className="input">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Path" error={errors.path}>
          <input value={values.path} onChange={(event) => update('path', event.target.value)} className="input" />
        </Field>

        <Field label="Embedding" error={errors.embeddingModel}>
          <input value={values.embeddingModel} onChange={(event) => update('embeddingModel', event.target.value)} className="input" />
        </Field>

        <div className="md:col-span-2">
          <Field label="Summary" error={errors.summary}>
            <textarea rows={3} value={values.summary} onChange={(event) => update('summary', event.target.value)} className="input" />
          </Field>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button onClick={submit} className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            Save
          </button>
          <button type="button" onClick={onCancel} className="rounded border border-white/20 px-4 py-2 text-sm text-zinc-200 transition-all hover:bg-white/10 active:scale-95">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="grid gap-1 text-sm text-zinc-200">
      {label}
      {children}
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  )
}
