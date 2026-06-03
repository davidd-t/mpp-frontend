import { go } from '../model'
import { useChatState, useCodebaseDetail, useCodebasesState } from './useAppState/index'

export default function useAppState(route) {
  const {
    rows,
    search,
    safePage,
    totalPages,
    totalItems,
    showCreate,
    isPopulating,
    isAutoPopulateOn,
    editingItem,
    refreshKey,
    online,
    syncStatus,
    hasMore,
    isLoadingMore,
    setSearch,
    setPage,
    setShowCreate,
    setEditingId,
    addCodebase,
    updateCodebase,
    deleteCodebaseById,
    populateWithFaker,
    toggleAutoPopulate,
    loadMore
  } = useCodebasesState()

  const { detailId, detailItem } = useCodebaseDetail(route)

  const { chatInput, messages, setChatInput, sendMessage } = useChatState(detailItem)

  function deleteCodebase(id) {
    deleteCodebaseById(id)
    if (route === `/codebases/${id}`) {
      go('/dashboard')
    }
  }

  return {
    detailId,
    detailItem,
    rows,
    search,
    safePage,
    totalPages,
    totalItems,
    showCreate,
    isPopulating,
    isAutoPopulateOn,
    editingItem,
    refreshKey,
    online,
    syncStatus,
    hasMore,
    isLoadingMore,
    messages,
    chatInput,
    actions: {
      setSearch,
      setPage,
      setShowCreate,
      setEditingId,
      setChatInput,
      addCodebase,
      updateCodebase,
      deleteCodebase,
      populateWithFaker,
      toggleAutoPopulate,
      sendMessage,
      loadMore
    }
  }
}
