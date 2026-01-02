import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Alert, AlertDescription } from './ui/Alert';

const QRCodeDisplay = ({ credentialId }) => {
    const [qrCodeData, setQrCodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQRCode = async () => {
            if (!credentialId) return;

            try {
                setLoading(true);
                // Vite proxy handles the localhost:8000 redirection
                const response = await axios.get(`/api/credentials/${credentialId}/qr`);
                setQrCodeData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching QR code:', err);
                setError('Failed to load QR code');
            } finally {
                setLoading(false);
            }
        };

        fetchQRCode();
    }, [credentialId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!qrCodeData) return null;

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="bg-white p-2 rounded-lg shadow-sm border">
                <img
                    src={qrCodeData.qr_code}
                    alt={`QR Code for ${credentialId}`}
                    className="w-48 h-48 object-contain"
                />
            </div>
            <p className="text-sm text-muted-foreground text-center">
                Scan to verify credential
            </p>
            <a
                href={qrCodeData.verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all text-center max-w-xs"
            >
                {qrCodeData.verification_url}
            </a>
        </div>
    );
};

export default QRCodeDisplay;
