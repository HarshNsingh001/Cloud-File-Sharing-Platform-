import { useState } from 'react';
import { Download, Share2, Trash2, File } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { fileService } from '../services/files';
import ShareModal from './ShareModal';
import DeleteModal from './DeleteModal';
import React from 'react';

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





      Name


      Size


      Type


      Uploaded


      Actions




      {files.map((file) => (




        { file.name }
                  
                
                
                  { formatFileSize(file.file_size)}


      {file.file_type}


      {format(new Date(file.uploaded_at), 'MMM d, yyyy')}



      <button
        onClick={() => handleDownload(file)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        title="Download"
      >


        <button
          onClick={() => handleShare(file)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Share"
        >


          <button
            onClick={() => handleDelete(file)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
            title="Delete"
          >
                      
                    
                  
                
              
            ))}




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