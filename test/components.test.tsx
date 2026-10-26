import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Skeleton, EmptyState, ErrorBanner } from '../src/components/FiveStateView';
import { Footer } from '../src/components/Footer';

describe('UI Components & 5-State Views', () => {
  describe('Skeleton Component', () => {
    it('renders the requested count of skeleton placeholders', () => {
      const { container } = render(<Skeleton count={3} height="32px" />);
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(3);
      expect((skeletons[0] as HTMLElement).style.height).toBe('32px');
    });
  });

  describe('EmptyState Component', () => {
    it('renders title, description, and clickable action button', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="No Students Enrolled"
          description="Begin by adding students from the admissions pipeline."
          action={{ label: 'Add Student', onClick: handleClick }}
        />
      );

      expect(screen.getByText('No Students Enrolled')).toBeDefined();
      expect(screen.getByText('Begin by adding students from the admissions pipeline.')).toBeDefined();

      const button = screen.getByRole('button', { name: 'Add Student' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorBanner Component', () => {
    it('renders error message in an alert landmark with working retry action', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorBanner
          title="Network Connection Failed"
          message="Failed to synchronize records with the server."
          onRetry={handleRetry}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(screen.getByText('Network Connection Failed')).toBeDefined();
      expect(screen.getByText('Failed to synchronize records with the server.')).toBeDefined();

      const retryBtn = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer Component', () => {
    it('renders statutory registration, founding date, and dynamically computed service years', () => {
      render(
        <Footer
          foundedOn="2003-04-15"
          registrationNo="103 JJN 2003-04"
          board="Rajasthan Board of Secondary Education (RBSE)"
        />
      );

      const titles = screen.getAllByText(/Hemant Children Academy/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/103 JJN 2003-04/)).toBeDefined();
      expect(screen.getByText(/Rajasthan Board of Secondary Education/)).toBeDefined();
      expect(screen.getByText(/15 April 2003/)).toBeDefined();
      // Service years computed dynamically
      expect(screen.getByText(/years of holistic educational service/i)).toBeDefined();
      // Copyright year matches current calendar year
      const curYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`${curYear} Hemant Children Academy`))).toBeDefined();
    });
  });
});
