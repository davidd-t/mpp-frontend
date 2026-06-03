import { describe, expect, it, vi } from 'vitest'

describe('main bootstrap', () => {
  it('mounts app when root exists', async () => {
    vi.resetModules()

    const renderMock = vi.fn()
    const createRootMock = vi.fn(() => ({ render: renderMock }))

    vi.doMock('react-dom/client', () => ({
      createRoot: createRootMock
    }))

    document.body.innerHTML = '<div id="root"></div>'

    await import('../main')

    expect(createRootMock).toHaveBeenCalledTimes(1)
    expect(renderMock).toHaveBeenCalledTimes(1)
  })

  it('throws when root does not exist', async () => {
    vi.resetModules()

    vi.doMock('react-dom/client', () => ({
      createRoot: vi.fn()
    }))

    document.body.innerHTML = ''

    await expect(import('../main')).rejects.toThrow('Root element not found')
  })
})
