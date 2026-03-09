"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminUser } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Shield, Calendar, FileText, ArrowRight } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: "200",
          q: search,
        });

        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load users");
        }

        setUsers(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadUsers, 250);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="mt-1 text-muted-foreground">Manage and view all registered users.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-foreground/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2 text-foreground/80">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.lastSubmissionAt).length}</p>
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
          placeholder="Search by email, name, or role..."
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
            <User className="h-5 w-5" />
            Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto p-0">
          {loading ? (
            <div className="space-y-4 p-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-secondary"></div>
                    <div className="h-3 w-1/4 rounded bg-secondary"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && users.length === 0 ? (
            <div className="p-12 text-center">
              <User className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
              <p className="font-medium text-muted-foreground">No users found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</p>
            </div>
          ) : null}

          {!loading && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary/70">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold">Last Activity</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-secondary/25">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.name ? (
                              <p className="text-xs text-muted-foreground">{user.name}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                            <User className="h-3 w-3" />
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.lastSubmissionAt ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-primary/70" />
                            <span>
                              {new Date(user.lastSubmissionAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">No submissions</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${encodeURIComponent(user.id || user.email)}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all duration-200 hover:text-primary/80 group-hover:gap-2"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
