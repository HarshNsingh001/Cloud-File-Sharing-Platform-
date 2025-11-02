import React, { useState } from 'react';
import { Download, Share2, Trash2, File } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { fileService } from '../services/files';
import ShareModal from './ShareModal';
  import DeleteModal from './DeleteModal';

export default function FileTable({ files, onFileDeleted }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDownload = async (file) => {
    try {
      const { download_url } = await fileService.downloadFile(file.id);
      window.open(download_url, '_blank');
      toast.success('Downloading file...');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  const handleDelete = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <>
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Size</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Uploaded</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <File className="w-4 h-4 text-gray-500" />
                  {file.name}
                </td>
                <td className="py-3 px-4">{formatFileSize(file.file_size)}</td>
                <td className="py-3 px-4">{file.file_type}</td>
                <td className="py-3 px-4">{format(new Date(file.uploaded_at), 'MMM d, yyyy')}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>

                  <button
                    onClick={() => handleShare(file)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shareModalOpen && (
        <ShareModal
          file={selectedFile}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {deleteModalOpen && (
        <DeleteModal
          file={selectedFile}
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={onFileDeleted}
        />
      )}
    </>
  );
}
