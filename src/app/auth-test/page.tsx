"use client";

import { useAuth } from '@/components/providers/AuthProvider';

export default function AuthTestPage() {
  const { user, session, profile, usage, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth State Debug</h1>
        
        <div className="grid gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Loading State</h2>
            <p className="text-lg">
              Loading: <span className={loading ? "text-red-500" : "text-green-500"}>
                {loading ? "TRUE" : "FALSE"}
              </span>
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {user ? JSON.stringify(user, null, 2) : "null"}
            </pre>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Session</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {session ? JSON.stringify(session, null, 2) : "null"}
            </pre>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {profile ? JSON.stringify(profile, null, 2) : "null"}
            </pre>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Pro Access Status</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {profile ? `Has Pro Access: ${profile.has_pro_access}` : "No profile data"}
            </pre>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Usage</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {usage ? JSON.stringify(usage, null, 2) : "null"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}