import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HorizontalShelf } from './HorizontalShelf';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Game } from '../../types/domain';

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: '1',
    name: 'Test Game 1',
    slug: 'test-game-1',
    bggId: null,
    bggUrl: null,
    status: 'archived',
    buyPriority: null,
    bggRating: 7.8,
    bggWeight: 2.5,
    bggRank: null,
    bggBayesAverage: null,
    bggUsersRated: 1000,
    isExpansion: null,
    abstractsRank: null,
    cgsRank: null,
    childrensGamesRank: null,
    familyGamesRank: null,
    partyGamesRank: null,
    strategyGamesRank: null,
    thematicRank: null,
    wargamesRank: null,
    bggDataSource: null,
    bggDataUpdatedAt: null,
    bggSnapshotPayload: null,
    playersMin: 2,
    playersMax: 4,
    playTimeMin: 30,
    playTimeMax: 60,
    category: null,
    summary: 'A test game',
    notes: null,
    recommendationVerdict: null,
    recommendationColour: null,
    gapReason: null,
    isExpansionIncluded: false,
    imageUrl: null,
    publishedYear: 2023,
    hidden: false,
    createdAt: '2026-04-09T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z',
    tags: [],
    ...overrides,
  };
}

const mockGames = [makeGame()];

describe('HorizontalShelf', () => {
  it('renders shelf with games', () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HorizontalShelf
            title="Test Shelf"
            description="Test description"
            entries={mockGames}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Shelf')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // game count badge
  });

  it('does not render when entries are empty', () => {
    const queryClient = new QueryClient();
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HorizontalShelf
            title="Empty Shelf"
            entries={[]}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
