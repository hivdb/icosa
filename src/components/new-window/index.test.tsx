import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import '@testing-library/jest-dom';

import {useNewWindow} from './index';

function HookWrapper({name}: {name: string}) {
  const {isChild, isOpener} = useNewWindow({}, {name});
  return <div>{isChild ? 'child' : isOpener ? 'opener' : 'unknown'}</div>;
}

describe('useNewWindow', () => {
  const originalName = window.name;

  afterEach(() => {
    window.name = originalName;
    vi.restoreAllMocks();
  });

  it('detects child window', () => {
    window.name = 'popup';
    render(<HookWrapper name="popup" />);
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('opens new window when called in opener', () => {
    window.name = '';
    const openMock = vi.spyOn(window, 'open').mockReturnValue({
      addEventListener: () => {},
      removeEventListener: () => {},
      setProps: () => {},
      close: () => {},
      closed: false
    } as any);
    vi.spyOn(window, 'setInterval').mockReturnValue(1 as any);
    vi.spyOn(window, 'clearInterval').mockImplementation(() => {});
    render(<HookWrapper name="popup" />);
    expect(openMock).toHaveBeenCalled();
    expect(screen.getByText('opener')).toBeInTheDocument();
  });
});
