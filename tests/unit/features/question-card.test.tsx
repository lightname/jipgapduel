import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionCard, type Pool } from '@/features/game';
import { viewBoxFor } from '@/features/map';

const testPool: Pool = {
  schemaVersion: 1,
  poolVersion: '20261121-0000',
  generatedAt: '2026-11-21T00:00:00Z',
  period: { from: '2026-10', to: '2026-10' },
  sgg: [
    { code: '11680', name: '서울 강남구', path: 'M 800 750 L 850 750 L 850 800 L 800 800 Z' },
    { code: '41111', name: '경기 수원시 장안구', path: 'M 700 900 L 950 900 L 950 1100 L 700 1100 Z' },
  ],
  complexes: [
    {
      id: 'C1',
      name: '래미안대치팰리스',
      sggCode: '11680',
      umd: '대치동',
      buildYear: 2015,
      lat: 37.5,
      lng: 127.06,
      coordSource: 'parcel',
    },
  ],
  trades: [
    { id: 'T1', complexId: 'C1', areaM2: 84.97, floor: 12, dealYm: '2026-10', price: 123000 },
  ],
  pairs: { easy: [[0, 0]], medium: [[0, 0]], hard: [[0, 0]] },
};

describe('QuestionCard and MiniMap (T-08)', () => {
  afterEach(() => cleanup());

  it('renders all 7 fields and hides price before reveal', () => {
    const onSelect = vi.fn();
    const { container, getByText, queryByText } = render(
      <QuestionCard
        pool={testPool}
        tradeIndex={0}
        side="left"
        state="idle"
        isHigher={true}
        revealed={false}
        onSelect={onSelect}
      />,
    );

    expect(getByText('래미안대치팰리스')).toBeTruthy();
    expect(getByText('서울 강남구 대치동')).toBeTruthy();
    expect(getByText('전용 84.97㎡ (25.7평)')).toBeTruthy();
    expect(getByText('12층')).toBeTruthy();
    expect(getByText('2015년 준공')).toBeTruthy();
    expect(getByText('2026년 10월 거래')).toBeTruthy();
    expect(container.querySelector('svg')).not.toBeNull();
    expect(getByText('?')).toBeTruthy();
    expect(queryByText('정답')).toBeNull();

    fireEvent.click(container.querySelector('button')!);
    expect(onSelect).toHaveBeenCalledWith('left');
  });

  it('reveals formatted price and shows 정답 badge only when revealed and isHigher', () => {
    const { getByText } = render(
      <QuestionCard
        pool={testPool}
        tradeIndex={0}
        side="right"
        state="correctPick"
        isHigher={true}
        revealed={true}
        onSelect={vi.fn()}
      />,
    );

    expect(getByText('12억 3,000만원')).toBeTruthy();
    expect(getByText('정답')).toBeTruthy();
  });

  it('ignores clicks when disabled', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <QuestionCard
        pool={testPool}
        tradeIndex={0}
        side="left"
        state="disabled"
        isHigher={false}
        revealed={false}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('uses smaller viewBox width for Seoul sgg than metropolitan area', () => {
    const seoulVb = viewBoxFor(testPool.sgg, '11680').split(' ').map(Number);
    const metroVb = viewBoxFor(testPool.sgg, '41111').split(' ').map(Number);
    expect(seoulVb[2]).toBeLessThan(metroVb[2]);
  });
});
