import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../lib/utils';
import Button from './ui/Button';
import { Shield, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const { account, isConnected, connectWallet, chainId, error, clearError, switchToHardhatNetwork } = useWeb3();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const navigation = [
        { name: 'Home', path: '/' },
        { name: 'Issue Credential', path: '/issue' },
        { name: 'Verify', path: '/verify' },
        { name: 'My Credentials', path: '/my-credentials' },
        { name: 'Issuer Dashboard', path: '/issuer-dashboard' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8" />
                            <span className="text-xl font-bold">CredentialChain</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-6">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.path)
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Wallet Connection */}
                        <div className="flex items-center space-x-4">
                            {chainId && chainId !== 1337 && (
                                <button
                                    onClick={switchToHardhatNetwork}
                                    className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90 transition-colors"
                                >
                                    Wrong Network (Switch)
                                </button>
                            )}

                            {isConnected ? (
                                <div className="flex items-center space-x-2">
                                    <div className="hidden sm:block text-sm text-muted-foreground">
                                        {formatAddress(account)}
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                </div>
                            ) : (
                                <Button onClick={connectWallet} size="sm">
                                    Connect Wallet
                                </Button>
                            )}

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>
            </header>

            {/* Error Notification */}
            {error && (
                <div className="bg-destructive/10 border-b border-destructive/20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                            <button
                                onClick={clearError}
                                className="text-xs text-destructive hover:text-destructive/80"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-muted-foreground">
                        © 2024 CredentialChain. Blockchain-based credential verification.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
