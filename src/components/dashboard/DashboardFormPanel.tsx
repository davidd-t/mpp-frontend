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
    <div className="mb-5 rounded-lg border border-white/10 bg-zinc-900 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">{editingItem ? `Edit ${editingItem.name}` : 'Add codebase'}</h3>
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
