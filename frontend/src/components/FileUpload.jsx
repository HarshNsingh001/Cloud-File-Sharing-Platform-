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
      <input {...getInputProps()} />
      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4" />
      <p className="text-lg font-medium">
        {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
      <p className="text-xs text-gray-400 mt-2">Max size: 100MB</p>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>

              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                title="Remove"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
