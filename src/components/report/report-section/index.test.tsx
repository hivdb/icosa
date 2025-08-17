import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';

import ReportSection from './index';

describe('ReportSection', () => {
  it('calls toggleDisplay when collapsable button clicked', () => {
    const toggle = vi.fn();
    render(
      <ReportSection
        title="Section"
        collapsable
        display
        toggleDisplay={toggle}
      >
        <div>content</div>
      </ReportSection>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalled();
  });

  it('renders title annotation when provided', () => {
    render(
      <ReportSection title="Section" titleAnnotation={<span>note</span>}>
        <div>content</div>
      </ReportSection>
    );
    expect(screen.getByText('note')).toBeInTheDocument();
  });
});
