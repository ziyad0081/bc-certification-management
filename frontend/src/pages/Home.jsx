import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Shield, CheckCircle, Lock, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Immutable',
      description: 'Credentials stored on blockchain cannot be tampered with or forged.',
    },
    {
      icon: CheckCircle,
      title: 'Easy Verification',
      description: 'Verify credentials instantly with QR codes or credential IDs.',
    },
    {
      icon: Lock,
      title: 'Decentralized',
      description: 'No central authority controls your credentials.',
    },
    {
      icon: Users,
      title: 'Authorized Issuers',
      description: 'Only verified institutions can issue credentials.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Blockchain-based
          <br />
          Credential Verification
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Issue, verify, and manage academic credentials on the blockchain.
          Secure, transparent, and tamper-proof.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link to="/issue">
            <Button size="lg">Issue Credential</Button>
          </Link>
          <Link to="/verify">
            <Button size="lg" variant="outline">
              Verify Credential
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Use Cases */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Completion Certificates</CardTitle>
              <CardDescription>
                Issue certificates for online courses and bootcamps
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Competition Awards</CardTitle>
              <CardDescription>
                Recognize winners of hackathons and competitions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Project Validations</CardTitle>
              <CardDescription>
                Validate internships and project completions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
