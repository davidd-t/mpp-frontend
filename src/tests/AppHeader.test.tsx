import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppHeader from '../components/AppHeader'

describe('AppHeader', () => {
  it('shows Sign in on home and navigates to login', () => {
    window.location.hash = ''
    render(<AppHeader route="/" />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(window.location.hash).toBe('#/login')
  })

  it('shows Back to home on non-home route and navigates home', () => {
    window.location.hash = '#/dashboard'
    render(<AppHeader route="/dashboard" />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to home' }))
    expect(window.location.hash).toBe('#/')
  })

  it('logo button navigates home', () => {
    window.location.hash = '#/login'
    render(<AppHeader route="/login" />)

    fireEvent.click(screen.getByRole('button', { name: /SourceStream/i }))
    expect(window.location.hash).toBe('#/')
  })
})
