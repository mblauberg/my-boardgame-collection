import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScenarioEmptyState } from './ScenarioEmptyState';

describe('ScenarioEmptyState', () => {
  it('renders empty state message with preset label', () => {
    render(<ScenarioEmptyState presetLabel="Two-Player Night" />);
    expect(screen.getByText(/No games match the Two-Player Night scenario yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Check your buy list or recommendations/i)).toBeInTheDocument();
  });
});
