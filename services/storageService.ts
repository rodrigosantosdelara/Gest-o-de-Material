import { User, DailyRecord, OSRecord, UserRole } from '../types';
import { DEFAULT_ADMIN, DEFAULT_USER, MATERIALS } from '../constants';

const KEYS = {
  USERS: 'app_users',
  DAILY_RECORDS: 'app_daily_records',
  OS_RECORDS: 'app_os_records',
  SESSION: 'app_session',
};

// --- USERS ---
export const getUsers = (): User[] => {
  const stored = localStorage.getItem(KEYS.USERS);
  if (!stored) {
    const defaults = [DEFAULT_ADMIN, DEFAULT_USER];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter((u) => u.id !== id);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

// --- DAILY RECORDS ---
export const getDailyRecords = (): DailyRecord[] => {
  const stored = localStorage.getItem(KEYS.DAILY_RECORDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDailyRecord = (record: DailyRecord) => {
  const records = getDailyRecords();
  const index = records.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(records));
};

export const getRecordsByDate = (date: string): DailyRecord[] => {
  return getDailyRecords().filter((r) => r.date === date);
};

export const initializeDay = (date: string): { success: boolean; message: string } => {
  const records = getDailyRecords();
  
  // Check duplication
  if (records.some((r) => r.date === date)) {
    return { success: false, message: 'Esta data já foi registrada.' };
  }

  // Find previous date for continuity (simple sort implementation)
  const uniqueDates = Array.from(new Set(records.map(r => r.date))).sort();
  const prevDate = uniqueDates.reverse().find(d => d < date);

  const newRecords: DailyRecord[] = MATERIALS.map((mat) => {
    let initial = 0;
    if (prevDate) {
      const prevRecord = records.find(r => r.date === prevDate && r.materialId === mat.id);
      if (prevRecord) {
        // Final = (Initial + StockIn) - Used
        initial = (prevRecord.initial + prevRecord.stockIn) - prevRecord.used;
      }
    }

    return {
      id: `${date}-${mat.id}`,
      date,
      materialId: mat.id,
      initial: Math.max(0, initial), // Prevent negative carry-over logic errors
      stockIn: 0,
      used: 0,
    };
  });

  const updatedRecords = [...records, ...newRecords];
  localStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(updatedRecords));
  return { success: true, message: 'Dia iniciado com sucesso.' };
};

// --- OS RECORDS ---
export const getOSRecords = (): OSRecord[] => {
  const stored = localStorage.getItem(KEYS.OS_RECORDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveOSRecord = (os: OSRecord) => {
  const osRecords = getOSRecords();
  osRecords.push(os);
  localStorage.setItem(KEYS.OS_RECORDS, JSON.stringify(osRecords));

  // INTEGRATION: Update Daily Record Used Amount
  const dailyRecords = getDailyRecords();
  const targetRecordIndex = dailyRecords.findIndex(
    (r) => r.date === os.date && r.materialId === os.materialId
  );

  if (targetRecordIndex >= 0) {
    dailyRecords[targetRecordIndex].used += os.quantity;
    localStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(dailyRecords));
  } else {
    // If the day hasn't been initialized yet, we technically can't add usage to the daily control 
    // unless we create the record. For safety in this MVP, we won't auto-create the day 
    // to force the user to follow the process, but in a real app, we might.
    console.warn("Day not initialized for this OS. Usage not tracked in Daily Control.");
  }
};

// --- SESSION ---
export const getSession = (): User | null => {
  const stored = localStorage.getItem(KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
};

export const setSession = (user: User) => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(KEYS.SESSION);
};
