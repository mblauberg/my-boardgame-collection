import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScenarioAccordion } from './ScenarioAccordion';
import userEvent from '@testing-library/user-event';

const mockPreset = {
  id: 'test-preset',
  emoji: '🎲',
  label: 'Test Preset',
  description: 'A test preset',
  sections: [
    {
      id: 'section-1',
      label: 'Section 1',
      description: 'First section',
      games: [
        {
          id: '1',
          name: 'Game A',
          slug: 'game-a',
          status: 'owned' as const,
          tags: ['co-op'],
          bgg_rating: 8.0,
        },
      ],
    },
  ],
};

describe('ScenarioAccordion', () => {
  it('renders preset cards with game counts', () => {
    render(
      <BrowserRouter>
        <ScenarioAccordion presets={[mockPreset]} />
      </BrowserRouter>
    );
    expect(screen.getByText('🎲')).toBeInTheDocument();
    expect(screen.getByText('Test Preset')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('expands and collapses on click', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ScenarioAccordion presets={[mockPreset]} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Section 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Test Preset/i }));
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Game A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Test Preset/i }));
    expect(screen.queryByText('Section 1')).not.toBeInTheDocument();
  });

  it('shows empty state when no games match', async () => {
    const user = userEvent.setup();
    const emptyPreset = {
      ...mockPreset,
      sections: [{ ...mockPreset.sections[0], games: [] }],
    };

    render(
      <BrowserRouter>
        <ScenarioAccordion presets={[emptyPreset]} />
      </BrowserRouter>
    );

    await user.click(screen.getByRole('button', { name: /Test Preset/i }));
    expect(screen.getByText(/No games match the Test Preset scenario yet/i)).toBeInTheDocument();
  });
});
