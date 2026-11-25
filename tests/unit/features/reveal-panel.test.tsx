import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealPanel } from '@/features/game';

describe('RevealPanel (T-09, S-04)', () => {
  afterEach(() => cleanup());

  it('renders correct verdict with IMG-09 and formatted price diff', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    const onNext = vi.fn();
    const { container, getByText, getByRole } = render(
      <RevealPanel
        correct={true}
        leftPrice={123500}
        rightPrice={145000}
        isFinal={false}
        dataSourceLinkable={true}
        onNext={onNext}
      />,
    );

    expect(getByText('정답이에요')).toBeTruthy();
    expect(getByText('가격 차이 +2억 1,500만원 (17.4%)')).toBeTruthy();
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/images/verdict-correct.svg');
    expect(getByText('데이터 기준 보기')).toBeTruthy();

    const btn = getByRole('button', { name: '다음 문제' });
    expect(document.activeElement).toBe(btn);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    focusSpy.mockRestore();
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders wrong verdict with IMG-10, final CTA label, and hides guide link when unreviewed', () => {
    const { container, getByText, queryByText, getByRole } = render(
      <RevealPanel
        correct={false}
        leftPrice={100000}
        rightPrice={130000}
        isFinal={true}
        dataSourceLinkable={false}
        onNext={vi.fn()}
      />,
    );

    expect(getByText('오답이에요')).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/verdict-wrong.svg');
    expect(getByRole('button', { name: '결과 보기' })).toBeTruthy();
    expect(queryByText('데이터 기준 보기')).toBeNull();
  });

  it('scrolls down on mobile when fixed bottom bar overlaps verdict/source rows', () => {
    const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const computedSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ position: 'fixed' } as CSSStyleDeclaration);
    const origInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 667 });
    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 80 });
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 664,
      top: 644,
      left: 0,
      right: 375,
      width: 375,
      height: 20,
      x: 0,
      y: 644,
      toJSON: () => ({}),
    });

    try {
      render(
        <RevealPanel
          correct={false}
          leftPrice={100000}
          rightPrice={130000}
          isFinal={false}
          dataSourceLinkable={false}
          onNext={vi.fn()}
        />,
      );
      expect(scrollBySpy).toHaveBeenCalledWith({ top: 89, behavior: 'auto' });
    } finally {
      rectSpy.mockRestore();
      computedSpy.mockRestore();
      scrollBySpy.mockRestore();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: origInnerHeight });
      if (origOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeight);
      } else {
        delete (HTMLElement.prototype as { offsetHeight?: number }).offsetHeight;
      }
    }
  });
});
