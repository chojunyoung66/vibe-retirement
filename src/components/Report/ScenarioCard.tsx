import type { ScenarioResult } from '../../types';
import { statusColor, statusLabel } from '../../utils/status';

type Props = {
  scenario: ScenarioResult;
};

export default function ScenarioCard({ scenario }: Props) {
  const color = statusColor[scenario.depletion.status];
  return (
    <div className="scenario-card" style={{ borderColor: color }}>
      <div className="scenario-label">{scenario.label}</div>
      <div className="scenario-status" style={{ color }}>{statusLabel[scenario.depletion.status]}</div>
      <div className="scenario-detail">
        {scenario.depletion.depletionAge ? `${scenario.depletion.depletionAge}세 고갈` : '고갈 없음'}
      </div>
    </div>
  );
}
