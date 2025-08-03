import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Sidebar, {SidebarItem} from './index';
import style from './style.module.scss';

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
