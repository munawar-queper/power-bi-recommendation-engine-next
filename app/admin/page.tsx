"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminUser, Submission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TOKEN_STORAGE_KEY = "admin-token";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }, [token]);

  const authHeaders = useMemo(() => {
    if (!token) return undefined;
    return {
      "x-admin-token": token,
    } as Record<string, string>;
  }, [token]);

  const fetchSubmissions = async () => {
    if (!authHeaders) {
      setError("Enter the admin token to load submissions.");
      return;
    }
    setError(null);
    setLoadingSubmissions(true);
    try {
      const res = await fetch("/api/admin/submissions?limit=100", {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load submissions");
      }
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchUsers = async () => {
    if (!authHeaders) {
      setError("Enter the admin token to load users.");
      return;
    }
    setError(null);
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users?limit=100", {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          <Input
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-56"
          />
          <Button onClick={fetchSubmissions} disabled={loadingSubmissions}>
            {loadingSubmissions ? "Loading..." : "Load Submissions"}
          </Button>
          <Button onClick={fetchUsers} variant="outline" disabled={loadingUsers}>
            {loadingUsers ? "Loading..." : "Load Users"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {submissions.length === 0 ? (
              <p className="text-sm text-gray-600">No submissions loaded yet.</p>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg border border-gray-100 p-4 space-y-2 bg-white"
                >
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-semibold">{submission.email}</span>
                    <span className="text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Score: <span className="font-medium">{submission.score}</span> — Course: {submission.recommendedCourse}
                  </p>
                  <div className="text-sm text-gray-800 whitespace-pre-line border rounded-md border-gray-100 p-3 bg-gray-50">
                    {submission.answersText}
                  </div>
                  {submission.aiResponse && typeof submission.aiResponse === "object" && (
                    <div className="text-xs text-gray-600">
                      <div className="font-semibold text-gray-800">AI Title:</div>
                      <div>{submission.aiResponse.title}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {users.length === 0 ? (
              <p className="text-sm text-gray-600">No users loaded yet.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-gray-100 p-3 bg-white"
                >
                  <div className="flex justify-between text-sm text-gray-800">
                    <span className="font-semibold">{user.email}</span>
                    <span className="text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {user.lastSubmissionAt && (
                    <p className="text-xs text-gray-600">
                      Last submission: {new Date(user.lastSubmissionAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
