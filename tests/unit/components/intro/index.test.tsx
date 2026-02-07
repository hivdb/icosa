import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Intro, {IntroHeader, IntroHeaderSupplement} from '../../../../src/components/intro';
import style from '../../../../src/components/intro/style.module.scss';

describe('Intro', () => {
  it('renders header and body', () => {
    const {container} = render(
      <Intro className="intro">
        <IntroHeader>Title</IntroHeader>
        <div>Body</div>
      </Intro>
    );
    const header = container.querySelector('header');
    expect(header).toHaveTextContent('Title');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders supplement with proper classes', () => {
    render(
      <Intro className="intro">
        <IntroHeader>
          Title
          <IntroHeaderSupplement>Supp</IntroHeaderSupplement>
        </IntroHeader>
      </Intro>
    );
    const supp = screen.getByText('Supp');
    expect(supp).toHaveClass(style.supplement);
    expect(supp).toHaveClass('intro-supplement');
  });
});

