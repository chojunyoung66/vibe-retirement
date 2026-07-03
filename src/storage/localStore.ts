import type { UserInput } from '../types';

const DATA_KEY = 'vibe-retirement-data';
const PASSWORD_KEY = 'vibe-retirement-pw';

export function saveData(data: UserInput, password: string): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  localStorage.setItem(PASSWORD_KEY, password);
}

export function loadData(password: string): UserInput | null {
  const storedPw = localStorage.getItem(PASSWORD_KEY);
  if (storedPw !== password) return null;
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInput;
  } catch {
    return null;
  }
}

export function deleteData(): void {
  localStorage.removeItem(DATA_KEY);
  localStorage.removeItem(PASSWORD_KEY);
}

export function hasSavedData(): boolean {
  return localStorage.getItem(DATA_KEY) !== null;
}
