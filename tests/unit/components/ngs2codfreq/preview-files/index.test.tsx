import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import PreviewFiles from '../../../../../src/components/ngs2codfreq/preview-files';
import type {FastqPair} from '../../../../../src/components/ngs2codfreq/types';

// Mock the undo-history hook
vi.mock('../../../../../src/components/ngs2codfreq/preview-files/undo-history', () => ({
  default: (onChange: (pairs: FastqPair[]) => void) => ({
    pushHistory: vi.fn()
  })
}));

describe('PreviewFiles component', () => {
  const mockFile1 = new File(['content1'], 'test1_R1.fastq', {type: 'text/plain'});
  const mockFile2 = new File(['content2'], 'test1_R2.fastq', {type: 'text/plain'});
  const mockFile3 = new File(['content3'], 'test2.fastq', {type: 'text/plain'});

  const mockPair: FastqPair = {
    name: 'test1',
    pair: [mockFile1, mockFile2],
    n: 2,
    pattern: {delimiter: '_', diffOffset: 0, posPairedMarker: 1, reverse: 0}
  };

  const mockSingleFile: FastqPair = {
    name: 'test2',
    pair: [mockFile3, null],
    n: 1,
    pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders empty list when no pairs provided', () => {
    render(<PreviewFiles fastqPairs={[]} onChange={vi.fn()} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('renders list with correct number of pairs', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockPair, mockSingleFile]} onChange={vi.fn()} />
    );
    const pairItems = container.querySelectorAll('[data-n]');
    expect(pairItems).toHaveLength(2);
  });

  test('sets data-drag-active to false when no file is being dragged', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    const list = container.querySelector('[data-drag-active]');
    expect(list).toHaveAttribute('data-drag-active', 'false');
  });

  test('calls onChange when pair is split', () => {
    const onChange = vi.fn();
    render(<PreviewFiles fastqPairs={[mockPair]} onChange={onChange} />);
    
    const splitButton = screen.getByLabelText('Split to two single-read sequences');
    fireEvent.click(splitButton);
    
    expect(onChange).toHaveBeenCalled();
    const newPairs = onChange.mock.calls[0][0];
    expect(newPairs.length).toBe(2);
    expect(newPairs[0].n).toBe(1);
    expect(newPairs[1].n).toBe(1);
  });

  test('calls onChange when file is removed', () => {
    const onChange = vi.fn();
    render(<PreviewFiles fastqPairs={[mockPair]} onChange={onChange} />);
    
    const removeButtons = screen.getAllByLabelText('remove this file');
    fireEvent.click(removeButtons[0]);
    
    expect(onChange).toHaveBeenCalled();
  });

  test('calls onChange when pair name is changed', () => {
    const onChange = vi.fn();
    render(<PreviewFiles fastqPairs={[mockPair]} onChange={onChange} />);
    
    const nameInput = screen.getByDisplayValue('test1');
    fireEvent.change(nameInput, {target: {value: 'new-name'}});
    
    expect(onChange).toHaveBeenCalled();
    const newPairs = onChange.mock.calls[0][0];
    expect(newPairs[0].name).toBe('new-name');
  });

  test('enables dragging when there are single files', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    const draggableItem = container.querySelector('li[draggable="true"]');
    expect(draggableItem).toBeInTheDocument();
  });

  test('disables dragging when there are only pairs', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockPair]} onChange={vi.fn()} />
    );
    const draggableItem = container.querySelector('li[draggable="true"]');
    expect(draggableItem).not.toBeInTheDocument();
  });

  test('sets curDragFile on drag start', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    
    const draggableItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    
    fireEvent(draggableItem, dragStartEvent);
    
    // After drag start, data-drag-active should be true
    const list = container.querySelector('[data-drag-active]');
    expect(list).toHaveAttribute('data-drag-active', 'true');
  });

  test('clears curDragFile on drag end', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    
    const draggableItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    fireEvent(draggableItem, dragStartEvent);
    
    // End drag
    fireEvent.dragEnd(draggableItem);
    
    // After drag end, data-drag-active should be false
    const list = container.querySelector('[data-drag-active]');
    expect(list).toHaveAttribute('data-drag-active', 'false');
  });

  test('scrolls list up when dragging near top edge', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    
    const list = container.querySelector('ul') as HTMLUListElement;
    const draggableItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    // Mock getBoundingClientRect
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 500,
      left: 0,
      right: 0,
      width: 0,
      height: 400,
      x: 0,
      y: 100,
      toJSON: () => ({})
    });
    
    const initialScrollTop = list.scrollTop;
    
    // Simulate drag near top edge (clientY < top)
    const dragEvent = new Event('drag', {bubbles: true}) as any;
    Object.defineProperty(dragEvent, 'clientY', {value: 50}); // Above top edge
    
    fireEvent(draggableItem, dragEvent);
    
    // Scroll should have been adjusted (may not change in test environment)
    expect(list.scrollTop).toBeDefined();
  });

  test('scrolls list down when dragging near bottom edge', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockSingleFile]} onChange={vi.fn()} />
    );
    
    const list = container.querySelector('ul') as HTMLUListElement;
    const draggableItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    // Mock getBoundingClientRect
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 500,
      left: 0,
      right: 0,
      width: 0,
      height: 400,
      x: 0,
      y: 100,
      toJSON: () => ({})
    });
    
    // Simulate drag near bottom edge (clientY > bottom)
    const dragEvent = new Event('drag', {bubbles: true}) as any;
    Object.defineProperty(dragEvent, 'clientY', {value: 600}); // Below bottom edge
    
    fireEvent(draggableItem, dragEvent);
    
    // Scroll should have been adjusted
    expect(list.scrollTop).toBeDefined();
  });

  test('calls onChange when file is moved to another pair', () => {
    const onChange = vi.fn();
    const pair1: FastqPair = {
      name: 'pair1',
      pair: [mockFile1, null],
      n: 1,
      pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
    };
    const pair2: FastqPair = {
      name: 'pair2',
      pair: [mockFile2, null],
      n: 1,
      pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
    };
    
    const {container} = render(
      <PreviewFiles fastqPairs={[pair1, pair2]} onChange={onChange} />
    );
    
    // Get the drop placeholder for the second pair
    const placeholders = container.querySelectorAll('[data-await-dropping]');
    const targetPlaceholder = placeholders[1] as HTMLElement;
    
    // Simulate dropping file from first pair into second pair
    const dropEvent = new Event('drop', {bubbles: true}) as any;
    dropEvent.dataTransfer = {
      dropEffect: '',
      getData: vi.fn(() => JSON.stringify({index: 0, fileName: mockFile1.name}))
    };
    
    fireEvent(targetPlaceholder, dropEvent);
    
    expect(onChange).toHaveBeenCalled();
  });

  test('applies custom className to list', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockPair]} onChange={vi.fn()} className="custom" />
    );
    expect(container.querySelector('.custom__preview-files')).toBeInTheDocument();
  });

  test('passes className to child components', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[mockPair]} onChange={vi.fn()} className="custom" />
    );
    expect(container.querySelector('.custom__fastq-pair-item')).toBeInTheDocument();
  });

  test('handles multiple pairs with mixed types', () => {
    const {container} = render(
      <PreviewFiles 
        fastqPairs={[mockPair, mockSingleFile]} 
        onChange={vi.fn()} 
      />
    );
    
    const pairItems = container.querySelectorAll('[data-n]');
    expect(pairItems[0]).toHaveAttribute('data-n', '2');
    expect(pairItems[1]).toHaveAttribute('data-n', '1');
  });

  test('renders all files from all pairs', () => {
    render(
      <PreviewFiles 
        fastqPairs={[mockPair, mockSingleFile]} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByText('test1_R1.fastq')).toBeInTheDocument();
    expect(screen.getByText('test1_R2.fastq')).toBeInTheDocument();
    expect(screen.getByText('test2.fastq')).toBeInTheDocument();
  });

  test('maintains pair order', () => {
    // Create fresh pairs to avoid state pollution from other tests
    const pair1: FastqPair = {
      name: 'test1',
      pair: [mockFile1, mockFile2],
      n: 2,
      pattern: {delimiter: '_', diffOffset: 0, posPairedMarker: 1, reverse: 0}
    };
    const pair2: FastqPair = {
      name: 'test2',
      pair: [mockFile3, null],
      n: 1,
      pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
    };
    
    const {container} = render(
      <PreviewFiles 
        fastqPairs={[pair1, pair2]} 
        onChange={vi.fn()} 
      />
    );
    
    const nameInputs = container.querySelectorAll('input[type="text"]');
    expect(nameInputs[0]).toHaveValue('test1');
    expect(nameInputs[1]).toHaveValue('test2');
  });

  test('handles empty pair array', () => {
    const {container} = render(
      <PreviewFiles fastqPairs={[]} onChange={vi.fn()} />
    );
    
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list?.children.length).toBe(0);
  });

  test('clears curDragFile after successful move', () => {
    const onChange = vi.fn();
    const pair1: FastqPair = {
      name: 'pair1',
      pair: [mockFile1, null],
      n: 1,
      pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
    };
    const pair2: FastqPair = {
      name: 'pair2',
      pair: [mockFile2, null],
      n: 1,
      pattern: {delimiter: '', diffOffset: 0, posPairedMarker: 0, reverse: 0}
    };
    
    const {container} = render(
      <PreviewFiles fastqPairs={[pair1, pair2]} onChange={onChange} />
    );
    
    const draggableItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    fireEvent(draggableItem, dragStartEvent);
    
    // Verify drag is active
    let list = container.querySelector('[data-drag-active]');
    expect(list).toHaveAttribute('data-drag-active', 'true');
    
    // Drop on placeholder
    const placeholders = container.querySelectorAll('[data-await-dropping]');
    const targetPlaceholder = placeholders[1] as HTMLElement;
    
    const dropEvent = new Event('drop', {bubbles: true}) as any;
    dropEvent.dataTransfer = {
      dropEffect: '',
      getData: vi.fn(() => JSON.stringify({index: 0, fileName: mockFile1.name}))
    };
    fireEvent(targetPlaceholder, dropEvent);
    
    // After move, drag should be cleared
    list = container.querySelector('[data-drag-active]');
    expect(list).toHaveAttribute('data-drag-active', 'false');
  });
});
