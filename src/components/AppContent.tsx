import AuthPage from './AuthPage'
import AdminMonitoringPage from './AdminMonitoringPage'
import CodebaseDetailPage from './CodebaseDetailPage'
import DashboardPage from './DashboardPage'
import HomePage from './HomePage'
import { getCurrentUser } from '../auth'
import { go } from '../model'

export default function AppContent({ route, app }) {
  if (route === '/') return <HomePage />

  if (route === '/login' || route === '/register') {
    return <AuthPage route={route} />
  }

  // All routes below require authentication
  const user = getCurrentUser()
  if (!user) {
    go('/login')
    return null
  }

  if (route === '/admin') {
    return <AdminMonitoringPage />
  }

  if (route === '/dashboard') {
    return (
      <DashboardPage
        refreshKey={app.refreshKey}
        rows={app.rows}
        search={app.search}
        safePage={app.safePage}
        totalPages={app.totalPages}
        totalItems={app.totalItems}
        showCreate={app.showCreate}
        isAutoPopulateOn={app.isAutoPopulateOn}
        editingItem={app.editingItem}
        online={app.online}
        syncStatus={app.syncStatus}
        hasMore={app.hasMore}
        isLoadingMore={app.isLoadingMore}
        onToggleCreate={() => app.actions.setShowCreate((current) => !current)}
        onToggleAutoPopulate={app.actions.toggleAutoPopulate}
        onSearchChange={(value) => {
          app.actions.setSearch(value)
          app.actions.setPage(1)
        }}
        onEdit={(id) => {
          app.actions.setEditingId(id)
          app.actions.setShowCreate(false)
        }}
        onDelete={app.actions.deleteCodebase}
        onAdd={app.actions.addCodebase}
        onUpdate={app.actions.updateCodebase}
        onCancelForm={() => {
          app.actions.setShowCreate(false)
          app.actions.setEditingId(null)
        }}
        onLoadMore={app.actions.loadMore}
      />
    )
  }

  if (app.detailId) {
    return (
      <CodebaseDetailPage
        detailItem={app.detailItem}
        messages={app.messages}
        chatInput={app.chatInput}
        onChatInputChange={app.actions.setChatInput}
        onSendMessage={app.actions.sendMessage}
        onDelete={app.actions.deleteCodebase}
      />
    )
  }

  return null
}
