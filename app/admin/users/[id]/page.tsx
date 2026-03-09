"use client";

import Link from "next/link";
import { ArrowLeft, User, Shield, Mail, Calendar, FileText, Award, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminUser, Submission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params?.id || "";

  const [user, setUser] = useState<AdminUser | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load user details");
        }

        setUser(data.user || null);
        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [userId]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground mt-1">Complete profile and activity history</p>
        </div>
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">Loading user details...</p> : null}

      {loading ? (
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-secondary"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-secondary rounded w-1/3"></div>
                  <div className="h-4 bg-secondary rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16 bg-secondary rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {user && !loading ? (
        <>
          {/* Profile Header Card */}
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{user.name || user.email}</h3>
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        <User className="h-3 w-3" />
                        User
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-2xl font-bold">{submissions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary/70">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <Calendar className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-lg font-bold">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-muted-foreground/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="text-sm font-bold">
                      {user.lastSubmissionAt
                        ? new Date(user.lastSubmissionAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : "No activity"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* Submissions Table */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-secondary/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submission History ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">No submissions yet</p>
              <p className="text-sm text-muted-foreground mt-1">This user hasn't completed any forms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr className="text-left text-muted-foreground uppercase text-xs tracking-wider">
                    <th className="px-6 py-4 font-semibold">Score</th>
                    <th className="px-6 py-4 font-semibold">Recommended Course</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => {
                    const scoreTone =
                      submission.score >= 80
                        ? "strong"
                        : submission.score >= 60
                          ? "medium"
                          : "low";
                    const scoreClassName =
                      scoreTone === "strong"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : scoreTone === "medium"
                          ? "bg-secondary text-secondary-foreground border-border"
                          : "bg-muted text-muted-foreground border-border";
                    return (
                      <tr key={submission.id} className="hover:bg-secondary/20 transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreClassName}`}>
                            <TrendingUp className="h-3 w-3" />
                            {submission.score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                            <Award className="h-3 w-3" />
                            {submission.recommendedCourse}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {submission.createdAt
                              ? new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/submissions/${encodeURIComponent(submission.id || "")}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            View Details
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
