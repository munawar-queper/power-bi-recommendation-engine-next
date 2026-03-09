"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Submission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, TrendingUp, Calendar, ArrowRight, Award } from "lucide-react";

function getScoreTone(score: number | undefined) {
  if (!score && score !== 0) return "neutral";
  if (score >= 75) return "strong";
  if (score >= 45) return "medium";
  return "low";
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: "200",
          q: search,
        });

        const res = await fetch(`/api/admin/submissions?${params.toString()}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load submissions");
        }

        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadSubmissions, 250);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const averageScore = useMemo(() => {
    if (submissions.length === 0) return 0;
    return Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length);
  }, [submissions]);

  const topCourse = useMemo(() => {
    if (submissions.length === 0) return "N/A";
    const courseCounts = submissions.reduce((acc, s) => {
      acc[s.recommendedCourse] = (acc[s.recommendedCourse] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [submissions]);

  const thisWeekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return submissions.filter((s) => s.createdAt && new Date(s.createdAt) > weekAgo).length;
  }, [submissions]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
        <p className="mt-1 text-muted-foreground">View and manage all form submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-foreground/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2 text-foreground/80">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Course</p>
                <p className="truncate text-sm font-bold">{topCourse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{thisWeekCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, course, or answer text..."
          className="pl-10"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-secondary/40">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Latest Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto p-0">
          {loading ? (
            <div className="space-y-4 p-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-secondary"></div>
                    <div className="h-3 w-1/3 rounded bg-secondary"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && submissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
              <p className="font-medium text-muted-foreground">No submissions found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</p>
            </div>
          ) : null}

          {!loading && submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/70">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                    <th className="px-6 py-4 font-semibold">Recommended Course</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => {
                    const scoreTone = getScoreTone(submission.score);
                    const scoreClassName =
                      scoreTone === "strong"
                        ? "border border-primary/30 bg-primary/10 text-primary"
                        : scoreTone === "medium"
                          ? "border border-border bg-secondary text-secondary-foreground"
                          : scoreTone === "low"
                            ? "border border-border bg-muted text-muted-foreground"
                            : "border border-border bg-secondary text-secondary-foreground";

                    return (
                      <tr key={submission.id} className="group transition-colors hover:bg-secondary/25">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {submission.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{submission.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${scoreClassName}`}>
                            <TrendingUp className="h-3 w-3" />
                            {submission.score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                            <Award className="h-3 w-3" />
                            {submission.recommendedCourse}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {submission.createdAt
                              ? new Date(submission.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/submissions/${encodeURIComponent(submission.id || "")}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all duration-200 hover:text-primary/80 group-hover:gap-2"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
