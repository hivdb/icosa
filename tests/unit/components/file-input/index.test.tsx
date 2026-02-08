import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

import FileInput from '../../../../src/components/file-input';

describe('FileInput', () => {
  it('calls onChange with selected files', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    fireEvent.change(input, {target: {files: [file]}});
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('handles multiple file selection', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" multiple onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    const file2 = new File(['world'], 'world.txt', {type: 'text/plain'});
    fireEvent.change(input, {target: {files: [file1, file2]}});
    expect(handleChange).toHaveBeenCalledWith([file1, file2]);
  });

  it('limits to single file when multiple is false', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    const file2 = new File(['world'], 'world.txt', {type: 'text/plain'});
    fireEvent.change(input, {target: {files: [file1, file2]}});
    expect(handleChange).toHaveBeenCalledWith([file1]);
  });

  it('displays selected filename', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    fireEvent.change(input, {target: {files: [file]}});
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput.value).toBe('hello.txt');
  });

  it('shows ellipsis for multiple files', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" multiple onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    const file2 = new File(['world'], 'world.txt', {type: 'text/plain'});
    fireEvent.change(input, {target: {files: [file1, file2]}});
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput.value).toBe('hello.txt ...');
  });

  it('handles drag and drop with dataTransfer items', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const wrapper = container.firstChild as HTMLElement;
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    const dataTransfer = {
      items: [{
        kind: 'file',
        getAsFile: () => file
      }]
    };
    fireEvent.drop(wrapper, {dataTransfer});
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('filters non-file items in drag and drop', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const wrapper = container.firstChild as HTMLElement;
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});
    const dataTransfer = {
      items: [
        {kind: 'string', getAsFile: () => null},
        {kind: 'file', getAsFile: () => file}
      ]
    };
    fireEvent.drop(wrapper, {dataTransfer});
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('triggers file input click when button is clicked', () => {
    const handleChange = vi.fn();
    const {getByRole} = render(<FileInput name="file" onChange={handleChange} />);
    const button = getByRole('button');
    const clickSpy = vi.fn();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input.click = clickSpy;
    fireEvent.click(button);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('triggers file input click when text input is clicked', () => {
    const handleChange = vi.fn();
    const {container} = render(<FileInput name="file" onChange={handleChange} />);
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const clickSpy = vi.fn();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click = clickSpy;
    fireEvent.mouseDown(textInput);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('ignores non-left-button mouse events', () => {
    const handleChange = vi.fn();
    const {getByRole} = render(<FileInput name="file" onChange={handleChange} />);
    const button = getByRole('button');
    const clickSpy = vi.fn();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input.click = clickSpy;
    fireEvent.click(button, {buttons: 2});
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('renders with disabled state', () => {
    const handleChange = vi.fn();
    const {getByRole, container} = render(
      <FileInput name="file" disabled onChange={handleChange} />
    );
    const button = getByRole('button');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(button).toBeDisabled();
    expect(fileInput).toBeDisabled();
    expect(textInput).toBeDisabled();
  });

  it('hides filename display when hideSelected is true', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FileInput name="file" hideSelected onChange={handleChange} />
    );
    const textInput = container.querySelector('input[type="text"]');
    expect(textInput).toBeNull();
  });

  it('renders custom button text', () => {
    const handleChange = vi.fn();
    const {getByRole} = render(
      <FileInput name="file" onChange={handleChange}>Upload File</FileInput>
    );
    const button = getByRole('button');
    expect(button).toHaveTextContent('Upload File');
  });

  it('uses custom placeholder text', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FileInput name="file" placeholder="Select a file" onChange={handleChange} />
    );
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput.placeholder).toBe('Select a file');
  });

  it('applies custom className', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FileInput name="file" className="custom-class" onChange={handleChange} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('accepts specific file types', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FileInput name="file" accept="image/*" onChange={handleChange} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');
  });
});
