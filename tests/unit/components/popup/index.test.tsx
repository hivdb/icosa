import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('reactjs-popup', () => ({
  __esModule: true,
  default: vi.fn(({children, trigger}) => (
    <div data-testid="popup">
      {trigger}
      {children}
    </div>
  ))
}));

import {HoverPopup} from '../../../../src/components/popup';
import ReactJSPopup from 'reactjs-popup';

describe('HoverPopup', () => {
  it('renders children directly when no message', () => {
    const {container} = render(<HoverPopup>Trigger</HoverPopup>);
    expect(container).toHaveTextContent('Trigger');
  });

  it('renders popup when message provided', () => {
    render(<HoverPopup message={<span>Msg</span>}>Trig</HoverPopup>);
    expect(ReactJSPopup).toHaveBeenCalled();
    expect(screen.getByTestId('popup')).toHaveTextContent('Trig');
    expect(screen.getByTestId('popup')).toHaveTextContent('Msg');
  });
});

