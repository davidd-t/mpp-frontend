import CodebaseForm from '../../CodebaseForm'

export default function DashboardFormPanel({
  showCreate,
  editingItem,
  onAdd,
  onUpdate,
  onCancelForm
}) {
  if (!showCreate && !editingItem) return null

  return (
    <div className="glass-card mb-6 p-6 animate-[slide-up-fade_0.3s_ease-out] border border-slate-800/80 shadow-2xl shadow-cyan-500/5 relative z-10 font-mono">
      <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800/80 pb-2">
        {editingItem ? `Edit ${editingItem.name}` : 'Add codebase'}
      </h3>
      <CodebaseForm
        key={editingItem?.id ?? 'create'}
        initialValues={editingItem ?? undefined}
        onSubmit={(values) => {
          if (editingItem) {
            onUpdate(editingItem.id, values)
          } else {
            onAdd(values)
          }
        }}
        onCancel={onCancelForm}
      />
    </div>
  )
}
