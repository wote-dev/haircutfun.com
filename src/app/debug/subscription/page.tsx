"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSubscriptionStatus, useFeatureAccess } from '@/hooks/useSubscriptionStatus';
import { 
  getSubscriptionStatus, 
  getCachedSubscriptionStatus, 
  refreshSubscriptionFromStripe,
  clearSubscriptionCache
} from '@/lib/subscription-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Database, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  User,
  CreditCard,
  Shield
} from 'lucide-react';

export default function SubscriptionDebugPage() {
  const { user, subscription, loading: authLoading } = useAuth();
  const {
    subscriptionStatus,
    isLoading: hookLoading,
    error: hookError,
    refreshStatus,
    refreshFromStripe,
    clearCache,
    isActive,
    planType,
    hasValidSubscription,
    isExpired,
    daysUntilExpiry
  } = useSubscriptionStatus();
  
  const { hasProAccess, hasPremiumAccess, canAccessFeature } = useFeatureAccess();
  
  const [directStatus, setDirectStatus] = useState<any>(null);
  const [cachedStatus, setCachedStatus] = useState<any>(null);
  const [stripeRefreshResult, setStripeRefreshResult] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Test direct database query
  const testDirectQuery = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      const status = await getSubscriptionStatus(user.id);
      setDirectStatus(status);
    } catch (error) {
      setDirectStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test cached query
  const testCachedQuery = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      const status = await getCachedSubscriptionStatus(user.id);
      setCachedStatus(status);
    } catch (error) {
      setCachedStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test Stripe refresh
  const testStripeRefresh = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      const result = await refreshSubscriptionFromStripe(user.id);
      setStripeRefreshResult(result);
    } catch (error) {
      setStripeRefreshResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Run feature access tests
  const runFeatureTests = () => {
    const tests = {
      freeAccess: canAccessFeature('free'),
      proAccess: canAccessFeature('pro'),
      premiumAccess: canAccessFeature('premium'),
      hasProAccess,
      hasPremiumAccess
    };
    setTestResults(tests);
  };

  // Clear all caches
  const clearAllCaches = () => {
    clearCache();
    setDirectStatus(null);
    setCachedStatus(null);
    setStripeRefreshResult(null);
    setTestResults({});
  };

  useEffect(() => {
    if (user?.id) {
      runFeatureTests();
    }
  }, [user?.id, subscriptionStatus]);

  const StatusBadge = ({ status, label }: { status: boolean | null | undefined; label: string }) => {
    if (status === null || status === undefined) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{label}: Unknown</Badge>;
    }
    return status ? (
      <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{label}: Yes</Badge>
    ) : (
      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{label}: No</Badge>
    );
  };

  const DataCard = ({ title, data, icon }: { title: string; data: any; icon: React.ReactNode }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please sign in to access the subscription debugging tools.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Debug Console</h1>
          <p className="text-muted-foreground">Test and validate subscription status functionality</p>
        </div>
        <Button onClick={clearAllCaches} variant="outline">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Caches
        </Button>
      </div>

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Current Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={isActive} label="Active" />
            <StatusBadge status={hasValidSubscription} label="Valid" />
            <StatusBadge status={isExpired} label="Expired" />
            <StatusBadge status={hasProAccess} label="Pro Access" />
            <StatusBadge status={hasPremiumAccess} label="Premium Access" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Plan Type:</span>
              <div className="text-muted-foreground">{planType || 'Unknown'}</div>
            </div>
            <div>
              <span className="font-medium">Days Until Expiry:</span>
              <div className="text-muted-foreground">{daysUntilExpiry ?? 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium">Hook Loading:</span>
              <div className="text-muted-foreground">{hookLoading ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <span className="font-medium">Hook Error:</span>
              <div className="text-muted-foreground">{hookError || 'None'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>Run various subscription status checks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={testDirectQuery} disabled={isRefreshing}>
              <Database className="w-4 h-4 mr-2" />
              Direct DB Query
            </Button>
            <Button onClick={testCachedQuery} disabled={isRefreshing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Cached Query
            </Button>
            <Button onClick={testStripeRefresh} disabled={isRefreshing}>
              <CreditCard className="w-4 h-4 mr-2" />
              Stripe Refresh
            </Button>
            <Button onClick={() => refreshStatus(true)} disabled={hookLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Hook Refresh
            </Button>
            <Button onClick={refreshFromStripe} disabled={hookLoading}>
              <CreditCard className="w-4 h-4 mr-2" />
              Hook Stripe Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={testResults.freeAccess} label="Free Features" />
            <StatusBadge status={testResults.proAccess} label="Pro Features" />
            <StatusBadge status={testResults.premiumAccess} label="Premium Features" />
          </div>
          <Button onClick={runFeatureTests} size="sm">
            Re-run Tests
          </Button>
        </CardContent>
      </Card>

      {/* Data Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard 
          title="AuthProvider Data" 
          data={{ user: user ? { id: user.id, email: user.email } : null, subscription, loading: authLoading }}
          icon={<User className="w-4 h-4" />}
        />
        
        <DataCard 
          title="Hook Status" 
          data={subscriptionStatus}
          icon={<RefreshCw className="w-4 h-4" />}
        />
        
        {directStatus && (
          <DataCard 
            title="Direct DB Query Result" 
            data={directStatus}
            icon={<Database className="w-4 h-4" />}
          />
        )}
        
        {cachedStatus && (
          <DataCard 
            title="Cached Query Result" 
            data={cachedStatus}
            icon={<Clock className="w-4 h-4" />}
          />
        )}
        
        {stripeRefreshResult && (
          <DataCard 
            title="Stripe Refresh Result" 
            data={stripeRefreshResult}
            icon={<CreditCard className="w-4 h-4" />}
          />
        )}
      </div>

      {/* Data Validation */}
      {subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Subscription Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(subscriptionStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}