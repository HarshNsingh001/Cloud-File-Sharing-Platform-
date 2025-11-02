import api from './api';

export const fileService = {
  async getFiles() {
    const response = await api.get('/files/');
    return response.data;
  },

  async uploadFile(file, name) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await api.post('/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async downloadFile(fileId) {
    const response = await api.get(`/files/${fileId}/download/`);
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await api.delete(`/files/${fileId}/delete/`);
    return response.data;
  },

  async createShare(shareData) {
    const response = await api.post('/files/share/', shareData);
    return response.data;
  },

  async getSharedFiles() {
    const response = await api.get('/files/shared/');
    return response.data;
  },

  async accessSharedFile(shareLink) {
    const response = await api.get(`/files/share/${shareLink}/`);
    return response.data;
  },
};