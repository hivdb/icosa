import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('found', () => ({
  Link: ({to, children, ...props}: any) => <a href={typeof to === 'string' ? to : ''} {...props}>{children}</a>
}));

import Sidebar, {SidebarItem} from '../../../../src/components/sidebar';
import style from '../../../../src/components/sidebar/style.module.scss';

describe('Sidebar', () => {
  it('marks current selected item', () => {
    const {container} = render(
      <Sidebar title="Title" currentSelected="a">
        <SidebarItem name="a" href="/a">Item A</SidebarItem>
        <SidebarItem name="b" href="/b">Item B</SidebarItem>
      </Sidebar>
    );
    const current = container.querySelector(`.${style.current}`);
    expect(current?.textContent).toBe('Item A');
  });
});
