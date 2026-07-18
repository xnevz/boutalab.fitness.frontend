import axios from "axios";
import { Dayjs } from "dayjs";

export interface Athlete {
    id: number;
    name: string;
    lastPaymentDate: Dayjs;
    note?: string;
    phone?: string;
    daysPaid?: number;
    avatar?: string;
}

export const API_URL = 'http://localhost:8048/';

axios.defaults.baseURL = API_URL;

export async function fetchAthletes() {
    return (await axios.get<Athlete[]>('/athletes')).data;
}

export async function fetchLogs() {
    return (await axios.get<{ date: string; message: string; }[]>('/logs')).data;
}

export async function createAthlete(value: Athlete) {
    return (await axios.post<Athlete>('/athletes', value)).data;
}

export async function updateAthlete(value: Athlete) {
    return (await axios.patch<Athlete>(`/athletes`, value)).data;
}

export async function deleteAthlete(id: number) {
    await axios.delete(`/athletes/${id}`);
}

export async function fetchSettings() {
    return (await axios.get<Record<string, string>>('/settings')).data;
}

export async function updateSettings(value: { key: string; value: string }) {
    return (await axios.patch<{ message: string }>('/settings', value)).data;
}