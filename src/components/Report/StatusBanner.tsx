import type { AssetDepletionStatus } from '../../types';
import { statusColor, statusLabel } from '../../utils/status';

type Props = {
  status: AssetDepletionStatus;
  estimatedDepletionAge?: number;
};

const statusDesc: Record<AssetDepletionStatus, (age?: number) => string> = {
  stable: () => '시뮬레이션 기간 내 자산이 유지됩니다.',
  watch: () => '자산 잔액을 주의 깊게 모니터링하세요.',
  risk: () => '자산 고갈 위험이 있습니다. 지출 조정이 필요합니다.',
  depleted: (age) => `${age}세경 자산이 고갈될 수 있습니다.`,
  unknown: () => '',
};

const statusIcon: Record<AssetDepletionStatus, string> = {
  stable: '✓',
  watch: '△',
  risk: '△',
  depleted: '!',
  unknown: '?',
};

export default function StatusBanner({ status, estimatedDepletionAge }: Props) {
  const color = statusColor[status];
  return (
    <div className="status-banner" style={{ backgroundColor: color + '20', borderColor: color }}>
      <span className="status-icon" style={{ color }}>{statusIcon[status]}</span>
      <div>
        <div className="status-label" style={{ color }}>{statusLabel[status]}</div>
        <div className="status-desc">{statusDesc[status](estimatedDepletionAge)}</div>
      </div>
    </div>
  );
}
