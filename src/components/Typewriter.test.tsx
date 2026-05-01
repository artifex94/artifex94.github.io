import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Typewriter } from './Typewriter';

beforeEach(() => {
  sessionStorage.clear();
});

describe('Typewriter', () => {
  it('renders without crashing', () => {
    render(<Typewriter text="Hello" />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows full text immediately on repeat visit (sessionStorage set)', () => {
    sessionStorage.setItem('artifex_system_init', 'true');
    render(<Typewriter text="Full text" />);
    expect(screen.getByText('Full text')).toBeInTheDocument();
  });

  it('applies custom className to the outer span', () => {
    sessionStorage.setItem('artifex_system_init', 'true');
    const { container } = render(<Typewriter text="Test" className="my-custom-class" />);
    expect(container.querySelector('.my-custom-class')).toBeInTheDocument();
  });

  it('types out text on first visit using fake timers', () => {
    vi.useFakeTimers();
    render(<Typewriter text="Hi" delay={0} />);

    act(() => { vi.advanceTimersByTime(3000); });

    expect(document.body.textContent).toContain('Hi');

    vi.useRealTimers();
  });

  it('does not show cursor on repeat visit', () => {
    sessionStorage.setItem('artifex_system_init', 'true');
    render(<Typewriter text="No cursor" />);
    // Cursor is a motion.span containing "_"
    expect(screen.queryByText('_')).not.toBeInTheDocument();
  });
});
