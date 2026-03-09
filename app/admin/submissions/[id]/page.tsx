"use client";

import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, Award, TrendingUp, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminUser, OpenAIResponse, Submission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubmissionDetailsPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id || "";

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!submissionId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/submissions/${encodeURIComponent(submissionId)}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load submission details");
        }

        setSubmission(data.submission || null);
        setUser(data.user || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load submission details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [submissionId]);

  const aiResponse =
    submission && submission.aiResponse && typeof submission.aiResponse === "object"
      ? (submission.aiResponse as OpenAIResponse)
      : null;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submission Details</h2>
          <p className="text-muted-foreground mt-1">Complete form response and AI recommendations</p>
        </div>
        <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-secondary"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-secondary rounded w-1/3"></div>
                  <div className="h-4 bg-secondary rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-secondary rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-secondary rounded"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {submission ? (
        <>
          {/* User Info Card */}
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  {submission.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">{user?.name || submission.email}</p>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-sm">{submission.email}</span>
                  </div>
                </div>
                {user?.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                    User
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-lg font-bold">
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary/70">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{submission.score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-muted-foreground/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <Award className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended</p>
                    <p className="text-sm font-bold">{submission.recommendedCourse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Q&A Section */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-secondary/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Questionnaire Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {submission.answers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">No answers recorded</p>
                </div>
              ) : (
                submission.answers.map((answer, idx) => (
                  <div key={`${answer.questionId}-${answer.question}`} className="rounded-lg border-2 border-border/50 p-5 bg-background hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {answer.questionId}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base mb-3">{answer.question}</p>
                        <div className="flex flex-wrap gap-2">
                          {answer.selectedOptionText.map((optionText, optIdx) => (
                            <span
                              key={`${answer.questionId}-${optionText}-${optIdx}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3.5 py-1.5 text-sm font-medium text-secondary-foreground"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {optionText}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {aiResponse ? (
            <Card className="shadow-md border-t-4 border-t-primary">
              <CardHeader className="border-b bg-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs uppercase tracking-wider text-primary mb-1">Title</p>
                  <p className="text-lg font-bold text-foreground">{aiResponse.title}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Current Skills
                  </p>
                  <p className="text-sm leading-relaxed pl-6">{aiResponse.currentSkills}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ladder Position
                  </p>
                  <p className="text-sm leading-relaxed pl-6">{aiResponse.ladderPositionDescription}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Next Steps
                  </p>
                  <p className="text-sm leading-relaxed pl-6">{aiResponse.nextSteps}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
