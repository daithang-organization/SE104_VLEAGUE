import { api } from '../lib/api';

// ─────────── Types ───────────
export type UploadResponse = {
  url: string;
  filename: string;
};

// ─────────── API calls ───────────
export function apiUploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<UploadResponse>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}
