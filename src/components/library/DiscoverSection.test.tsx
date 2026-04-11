import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscoverSection } from './DiscoverSection';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Game } from '../../types/domain';

vi.mock('../../hooks/useInView', () => ({
  useInView: () => ({ ref: { current: null }, isInView: true }),
}));

vi.mock('./HorizontalShelf', () => ({
  HorizontalShelf: ({ title }: { title: string }) => <div>{title}</div>,
}));

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: '1',
    name: 'Game 1',
    slug: 'game-1',
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
    summary: null,
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

const mockShelves = [
  {
    id: 'shelf-1',
    title: 'Shelf 1',
    description: 'First shelf',
    entries: [makeGame()],
  },
];

describe('DiscoverSection', () => {
  it('renders collapsed by default', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiscoverSection
            title="Test Section"
            emoji="🎮"
            description="Test description"
            shelves={mockShelves}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test section/i })).toHaveClass('glass-surface-panel');
    expect(screen.queryByText('Shelf 1')).not.toBeInTheDocument();
  });

  it('expands when clicked', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiscoverSection
            title="Test Section"
            emoji="🎮"
            description="Test description"
            shelves={mockShelves}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Shelf 1')).toBeInTheDocument();
  });

  it('does not render when no games', () => {
    const queryClient = new QueryClient();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiscoverSection
            title="Empty Section"
            emoji="🎮"
            description="Empty"
            shelves={[{ id: 'empty', title: 'Empty', description: 'Empty', entries: [] }]}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
