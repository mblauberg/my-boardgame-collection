import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScenarioCoverageBadge } from './ScenarioCoverageBadge';

describe('ScenarioCoverageBadge', () => {
  it('shows no matches when all counts are zero', () => {
    render(<ScenarioCoverageBadge ownedCount={0} buyCount={0} recCount={0} />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('shows owned count', () => {
    render(<ScenarioCoverageBadge ownedCount={5} buyCount={0} recCount={0} />);
    expect(screen.getByText('5 owned')).toBeInTheDocument();
  });

  it('shows multiple status counts', () => {
    render(<ScenarioCoverageBadge ownedCount={3} buyCount={2} recCount={1} />);
    expect(screen.getByText('3 owned')).toBeInTheDocument();
    expect(screen.getByText('2 to buy')).toBeInTheDocument();
    expect(screen.getByText('1 rec')).toBeInTheDocument();
  });
});
