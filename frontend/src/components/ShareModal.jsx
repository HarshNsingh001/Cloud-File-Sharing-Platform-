import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { fileService } from '../services/files';

export default function ShareModal({ file, onClose }) {
  const [permission, setPermission] = useState('view');
  const [expiryHours, setExpiryHours] = useState(24);
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const result = await fileService.createShare({
        file_id: file.id,
        permission,
        expires_in_hours: expiryHours,
      });
      
      const fullLink = `${window.location.origin}/share/${result.share_link}`;
      setShareLink(fullLink);
      toast.success('Share link created!');
    } catch (error) {
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    
      
        
          Share File
          
            
          
        

        
          
            {file.name}
            
              {(file.file_size / 1024 / 1024).toFixed(2)} MB
            
          

          {!shareLink ? (
            <>
              
                Permission
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  View Only
                  Download
                
              

              
                Expires In
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  1 Hour
                  24 Hours
                  7 Days
                  30 Days
                
              

              
                {loading ? 'Creating...' : 'Create Share Link'}
              
            </>
          ) : (
            <>
              
                
              

              
                
                
                  {copied ?  : }
                  {copied ? 'Copied!' : 'Copy'}
                
              
            </>
          )}
        
      
    
  );
}