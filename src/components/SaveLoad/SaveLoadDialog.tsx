import { useState } from 'react';
import { saveData, loadData, deleteData, hasSavedData } from '../../storage/localStore';
import type { UserInput } from '../../types';

type Mode = 'save' | 'load';

type Props = {
  mode: Mode;
  currentData?: UserInput;
  onLoad?: (data: UserInput) => void;
  onClose: () => void;
};

export default function SaveLoadDialog({ mode, currentData, onLoad, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!password) { setError('비밀번호를 입력하세요.'); return; }
    if (!currentData) return;
    saveData(currentData, password);
    setSaved(true);
  };

  const handleLoad = () => {
    if (!password) { setError('비밀번호를 입력하세요.'); return; }
    const data = loadData(password);
    if (!data) { setError('비밀번호가 일치하지 않거나 저장된 데이터가 없습니다.'); return; }
    onLoad?.(data);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('저장된 데이터를 삭제하시겠습니까? 복구할 수 없습니다.')) {
      deleteData();
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <h2 className="dialog-title">{mode === 'save' ? '저장' : '불러오기'}</h2>

        {mode === 'save' && !saved && (
          <div className="notice-box">
            입력 내용은 이 기기의 브라우저에 저장됩니다. 서버 계정 저장이 아니므로 다른 기기에서는 불러올 수 없습니다.
          </div>
        )}

        {mode === 'load' && !hasSavedData() && (
          <div className="notice-box warning">저장된 데이터가 없습니다.</div>
        )}

        {!saved ? (
          <>
            <div className="field-group">
              <label className="field-label">
                비밀번호
              </label>
              <p className="field-hint">
                비밀번호는 이 브라우저에 저장된 리포트를 다시 열기 위한 용도입니다. 비밀번호를 잊으면 저장된 내용을 복구할 수 없습니다.
              </p>
              <input
                type="password"
                className="input-field"
                placeholder="비밀번호 입력"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                취소
              </button>
              {mode === 'save' && hasSavedData() && (
                <button type="button" className="btn-danger" onClick={handleDelete}>
                  삭제
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={mode === 'save' ? handleSave : handleLoad}
              >
                {mode === 'save' ? '저장하기' : '불러오기'}
              </button>
            </div>
          </>
        ) : (
          <div className="success-box">
            <p>저장되었습니다.</p>
            <button type="button" className="btn-primary" onClick={onClose}>
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
