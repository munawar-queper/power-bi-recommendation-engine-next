"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAnalyticsResponse } from "@/types";
import {
  FileText,
  Users,
  TrendingUp,
  Award,
  Mail,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const defaultAnalytics: AdminAnalyticsResponse = {
  totals: {
    submissions: 0,
    users: 0,
    submissionsThisWeek: 0,
  },
  recommendationDistribution: [],
  dailyTrend: [],
  topCategories: [],
  notificationHealth: {
    sent: 0,
    failed: 0,
  },
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse>(defaultAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/analytics", {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load analytics");
        }

        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const notificationSuccessRate =
    analytics.notificationHealth.sent + analytics.notificationHealth.failed > 0
      ? Math.round(
          (analytics.notificationHealth.sent /
            (analytics.notificationHealth.sent + analytics.notificationHealth.failed)) *
            100
        )
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          Monitor submissions, users, recommendation trends, and system health.
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="mt-1 text-3xl font-bold">{analytics.totals.submissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-foreground/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-secondary p-3 text-foreground/80">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="mt-1 text-3xl font-bold">{analytics.totals.users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="mt-1 text-3xl font-bold">{analytics.totals.submissionsThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Course Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-secondary/40">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Course Recommendation Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3">
                    <div className="h-4 flex-1 rounded bg-secondary"></div>
                    <div className="h-4 w-12 rounded bg-secondary"></div>
                  </div>
                ))}
              </div>
            ) : analytics.recommendationDistribution.length === 0 ? (
              <div className="py-12 text-center">
                <Award className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
                <p className="text-sm text-muted-foreground">No recommendation data yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recommendationDistribution.map((item) => {
                  const maxCount = Math.max(...analytics.recommendationDistribution.map((d) => d.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.course} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.course}</span>
                        <span className="font-bold text-primary">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-secondary/40">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Submission Trend (Last 10 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3">
                    <div className="h-4 flex-1 rounded bg-secondary"></div>
                    <div className="h-4 w-12 rounded bg-secondary"></div>
                  </div>
                ))}
              </div>
            ) : analytics.dailyTrend.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
                <p className="text-sm text-muted-foreground">No trend data yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.dailyTrend.slice(-10).map((point) => {
                  const maxCount = Math.max(...analytics.dailyTrend.map((d) => d.count));
                  const percentage = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
                  return (
                    <div key={point.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground">{point.date}</span>
                        <span className="font-bold text-primary">{point.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Categories */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-secondary/40">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Answer Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3">
                    <div className="h-4 flex-1 rounded bg-secondary"></div>
                    <div className="h-4 w-12 rounded bg-secondary"></div>
                  </div>
                ))}
              </div>
            ) : analytics.topCategories.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
                <p className="text-sm text-muted-foreground">No category data yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topCategories.map((category, idx) => {
                  const maxCount = Math.max(...analytics.topCategories.map((c) => c.count));
                  const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
                  return (
                    <div key={category.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <span className="font-bold text-primary">{category.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Notification Health */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-secondary/40">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notification Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-20 animate-pulse rounded-lg bg-secondary"></div>
                <div className="h-20 animate-pulse rounded-lg bg-secondary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Rate Circle */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-6">
                  <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
                    <span className="text-2xl font-bold text-primary">{notificationSuccessRate}%</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Emails Sent</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {analytics.notificationHealth.sent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">Emails Failed</span>
                    </div>
                    <span className="text-xl font-bold text-destructive">
                      {analytics.notificationHealth.failed}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
