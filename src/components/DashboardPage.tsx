import DashboardFormPanel from './dashboard/DashboardFormPanel'
import DashboardHeader from './dashboard/DashboardHeader'
import DashboardSearch from './dashboard/DashboardSearch'
import DashboardTable from './dashboard/DashboardTable'
import DashboardChart from './dashboard/DashboardChart'
import OfflineBanner from './dashboard/OfflineBanner'

export default function DashboardPage({
  refreshKey,
  rows,
  search,
  safePage,
  totalPages,
  totalItems,
  showCreate,
  isAutoPopulateOn,
  editingItem,
  online,
  syncStatus,
  hasMore,
  isLoadingMore,
  onToggleCreate,
  onToggleAutoPopulate,
  onSearchChange,
  onEdit,
  onDelete,
  onAdd,
  onUpdate,
  onCancelForm,
  onLoadMore
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <OfflineBanner online={online} syncStatus={syncStatus} />
      <DashboardHeader
        onToggleCreate={onToggleCreate}
        onToggleAutoPopulate={onToggleAutoPopulate}
        isAutoPopulateOn={isAutoPopulateOn}
        online={online}
      />
      <DashboardFormPanel
        showCreate={showCreate}
        editingItem={editingItem}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onCancelForm={onCancelForm}
      />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full flex flex-col gap-4">
          <DashboardSearch search={search} onSearchChange={onSearchChange} />
          <DashboardTable
            rows={rows}
            onEdit={onEdit}
            onDelete={onDelete}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            totalItems={totalItems}
          />
        </div>

        <div className="w-full lg:w-96 shrink-0 mt-4 lg:mt-0">
          <DashboardChart refreshKey={refreshKey} />
        </div>
      </div>
    </main>
  )
}
