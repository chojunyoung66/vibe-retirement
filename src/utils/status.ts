import type { AssetDepletionStatus } from '../types';

export const statusColor: Record<AssetDepletionStatus, string> = {
  stable: '#10B981',
  watch: '#F59E0B',
  risk: '#F59E0B',
  depleted: '#EF4444',
  unknown: '#6B7280',
};

export const statusLabel: Record<AssetDepletionStatus, string> = {
  stable: '안전',
  watch: '주의',
  risk: '위험',
  depleted: '고갈',
  unknown: '미확인',
};
