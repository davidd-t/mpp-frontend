import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '../components/HomePage'

describe('HomePage', () => {
  it('navigates to register and dashboard from CTA buttons', () => {
    window.location.hash = ''
    render(<HomePage />)

    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }))
    expect(window.location.hash).toBe('#/register')

    fireEvent.click(screen.getByRole('button', { name: 'View Dashboard' }))
    expect(window.location.hash).toBe('#/dashboard')
  })
})
