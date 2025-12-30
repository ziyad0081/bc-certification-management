import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

const MyCredentials = () => {
  const { getRecipientCredentials, getCredential } = useWeb3();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setCredentials([]);

    try {
      const credentialIds = await getRecipientCredentials(email);
      
      if (credentialIds.length === 0) {
        setError('No credentials found for this email');
        setLoading(false);
        return;
      }

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
      setError(err.message || 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Credentials</h1>
        <p className="text-muted-foreground mt-2">
          View all credentials associated with your email
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Credentials</CardTitle>
          <CardDescription>
            Enter your email to view your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Search Credentials'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {credentials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
          </h2>
          
          {credentials.map((credential) => (
            <Card key={credential.credentialId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{credential.credentialType}</CardTitle>
                    <CardDescription>{credential.issuerName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {credential.isValid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Valid</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Revoked</span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{credential.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-sm">{formatDate(credential.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credential ID</p>
                  <p className="text-sm font-mono break-all text-xs">{credential.credentialId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCredentials;
