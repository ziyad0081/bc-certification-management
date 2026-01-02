import React, { useState } from 'react';
import axios from 'axios';
import { Download, Loader2 } from 'lucide-react';
import Button from './ui/Button';

const DownloadButton = ({ credentialId, variant = "default", size = "default", className = "" }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            // Use relative path so vite proxy handles it
            const response = await axios.get(`/api/credentials/${credentialId}/pdf`, {
                responseType: 'blob', // Important for binary data
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `credential-${credentialId}.pdf`);

            // Append to html link element page and click
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('Failed to download PDF. The credential might be invalid or server error.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={downloading}
            className={className}
        >
            {downloading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </>
            )}
        </Button>
    );
};

export default DownloadButton;
