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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Share File
        </h2>

        {/* File Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{file.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(file.file_size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* Share Link Creation */}
        {!shareLink ? (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permission
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="view">View Only</option>
                <option value="download">Download</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expires In
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value={1}>1 Hour</option>
                <option value={24}>24 Hours</option>
                <option value={168}>7 Days</option>
                <option value={720}>30 Days</option>
              </select>
            </div>

            <button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? 'Creating...' : 'Create Share Link'}
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <QRCodeSVG value={shareLink} size={128} className="mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 break-all mb-3">
                {shareLink}
              </p>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
