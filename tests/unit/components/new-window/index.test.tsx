import React from 'react';
import {render, waitFor, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {NewWindowRoute, useNewWindow} from '../../../../src/components/new-window';

vi.mock('../../../../src/utils/use-mounted', () => ({
  useMountedCallback: (fn: any) => fn
}));

function DummyComponent({testProp}: {testProp?: string}) {
  return <div data-testid="dummy">{testProp || 'dummy'}</div>;
}

describe('NewWindowRoute', () => {
  it('wraps component with popup path when pathPrefix is provided', () => {
    const element = NewWindowRoute({
      pathPrefix: 'test',
      overrideProps: {foo: 'bar'},
      Component: DummyComponent
    } as any) as any;
    
    expect(element.props.path).toBe('test/popup/');
    expect(element.type.name).toBe('Route');
  });

  it('wraps component with default popup path when no pathPrefix', () => {
    const element = NewWindowRoute({
      overrideProps: {foo: 'bar'},
      Component: DummyComponent
    } as any) as any;
    
    expect(element.props.path).toBe('popup/');
  });

  it('normalizes pathPrefix by adding trailing slash', () => {
    const element = NewWindowRoute({
      pathPrefix: 'test/path',
      Component: DummyComponent
    } as any) as any;
    
    expect(element.props.path).toBe('test/path/popup/');
  });

  it('handles pathPrefix with trailing slashes', () => {
    const element = NewWindowRoute({
      pathPrefix: 'test///',
      Component: DummyComponent
    } as any) as any;
    
    expect(element.props.path).toBe('test/popup/');
  });

  it('passes additional props to Route', () => {
    const element = NewWindowRoute({
      pathPrefix: 'test',
      Component: DummyComponent,
      exact: true,
      customProp: 'value'
    } as any) as any;
    
    expect(element.props.exact).toBe(true);
    expect(element.props.customProp).toBe('value');
  });

  it('renders NewWindowPropsProvider with correct props', () => {
    const element = NewWindowRoute({
      pathPrefix: 'test',
      overrideProps: {override: 'value'},
      Component: DummyComponent
    } as any) as any;
    
    const rendered = element.props.render({props: {route: 'prop'}});
    expect(rendered.props.routeProps).toEqual({route: 'prop'});
    expect(rendered.props.overrideProps).toEqual({override: 'value'});
    expect(rendered.props.Component).toBe(DummyComponent);
  });
});

describe('NewWindowPropsProvider', () => {
  let originalSetProps: any;
  let dispatchEventSpy: any;

  beforeEach(() => {
    originalSetProps = (window as any).setProps;
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    (window as any).setProps = originalSetProps;
    dispatchEventSpy.mockRestore();
  });

  it('does not render component initially before setProps is called', () => {
    const element = NewWindowRoute({
      Component: DummyComponent
    } as any) as any;
    
    const {container} = render(element.props.render({props: {}}));
    
    expect(container.querySelector('[data-testid="dummy"]')).not.toBeInTheDocument();
  });

  it('dispatches ready event on mount', () => {
    const element = NewWindowRoute({
      Component: DummyComponent
    } as any) as any;
    
    render(element.props.render({props: {}}));
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    const event = dispatchEventSpy.mock.calls[0][0];
    expect(event.type).toBe('_newwindowready');
  });

  it('exposes setProps on window and renders component after calling it', async () => {
    const element = NewWindowRoute({
      overrideProps: {override: 'test'},
      Component: DummyComponent
    } as any) as any;
    
    const {container} = render(element.props.render({props: {route: 'value'}}));
    
    expect(container.querySelector('[data-testid="dummy"]')).not.toBeInTheDocument();
    
    act(() => {
      (window as any).setProps({testProp: 'fromSetProps'});
    });
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="dummy"]')).toBeInTheDocument();
    });
    
    expect(container.textContent).toContain('fromSetProps');
  });

  it('merges routeProps, setProps, and overrideProps correctly', async () => {
    const TestComponent = ({route, set, override}: any) => (
      <div>
        <span data-testid="route">{route}</span>
        <span data-testid="set">{set}</span>
        <span data-testid="override">{override}</span>
      </div>
    );

    const element = NewWindowRoute({
      overrideProps: {override: 'overrideValue'},
      Component: TestComponent
    } as any) as any;
    
    const {container} = render(element.props.render({props: {route: 'routeValue'}}));
    
    act(() => {
      (window as any).setProps({set: 'setValue'});
    });
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="route"]')).toHaveTextContent('routeValue');
      expect(container.querySelector('[data-testid="set"]')).toHaveTextContent('setValue');
      expect(container.querySelector('[data-testid="override"]')).toHaveTextContent('overrideValue');
    });
  });
});

