import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScenariosPage } from './ScenariosPage';
import * as useGamesQueryModule from '../features/games/useGamesQuery';

vi.mock('../features/games/useGamesQuery');

const mockGame = {
  id: '1',
  name: 'Hanabi',
  slug: 'hanabi',
  status: 'owned' as const,
  hidden: false,
  buyPriority: null,
  bggId: 98778,
  bggUrl: 'https://boardgamegeek.com/boardgame/98778',
  bggRating: 7.2,
  bggWeight: 1.8,
  publishedYear: 2010,
  playersMin: 2,
  playersMax: 5,
  playTimeMin: 25,
  playTimeMax: 25,
  category: 'Card Game',
  summary: 'Co-op card game',
  notes: null,
  gapReason: null,
  recommendationVerdict: null,
  recommendationColour: null,
  tags: [
    { id: '1', slug: 'co-op', name: 'Co-op', tagType: 'mechanic' },
    { id: '2', slug: 'two-player', name: 'Two Player', tagType: 'player-count' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ScenariosPage', () => {
  it('shows loading state', () => {
    vi.mocked(useGamesQueryModule.useGamesQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <ScenariosPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading scenarios...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useGamesQueryModule.useGamesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as any);

    render(
      <BrowserRouter>
        <ScenariosPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/scenarios unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/supabase configuration/i)).toBeInTheDocument();
  });

  it('renders scenarios with matched games', () => {
    vi.mocked(useGamesQueryModule.useGamesQuery).mockReturnValue({
      data: [mockGame],
      isLoading: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <ScenariosPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Scenarios')).toBeInTheDocument();
    expect(screen.getByText(/Config-driven play suggestions/i)).toBeInTheDocument();
    expect(screen.getByText('💑')).toBeInTheDocument(); // Two-Player Night emoji
  });
});
