import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCodeDisplay from '../components/QRCodeDisplay';
import DownloadButton from '../components/DownloadButton';
import { useWeb3 } from '../contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

const VerifyCredential = () => {
  const { credentialId: urlCredentialId } = useParams();
  const { verifyCredential, getCredential } = useWeb3();
  const [credentialId, setCredentialId] = useState(urlCredentialId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fullDetails, setFullDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlCredentialId) {
      handleVerify(urlCredentialId);
    }
  }, [urlCredentialId]);

  const handleVerify = async (id = credentialId) => {
    if (!id.trim()) {
      setError('Please enter a credential ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setFullDetails(null);

    try {
      const verification = await verifyCredential(id);
      setResult(verification);

      if (verification.exists) {
        const details = await getCredential(id);
        setFullDetails(details);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verify Credential</h1>
        <p className="text-muted-foreground mt-2">
          Check the authenticity of a credential
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Credential ID</CardTitle>
          <CardDescription>
            Enter the credential ID to verify its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Enter credential ID"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Credential'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && !result.exists && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Credential Not Found</AlertTitle>
          <AlertDescription>
            This credential ID does not exist in the blockchain
          </AlertDescription>
        </Alert>
      )}

      {result && result.exists && !result.isValid && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Credential Revoked</AlertTitle>
          <AlertDescription>
            This credential has been revoked by the issuer
          </AlertDescription>
        </Alert>
      )}

      {result && result.exists && result.isValid && (
        <>
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Verified Credential</AlertTitle>
            <AlertDescription>
              This credential is valid and authentic
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Verification QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRCodeDisplay credentialId={credentialId} />
              <DownloadButton credentialId={credentialId} className="w-full" />
            </CardContent>
          </Card>
        </>
      )}

      {fullDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Credential Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Credential ID</p>
              <p className="text-sm font-mono break-all">{fullDetails.credentialId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recipient</p>
              <p className="text-sm">{fullDetails.recipientName}</p>
              <p className="text-sm text-muted-foreground">{fullDetails.recipientEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issuer</p>
              <p className="text-sm">{fullDetails.issuerName}</p>
              <p className="text-sm text-muted-foreground font-mono">{fullDetails.issuer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Credential Type</p>
              <p className="text-sm">{fullDetails.credentialType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{fullDetails.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
              <p className="text-sm">{formatDate(fullDetails.issueDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {fullDetails.isValid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Revoked</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyCredential;
