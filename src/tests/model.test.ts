import { describe, expect, it } from 'vitest'
import { PAGE_SIZE, go, readHash, validate } from '../model'

describe('model helpers', () => {
  it('validates invalid fields', () => {
    const errors = validate({
      name: 'ab',
      language: '',
      filesCount: -1,
      status: 'indexed',
      path: '',
      embeddingModel: '',
      summary: 'bad'
    })

    expect(errors.name).toBeDefined()
    expect(errors.language).toBeDefined()
    expect(errors.filesCount).toBeDefined()
    expect(errors.path).toBeDefined()
    expect(errors.embeddingModel).toBeDefined()
    expect(errors.summary).toBeDefined()
  })

  it('returns no validation errors for valid values', () => {
    const errors = validate({
      name: 'backend-core',
      language: 'TypeScript',
      filesCount: 25,
      status: 'indexed',
      path: 'src/backend',
      embeddingModel: 'text-embedding-3-small',
      summary: 'Valid summary for this codebase.'
    })

    expect(errors).toEqual({})
  })

  it('PAGE_SIZE is 5', () => {
    expect(PAGE_SIZE).toBe(5)
  })

  it('reads hash path and strips query params', () => {
    window.location.hash = '#/dashboard?tab=all'
    expect(readHash()).toBe('/dashboard')
  })

  it('falls back to root and updates hash via go', () => {
    window.location.hash = ''
    expect(readHash()).toBe('/')

    go('/login')
    expect(window.location.hash).toBe('#/login')
  })
})
