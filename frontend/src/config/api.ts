const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    createPaste: '/pastes',
    getPaste: (id: string) => `/pastes/${id}`,
    getPasteInfo: (id: string) => `/pastes/${id}/info`
  }
}; 