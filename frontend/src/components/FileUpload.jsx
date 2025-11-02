import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fileService } from '../services/files';

export default function FileUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await fileService.uploadFile(selectedFile);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      onUploadComplete();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }`}
      >
        
        
        
          {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
        
        or click to browse
        Max size: 100MB
      

      
        {selectedFile && (
          
            
              
                
              
              
                {selectedFile.name}
                
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                
              
            

            
              
                {uploading ? 'Uploading...' : 'Upload'}
              
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                
              
            
          
        )}
      
    
  );
}