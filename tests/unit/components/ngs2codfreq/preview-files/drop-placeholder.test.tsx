import {describe, test, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import DropPlaceholder from '../../../../../src/components/ngs2codfreq/preview-files/drop-placeholder';

describe('DropPlaceholder component', () => {
  test('renders placeholder element', () => {
    const {container} = render(
      <DropPlaceholder 
        curDragFile={null} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toBeInTheDocument();
  });

  test('sets data-await-dropping to false when no file is being dragged', () => {
    const {container} = render(
      <DropPlaceholder 
        curDragFile={null} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toHaveAttribute('data-await-dropping', 'false');
  });

  test('sets data-await-dropping to true when allowed file is being dragged', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toHaveAttribute('data-await-dropping', 'true');
  });

  test('blocks drop when file is in blockFiles list', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file}
        blockFiles={[file]}
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toHaveAttribute('data-await-dropping', 'false');
  });

  test('allows drop when file is in allowFiles list', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file}
        allowFiles={[file]}
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toHaveAttribute('data-await-dropping', 'true');
  });

  test('blocks drop when file is not in allowFiles list', () => {
    const file1 = new File(['content'], 'test1.fastq', {type: 'text/plain'});
    const file2 = new File(['content'], 'test2.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file1}
        allowFiles={[file2]}
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]');
    expect(placeholder).toHaveAttribute('data-await-dropping', 'false');
  });

  test('handles dragover event when drop is allowed', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    const dragEvent = new Event('dragover', {bubbles: true, cancelable: true}) as any;
    dragEvent.dataTransfer = {dropEffect: ''};
    
    fireEvent(placeholder, dragEvent);
    
    expect(placeholder.dataset.dropping).toBe('true');
  });

  test('does not prevent default on dragover when drop is not allowed', () => {
    const {container} = render(
      <DropPlaceholder 
        curDragFile={null} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    const dragEvent = new Event('dragover', {bubbles: true, cancelable: true}) as any;
    dragEvent.preventDefault = vi.fn();
    dragEvent.dataTransfer = {dropEffect: ''};
    
    fireEvent(placeholder, dragEvent);
    
    expect(dragEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('handles dragleave event', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    // First trigger dragover to set dropping to true
    const dragOverEvent = new Event('dragover', {bubbles: true, cancelable: true}) as any;
    dragOverEvent.dataTransfer = {dropEffect: ''};
    fireEvent(placeholder, dragOverEvent);
    
    // Then trigger dragleave
    fireEvent.dragLeave(placeholder);
    
    expect(placeholder.dataset.dropping).toBe('false');
  });

  test('calls onMove with correct payload on drop', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const onMove = vi.fn();
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file} 
        onMove={onMove} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    const payload = {index: 0, fileName: 'test.fastq'};
    const dropEvent = new Event('drop', {bubbles: true}) as any;
    dropEvent.dataTransfer = {
      dropEffect: '',
      getData: vi.fn(() => JSON.stringify(payload))
    };
    
    fireEvent(placeholder, dropEvent);
    
    expect(onMove).toHaveBeenCalledWith(payload);
  });

  test('sets dropping to false after drop', () => {
    const file = new File(['content'], 'test.fastq', {type: 'text/plain'});
    const {container} = render(
      <DropPlaceholder 
        curDragFile={file} 
        onMove={vi.fn()} 
      />
    );
    const placeholder = container.querySelector('[data-await-dropping]') as HTMLElement;
    
    const dropEvent = new Event('drop', {bubbles: true}) as any;
    dropEvent.dataTransfer = {
      dropEffect: '',
      getData: vi.fn(() => JSON.stringify({index: 0, fileName: 'test.fastq'}))
    };
    
    fireEvent(placeholder, dropEvent);
    
    expect(placeholder.dataset.dropping).toBe('false');
  });

  test('applies custom className', () => {
    const {container} = render(
      <DropPlaceholder 
        curDragFile={null} 
        onMove={vi.fn()}
        className="custom" 
      />
    );
    expect(container.querySelector('.custom__drop-placeholder')).toBeInTheDocument();
  });
});
