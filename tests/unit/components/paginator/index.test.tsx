import {render, fireEvent, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeAll} from 'vitest';
import '@testing-library/jest-dom/vitest';

import Paginator from '../../../../src/components/paginator';

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '10'
  } as any);
});

describe('Paginator', () => {
  it('renders items and footnote', () => {
    const handleClick = vi.fn();
    const {getByText} = render(
      <Paginator currentSelected="A" footnote="foot">
        <Paginator.Item name="A" onClick={handleClick}>A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText('foot')).toBeInTheDocument();
  });

  it('renders without footnote', () => {
    const {queryByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
      </Paginator>
    );
    // Footnote div should not exist when footnote prop is not provided
    expect(queryByText('foot')).not.toBeInTheDocument();
  });

  it('applies inverse color class when inverseColor is true', () => {
    const {container} = render(
      <Paginator currentSelected="A" inverseColor>
        <Paginator.Item name="A">A</Paginator.Item>
      </Paginator>
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('inverse-color');
  });

  it('does not apply inverse color class by default', () => {
    const {container} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
      </Paginator>
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).not.toContain('inverse-color');
  });

  it('applies custom className', () => {
    const {container} = render(
      <Paginator currentSelected="A" className="custom-class">
        <Paginator.Item name="A">A</Paginator.Item>
      </Paginator>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('displays current selected item in description', () => {
    const {getByText} = render(
      <Paginator currentSelected="Item A">
        <Paginator.Item name="Item A">A</Paginator.Item>
        <Paginator.Item name="Item B">B</Paginator.Item>
      </Paginator>
    );
    expect(getByText(/1\.\s+Item A/)).toBeInTheDocument();
  });

  it('updates description on hover', () => {
    const {container, getByText} = render(
      <Paginator currentSelected="Item A">
        <Paginator.Item name="Item A">A</Paginator.Item>
        <Paginator.Item name="Item B">B</Paginator.Item>
      </Paginator>
    );
    
    const itemB = getByText('B').closest('li');
    fireEvent.mouseEnter(itemB!);
    
    expect(getByText(/2\.\s+Item B/)).toBeInTheDocument();
  });

  it('sets data-is-hovering attribute when hovering', () => {
    const {container, getByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    
    const desc = container.querySelector('[data-is-hovering]');
    expect(desc).toHaveAttribute('data-is-hovering', 'false');
    
    const itemB = getByText('B').closest('li');
    fireEvent.mouseEnter(itemB!);
    
    expect(desc).toHaveAttribute('data-is-hovering', 'true');
  });

  it('sets data-is-hovering-selected when hovering selected item', () => {
    const {container, getByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    
    const desc = container.querySelector('[data-is-hovering-selected]');
    const itemA = getByText('A').closest('li');
    
    fireEvent.mouseEnter(itemA!);
    expect(desc).toHaveAttribute('data-is-hovering-selected', 'true');
  });

  it('renders scroll bar when items exceed display limit', () => {
    const {container} = render(
      <Paginator currentSelected="A">
        {Array.from({length: 15}, (_, i) => (
          <Paginator.Item key={i} name={`Item ${i}`}>
            {`Item ${i}`}
          </Paginator.Item>
        ))}
      </Paginator>
    );
    // ScrollBar component renders a draggable div
    const scrollbar = container.querySelector('div[draggable="true"]');
    expect(scrollbar).toBeInTheDocument();
  });

  it('does not render scroll bar when items are within display limit', () => {
    const {container} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    const scrollbar = container.querySelector('div[draggable="true"]');
    expect(scrollbar).not.toBeInTheDocument();
  });

  it('renders forward and backward arrows', () => {
    const {getByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    expect(getByText('Prev')).toBeInTheDocument();
    expect(getByText('Next')).toBeInTheDocument();
  });

  it('handles items with href', () => {
    const {getByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A" href="#a">A</Paginator.Item>
        <Paginator.Item name="B" href="#b">B</Paginator.Item>
      </Paginator>
    );
    const linkA = getByText('A').closest('a');
    expect(linkA).toHaveAttribute('href', '#a');
  });

  it('calculates correct hover offset when hovering item after selected', () => {
    const {container, getByText} = render(
      <Paginator currentSelected="A">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
        <Paginator.Item name="C">C</Paginator.Item>
      </Paginator>
    );
    
    const itemC = getByText('C').closest('li');
    fireEvent.mouseEnter(itemC!);
    
    const nav = container.querySelector('nav');
    const hoverOffset = (nav as HTMLElement).style.getPropertyValue('--hover-offset');
    expect(hoverOffset).toBeTruthy();
  });

  it('calculates correct hover offset when hovering item before selected', () => {
    const {container, getByText} = render(
      <Paginator currentSelected="C">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
        <Paginator.Item name="C">C</Paginator.Item>
      </Paginator>
    );
    
    const itemA = getByText('A').closest('li');
    fireEvent.mouseEnter(itemA!);
    
    const nav = container.querySelector('nav');
    const hoverOffset = (nav as HTMLElement).style.getPropertyValue('--hover-offset');
    expect(hoverOffset).toBeTruthy();
  });

  it('handles empty currentSelected gracefully', () => {
    const {getByText} = render(
      <Paginator>
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    expect(getByText('A')).toBeInTheDocument();
  });

  it('sets CSS custom properties correctly', () => {
    const {container} = render(
      <Paginator currentSelected="B">
        <Paginator.Item name="A">A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
        <Paginator.Item name="C">C</Paginator.Item>
      </Paginator>
    );
    
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.style.getPropertyValue('--total')).toBe('3');
    expect(nav.style.getPropertyValue('--display-nums')).toBe('10');
  });
});
