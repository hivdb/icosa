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

  it('renders without className', () => {
    const {container} = render(
      <Intro>
        <IntroHeader>Title</IntroHeader>
        <div>Body</div>
      </Intro>
    );
    expect(container.querySelector(`.${style.intro}`)).toBeInTheDocument();
  });

  it('renders supplement without parent className', () => {
    render(
      <Intro>
        <IntroHeader>
          Title
          <IntroHeaderSupplement>Supp</IntroHeaderSupplement>
        </IntroHeader>
      </Intro>
    );
    const supp = screen.getByText('Supp');
    expect(supp).toHaveClass(style.supplement);
    expect(supp).not.toHaveClass('intro-supplement');
  });

  it('renders with single child (not array)', () => {
    render(
      <Intro>
        <div>Single Child</div>
      </Intro>
    );
    expect(screen.getByText('Single Child')).toBeInTheDocument();
  });

  it('renders with multiple body elements', () => {
    render(
      <Intro>
        <IntroHeader>Title</IntroHeader>
        <div>Body 1</div>
        <div>Body 2</div>
        <div>Body 3</div>
      </Intro>
    );
    expect(screen.getByText('Body 1')).toBeInTheDocument();
    expect(screen.getByText('Body 2')).toBeInTheDocument();
    expect(screen.getByText('Body 3')).toBeInTheDocument();
  });

  it('renders without body section when only header is provided', () => {
    const {container} = render(
      <Intro>
        <IntroHeader>Title Only</IntroHeader>
      </Intro>
    );
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(container.querySelector('section')).not.toBeInTheDocument();
  });

  it('renders body in section element when body content exists', () => {
    const {container} = render(
      <Intro>
        <IntroHeader>Title</IntroHeader>
        <div>Body</div>
      </Intro>
    );
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toContainElement(screen.getByText('Body'));
  });
});