describe('useNewWindow', () => {
  let originalWindowOpen: any;
  let originalWindowName: string;
  let mockChildWindow: any;

  beforeEach(() => {
    originalWindowOpen = window.open;
    originalWindowName = window.name;
    
    mockChildWindow = {
      setProps: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      closed: false
    };
    
    window.open = vi.fn(() => mockChildWindow);
    vi.useFakeTimers();
  });

  afterEach(() => {
    window.open = originalWindowOpen;
    window.name = originalWindowName;
    vi.useRealTimers();
  });

  it('opens a new window when not a child', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({prop: 'value'}, {name: 'testWindow', features: 'width=800'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('/popup/'),
      'testWindow',
      'width=800'
    );
  });

  it('returns isOpener true and isChild false when parent window', () => {
    window.name = '';
    
    function TestComponent() {
      const {isOpener, isChild} = useNewWindow({}, {name: 'testWindow'});
      return (
        <div>
          <span data-testid="opener">{String(isOpener)}</span>
          <span data-testid="child">{String(isChild)}</span>
        </div>
      );
    }
    
    const {container} = render(<TestComponent />);
    
    expect(container.querySelector('[data-testid="opener"]')).toHaveTextContent('true');
    expect(container.querySelector('[data-testid="child"]')).toHaveTextContent('false');
  });

  it('returns isOpener false and isChild true when child window', () => {
    window.name = 'testWindow';
    
    function TestComponent() {
      const {isOpener, isChild} = useNewWindow({}, {name: 'testWindow'});
      return (
        <div>
          <span data-testid="opener">{String(isOpener)}</span>
          <span data-testid="child">{String(isChild)}</span>
        </div>
      );
    }
    
    const {container} = render(<TestComponent />);
    
    expect(container.querySelector('[data-testid="opener"]')).toHaveTextContent('false');
    expect(container.querySelector('[data-testid="child"]')).toHaveTextContent('true');
  });

  it('does not open window when already a child', () => {
    window.name = 'testWindow';
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    expect(window.open).not.toHaveBeenCalled();
  });

  it('calls setProps on child window if available', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({testProp: 'value'}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    expect(mockChildWindow.setProps).toHaveBeenCalledWith({testProp: 'value'});
  });

  it('adds event listeners to child window', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    expect(mockChildWindow.addEventListener).toHaveBeenCalledWith('_newwindowready', expect.any(Function), false);
    expect(mockChildWindow.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function), false);
  });

  it('calls onUnload when child window closes', () => {
    window.name = '';
    const onUnload = vi.fn();
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow', onUnload});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    const beforeUnloadHandler = mockChildWindow.addEventListener.mock.calls.find(
      (call: any) => call[0] === 'beforeunload'
    )[1];
    
    act(() => {
      beforeUnloadHandler();
    });
    
    expect(onUnload).toHaveBeenCalled();
  });

  it('detects when child window is closed via interval check', () => {
    window.name = '';
    const onUnload = vi.fn();
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow', onUnload});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    mockChildWindow.closed = true;
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(onUnload).toHaveBeenCalled();
  });

  it('closes child window on unmount', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    const {unmount} = render(<TestComponent />);
    
    unmount();
    
    expect(mockChildWindow.close).toHaveBeenCalled();
  });

  it('removes event listeners on unmount', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    const {unmount} = render(<TestComponent />);
    
    unmount();
    
    expect(mockChildWindow.removeEventListener).toHaveBeenCalledWith('_newwindowready', expect.any(Function), false);
    expect(mockChildWindow.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function), false);
  });

  it('clears interval on unmount', () => {
    window.name = '';
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    const {unmount} = render(<TestComponent />);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('updates props when props change', () => {
    window.name = '';
    
    function TestComponent({value}: {value: string}) {
      useNewWindow({testProp: value}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    const {rerender} = render(<TestComponent value="initial" />);
    
    mockChildWindow.setProps.mockClear();
    
    rerender(<TestComponent value="updated" />);
    
    expect(mockChildWindow.setProps).toHaveBeenCalledWith({testProp: 'updated'});
  });

  it('calls setProps on ready event', () => {
    window.name = '';
    
    function TestComponent() {
      useNewWindow({testProp: 'value'}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    const readyHandler = mockChildWindow.addEventListener.mock.calls.find(
      (call: any) => call[0] === '_newwindowready'
    )[1];
    
    mockChildWindow.setProps.mockClear();
    
    act(() => {
      readyHandler();
    });
    
    expect(mockChildWindow.setProps).toHaveBeenCalledWith({testProp: 'value'});
  });

  it('handles missing setProps on child window gracefully', () => {
    window.name = '';
    mockChildWindow.setProps = undefined;
    
    function TestComponent() {
      useNewWindow({testProp: 'value'}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  it('does not set up event listeners when in child window', () => {
    window.name = 'testWindow';
    
    function TestComponent() {
      useNewWindow({}, {name: 'testWindow'});
      return <div>test</div>;
    }
    
    render(<TestComponent />);
    
    expect(mockChildWindow.addEventListener).not.toHaveBeenCalled();
  });
});
