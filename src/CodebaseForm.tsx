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
      <div className="grid gap-4 md:grid-cols-2">
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

        <div className="md:col-span-2 flex gap-2.5 pt-1">
          <button onClick={submit} className="btn-primary">
            Save
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-slate-300">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  )
}
