import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

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
});
