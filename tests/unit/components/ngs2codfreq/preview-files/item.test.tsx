import {describe, test, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import FASTQPairItem from '../../../../../src/components/ngs2codfreq/preview-files/item';

describe('FASTQPairItem component', () => {
  const mockFile1 = new File(['content1'], 'test1.fastq', {type: 'text/plain'});
  const mockFile2 = new File(['content2'], 'test2.fastq', {type: 'text/plain'});

  const defaultProps = {
    name: 'test-pair',
    pair: [mockFile1, mockFile2] as (File | null)[],
    n: 2,
    index: 0,
    onDragStart: vi.fn(),
    onDrag: vi.fn(),
    onDragEnd: vi.fn(),
    curDragFile: null,
    onSplit: vi.fn(),
    onMove: vi.fn(),
    onNameChange: vi.fn(),
    onRemove: vi.fn()
  };

  test('renders pair item with name input', () => {
    render(<FASTQPairItem {...defaultProps} />);
    const input = screen.getByDisplayValue('test-pair');
    expect(input).toBeInTheDocument();
  });

  test('renders both files in a pair', () => {
    render(<FASTQPairItem {...defaultProps} />);
    expect(screen.getByText('test1.fastq')).toBeInTheDocument();
    expect(screen.getByText('test2.fastq')).toBeInTheDocument();
  });

  test('sets data-n attribute correctly for pair', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} />);
    const pairItem = container.querySelector('[data-n="2"]');
    expect(pairItem).toBeInTheDocument();
  });

  test('sets data-n attribute correctly for single file', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} />
    );
    const pairItem = container.querySelector('[data-n="1"]');
    expect(pairItem).toBeInTheDocument();
  });

  test('shows split button for pairs (n=2)', () => {
    render(<FASTQPairItem {...defaultProps} />);
    const splitButton = screen.getByLabelText('Split to two single-read sequences');
    expect(splitButton).toBeInTheDocument();
  });

  test('hides split button for single files (n=1)', () => {
    render(<FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} />);
    const splitButton = screen.queryByLabelText('Split to two single-read sequences');
    expect(splitButton).not.toBeInTheDocument();
  });

  test('calls onSplit when split button is clicked', () => {
    const onSplit = vi.fn();
    render(<FASTQPairItem {...defaultProps} onSplit={onSplit} />);
    
    const splitButton = screen.getByLabelText('Split to two single-read sequences');
    fireEvent.click(splitButton);
    
    expect(onSplit).toHaveBeenCalledWith(0);
  });

  test('calls onNameChange when name input changes', () => {
    const onNameChange = vi.fn();
    render(<FASTQPairItem {...defaultProps} onNameChange={onNameChange} />);
    
    const input = screen.getByDisplayValue('test-pair');
    fireEvent.change(input, {target: {value: 'new-name'}});
    
    expect(onNameChange).toHaveBeenCalledWith('new-name', 0);
  });

  test('shows drop placeholder for single files', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toBeInTheDocument();
  });

  test('hides drop placeholder for pairs', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} />);
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).not.toBeInTheDocument();
  });

  test('renders file icons', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  test('shows remove button for each file', () => {
    render(<FASTQPairItem {...defaultProps} />);
    const removeButtons = screen.getAllByLabelText('remove this file');
    expect(removeButtons).toHaveLength(2);
  });

  test('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<FASTQPairItem {...defaultProps} onRemove={onRemove} />);
    
    const removeButtons = screen.getAllByLabelText('remove this file');
    fireEvent.click(removeButtons[0]);
    
    expect(onRemove).toHaveBeenCalledWith({index: 0, fileName: 'test1.fastq'});
  });

  test('shows move icon when draggable is true', () => {
    render(<FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} />);
    const moveIcon = screen.getByLabelText('move to merge with another single-read sequence');
    expect(moveIcon).toBeInTheDocument();
  });

  test('hides move icon when draggable is false', () => {
    render(<FASTQPairItem {...defaultProps} draggable={false} />);
    const moveIcon = screen.queryByLabelText('move to merge with another single-read sequence');
    expect(moveIcon).not.toBeInTheDocument();
  });

  test('handles drag start event', () => {
    const onDragStart = vi.fn();
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} onDragStart={onDragStart} />
    );
    
    const fileItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    const dragEvent = new Event('dragstart', {bubbles: true}) as any;
    dragEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    
    fireEvent(fileItem, dragEvent);
    
    expect(onDragStart).toHaveBeenCalledWith(mockFile1, expect.any(Object));
    expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith('text', JSON.stringify({
      fileName: 'test1.fastq',
      index: 0
    }));
  });

  test('sets dragging dataset on drag start', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} />
    );
    
    const fileItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    const dragEvent = new Event('dragstart', {bubbles: true}) as any;
    dragEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    
    fireEvent(fileItem, dragEvent);
    
    expect(fileItem.dataset.dragging).toBe('');
  });

  test('calls onDrag during drag', () => {
    const onDrag = vi.fn();
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} onDrag={onDrag} />
    );
    
    const fileItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    fireEvent.drag(fileItem);
    
    expect(onDrag).toHaveBeenCalled();
  });

  test('removes dragging dataset on drag end', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} />
    );
    
    const fileItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    
    // Start drag
    const dragStartEvent = new Event('dragstart', {bubbles: true}) as any;
    dragStartEvent.dataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    };
    fireEvent(fileItem, dragStartEvent);
    
    expect(fileItem.dataset.dragging).toBe('');
    
    // End drag
    fireEvent.dragEnd(fileItem);
    
    expect(fileItem.dataset.dragging).toBeUndefined();
  });

  test('calls onDragEnd on drag end', () => {
    const onDragEnd = vi.fn();
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} onDragEnd={onDragEnd} />
    );
    
    const fileItem = container.querySelector('li[draggable="true"]') as HTMLElement;
    fireEvent.dragEnd(fileItem);
    
    expect(onDragEnd).toHaveBeenCalled();
  });

  test('applies custom className to pair item', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__fastq-pair-item')).toBeInTheDocument();
  });

  test('applies custom className to pair name input', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__pair-name')).toBeInTheDocument();
  });

  test('applies custom className to file list', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__fastq-pair')).toBeInTheDocument();
  });

  test('applies custom className to file icons', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__file-icon')).toBeInTheDocument();
  });

  test('applies custom className to file names', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__file-name')).toBeInTheDocument();
  });

  test('applies custom className to remove buttons', () => {
    const {container} = render(<FASTQPairItem {...defaultProps} className="custom" />);
    expect(container.querySelector('.custom__file-remove')).toBeInTheDocument();
  });

  test('applies custom className to move icon when draggable', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} draggable={true} className="custom" />
    );
    expect(container.querySelector('.custom__file-move')).toBeInTheDocument();
  });

  test('does not render null files', () => {
    render(<FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} />);
    expect(screen.getByText('test1.fastq')).toBeInTheDocument();
    expect(screen.queryByText('test2.fastq')).not.toBeInTheDocument();
  });

  test('passes curDragFile to drop placeholder', () => {
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} curDragFile={mockFile2} />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toBeInTheDocument();
  });

  test('calls onMove when drop placeholder receives a file', () => {
    const onMove = vi.fn();
    const {container} = render(
      <FASTQPairItem {...defaultProps} pair={[mockFile1, null]} n={1} curDragFile={mockFile2} onMove={onMove} />
    );
    
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    const dropEvent = new Event('drop', {bubbles: true}) as any;
    dropEvent.dataTransfer = {
      dropEffect: '',
      getData: vi.fn(() => JSON.stringify({index: 1, fileName: 'test2.fastq'}))
    };
    
    fireEvent(placeholder, dropEvent);
    
    expect(onMove).toHaveBeenCalledWith({
      src: {index: 1, fileName: 'test2.fastq'},
      target: {index: 0}
    });
  });
});
