import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeAll, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import ScrollBar from '../../../../src/components/paginator/scroll-bar';

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '10'
  } as any);
});

describe('ScrollBar', () => {
  let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getBoundingClientRectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    getBoundingClientRectSpy.mockReturnValue({
      left: 100,
      right: 200,
      top: 0,
      bottom: 0,
      width: 100,
      height: 20,
      x: 100,
      y: 0,
      toJSON: () => ({})
    });
  });

  it('calls onScroll when clicked', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const div = container.firstChild as HTMLElement;
    fireEvent.mouseDown(div, {clientX: 155});
    expect(onScroll).toHaveBeenCalled();
  });

  it('does not call onScroll when clicking on child element', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Create a mock event where target !== currentTarget
    const event = new MouseEvent('mousedown', {bubbles: true, clientX: 155});
    Object.defineProperty(event, 'target', {value: scrollbar, writable: false});
    Object.defineProperty(event, 'currentTarget', {value: container.firstChild, writable: false});
    
    fireEvent(container.firstChild as HTMLElement, event);
    expect(onScroll).not.toHaveBeenCalled();
  });

  it('calculates step offset based on click position', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const div = container.firstChild as HTMLElement;
    
    // Click at position that should result in positive offset
    fireEvent.mouseDown(div, {clientX: 165});
    expect(onScroll).toHaveBeenCalledWith(expect.any(Number));
  });

  it('handles drag start event', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {
      setDragImage: vi.fn()
    };
    
    fireEvent(scrollbar, dragStartEvent);
    expect(dragStartEvent.dataTransfer.setDragImage).toHaveBeenCalled();
  });

  it('sets up drag handlers on scrollbar element', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Verify scrollbar is draggable
    expect(scrollbar).toHaveAttribute('draggable', 'true');
    
    // Start drag to verify handler exists
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {setDragImage: vi.fn()};
    
    // Should not throw
    expect(() => fireEvent(scrollbar, dragStartEvent)).not.toThrow();
    expect(dragStartEvent.dataTransfer.setDragImage).toHaveBeenCalled();
  });

  it('ignores drag event when buttons are 0', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {setDragImage: vi.fn()};
    fireEvent(scrollbar, dragStartEvent);
    
    onScroll.mockClear();
    
    // Drag without buttons pressed
    const dragEvent = new Event('drag', {bubbles: true}) as any;
    dragEvent.clientX = 160;
    dragEvent.buttons = 0;
    fireEvent(scrollbar, dragEvent);
    
    expect(onScroll).not.toHaveBeenCalled();
  });

  it('ignores drag event when clientX jumps too far', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Mock document.body.clientWidth
    Object.defineProperty(document.body, 'clientWidth', {
      value: 1000,
      writable: true,
      configurable: true
    });
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {setDragImage: vi.fn()};
    fireEvent(scrollbar, dragStartEvent);
    
    onScroll.mockClear();
    
    // Drag with huge jump (more than half clientWidth)
    const dragEvent = new Event('drag', {bubbles: true}) as any;
    dragEvent.clientX = 800;
    dragEvent.buttons = 1;
    fireEvent(scrollbar, dragEvent);
    
    expect(onScroll).not.toHaveBeenCalled();
  });

  it('updates step offset when dragging across multiple steps', () => {
    const onScroll = vi.fn().mockReturnValue(true);
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {setDragImage: vi.fn()};
    fireEvent(scrollbar, dragStartEvent);
    
    onScroll.mockClear();
    
    // First drag
    const dragEvent1 = new Event('drag', {bubbles: true}) as any;
    dragEvent1.clientX = 160;
    dragEvent1.buttons = 1;
    fireEvent(scrollbar, dragEvent1);
    
    expect(onScroll).toHaveBeenCalledTimes(1);
    
    // Second drag to different step
    const dragEvent2 = new Event('drag', {bubbles: true}) as any;
    dragEvent2.clientX = 180;
    dragEvent2.buttons = 1;
    fireEvent(scrollbar, dragEvent2);
    
    expect(onScroll).toHaveBeenCalledTimes(2);
  });

  it('does not update step offset when onScroll returns false', () => {
    const onScroll = vi.fn().mockReturnValue(false);
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const scrollbar = container.querySelector('div[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.clientX = 150;
    dragStartEvent.dataTransfer = {setDragImage: vi.fn()};
    fireEvent(scrollbar, dragStartEvent);
    
    onScroll.mockClear();
    
    // Drag
    const dragEvent1 = new Event('drag', {bubbles: true}) as any;
    dragEvent1.clientX = 160;
    dragEvent1.buttons = 1;
    fireEvent(scrollbar, dragEvent1);
    
    expect(onScroll).toHaveBeenCalledTimes(1);
    
    // Drag again - should still call because step offset wasn't updated
    const dragEvent2 = new Event('drag', {bubbles: true}) as any;
    dragEvent2.clientX = 170;
    dragEvent2.buttons = 1;
    fireEvent(scrollbar, dragEvent2);
    
    expect(onScroll).toHaveBeenCalledTimes(2);
  });

  it('renders draggable scrollbar element', () => {
    const {container} = render(<ScrollBar onScroll={vi.fn()} />);
    const scrollbar = container.querySelector('div[draggable="true"]');
    expect(scrollbar).toBeInTheDocument();
  });

  it('renders drag shadow element', () => {
    const {container} = render(<ScrollBar onScroll={vi.fn()} />);
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(1);
  });
});
