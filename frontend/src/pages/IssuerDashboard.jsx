import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import QRCodeDisplay from '../components/QRCodeDisplay';

const IssuerDashboard = () => {
  const { account, isConnected, connectWallet, getIssuerCredentials, getCredential, revokeCredential, isAuthorizedIssuer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [error, setError] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [showQr, setShowQr] = useState(null);

  useEffect(() => {
    if (account) {
      checkAuthorizationAndLoad();
    }
  }, [account]);

  const checkAuthorizationAndLoad = async () => {
    try {
      const isAuth = await isAuthorizedIssuer(account);
      setAuthorized(isAuth);

      if (isAuth) {
        loadCredentials();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadCredentials = async () => {
    setLoading(true);
    setError(null);

    try {
      const credentialIds = await getIssuerCredentials(account);

      const credentialDetails = await Promise.all(
        credentialIds.map(async (id) => {
          try {
            return await getCredential(id);
          } catch (err) {
            console.error(`Error fetching credential ${id}:`, err);
            return null;
          }
        })
      );

      setCredentials(credentialDetails.filter(c => c !== null));
    } catch (err) {
      setError(err.message || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this credential? This action cannot be undone.')) {
      return;
    }

    setRevoking(credentialId);
    try {
      await revokeCredential(credentialId);
      // Reload credentials
      await loadCredentials();
    } catch (err) {
      setError(err.message || 'Failed to revoke credential');
    } finally {
      setRevoking(null);
    }
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to view your dashboard
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
            Your account is not authorized as an issuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only authorized issuers can access this dashboard. Please contact the administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your issued credentials
          </p>
        </div>
        <Button onClick={loadCredentials} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && credentials.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : credentials.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              No credentials issued yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {credentials.length} Credential{credentials.length !== 1 ? 's' : ''} Issued
          </h2>

          {credentials.map((credential) => (
            <Card key={credential.credentialId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{credential.credentialType}</CardTitle>
                    <CardDescription>
                      Issued to {credential.recipientName} ({credential.recipientEmail})
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {credential.isValid ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-600">Revoked</span>
                        </>
                      )}
                    </div>
                    {credential.isValid && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(credential.credentialId)}
                        disabled={revoking === credential.credentialId}
                      >
                        {revoking === credential.credentialId ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Revoking...
                          </>
                        ) : (
                          'Revoke'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{credential.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                    <p className="text-sm">{formatDate(credential.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Credential ID</p>
                    <p className="text-sm font-mono break-all text-xs">{credential.credentialId}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowQr(showQr === credential.credentialId ? null : credential.credentialId)}
                  >
                    {showQr === credential.credentialId ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>

                  {showQr === credential.credentialId && (
                    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                      <QRCodeDisplay credentialId={credential.credentialId} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuerDashboard;
