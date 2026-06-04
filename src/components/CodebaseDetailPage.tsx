import { useEffect, useState } from 'react'
import ChatPanel from './codebaseDetail/ChatPanel'
// import ChatRoom from './ChatRoom'
import CodeViewPanel from './codebaseDetail/CodeViewPanel'
import DetailHeader from './codebaseDetail/DetailHeader'
import FilesSidebar from './codebaseDetail/FilesSidebar'
import TagsManager from './codebaseDetail/TagsManager'
import type { Tag } from '../api'

export default function CodebaseDetailPage({
  detailItem,
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  onDelete
}) {
  const [tags, setTags] = useState<Tag[]>(detailItem?.tags || [])

  useEffect(() => {
    if (detailItem?.tags) setTags(detailItem.tags)
  }, [detailItem])

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <DetailHeader detailItem={detailItem} onDelete={onDelete} />

      {detailItem && (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-4">
            <FilesSidebar />
            <TagsManager
              codebaseId={detailItem.id}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>

          <div className="grid gap-4">
            <CodeViewPanel />
            <ChatPanel
              messages={messages}
              chatInput={chatInput}
              onChatInputChange={onChatInputChange}
              onSendMessage={onSendMessage}
            />
            {/* <ChatRoom room={`codebase-${detailItem.id}`} /> */}
          </div>
        </div>
      )}
    </main>
  )
}
