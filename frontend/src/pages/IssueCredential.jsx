import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import DownloadButton from '../components/DownloadButton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const IssueCredential = () => {
  const { account, isConnected, connectWallet, issueCredential, isAuthorizedIssuer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [generatedId, setGeneratedId] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    issuerName: '',
    credentialType: '',
    description: '',
    metadataUri: '',
  });

  React.useEffect(() => {
    if (account) {
      checkAuthorization();
    }
  }, [account]);

  const checkAuthorization = async () => {
    try {
      const isAuth = await isAuthorizedIssuer(account);
      setAuthorized(isAuth);
    } catch (err) {
      console.error('Error checking authorization:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateCredentialId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      if (!isConnected) {
        await connectWallet();
        return;
      }

      const newCredentialId = generateCredentialId();
      setGeneratedId(newCredentialId);

      const hash = await issueCredential({
        credentialId: newCredentialId,
        ...formData,
      });

      setTxHash(hash);

      // Reset form (except generated ID which is needed for download)
      setFormData({
        recipientName: '',
        recipientEmail: '',
        issuerName: '',
        credentialType: '',
        description: '',
        metadataUri: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to issue credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet}>Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  if (authorized === false) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Not Authorized</CardTitle>
          <CardDescription>
            Your account is not authorized to issue credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only authorized issuers can create credentials. Please contact the administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Credential</h1>
        <p className="text-muted-foreground mt-2">
          Create a new blockchain-verified credential
        </p>
      </div>

      {txHash && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Credential issued successfully. Transaction hash: {txHash}
          </AlertDescription>
          {generatedId && (
            <div className="mt-4">
              <DownloadButton credentialId={generatedId} size="sm" variant="outline" className="bg-white" />
            </div>
          )}
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Credential Information</CardTitle>
          <CardDescription>
            Fill in the details for the credential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuerName">Issuer Name</Label>
              <Input
                id="issuerName"
                name="issuerName"
                value={formData.issuerName}
                onChange={handleChange}
                placeholder="University of Technology"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialType">Credential Type</Label>
              <Input
                id="credentialType"
                name="credentialType"
                value={formData.credentialType}
                onChange={handleChange}
                placeholder="Course Completion Certificate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Blockchain Development Bootcamp 2024"
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadataUri">Metadata URI (Optional)</Label>
              <Input
                id="metadataUri"
                name="metadataUri"
                value={formData.metadataUri}
                onChange={handleChange}
                placeholder="ipfs://..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing Credential...
                </>
              ) : (
                'Issue Credential'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueCredential;
