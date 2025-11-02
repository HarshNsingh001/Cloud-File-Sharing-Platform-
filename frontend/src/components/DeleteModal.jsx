
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fileService } from '../services/files';

export default function DeleteModal({ file, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fileService.deleteFile(file.id);
      toast.success('File deleted successfully');
      onDeleted();
      onClose();
    } catch (error) {
      toast.error('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
        
          
            
          
          
            Delete File
            
              Are you sure you want to delete {file.name}? This action cannot be undone.
            
          
          
            
          
        

        
          
            Cancel
          
          
            {loading ? 'Deleting...' : 'Delete'}
          
        
      
    
  );
}
