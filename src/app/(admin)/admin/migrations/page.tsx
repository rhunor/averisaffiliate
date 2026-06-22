"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MigrationResult {
  success: boolean;
  results?: string[];
  error?: string;
}

interface Migration {
  id: string;
  title: string;
  description: string;
  endpoint: string;
}

const migrations: Migration[] = [
  {
    id: "settle-commissions",
    title: "Settle Pending Commissions",
    description:
      "Immediately marks all pending commissions older than 24 hours as completed so affiliates can withdraw. Safe to run anytime — the nightly cron does this automatically.",
    endpoint: "/api/admin/settle-commissions",
  },
  {
    id: "diagnose",
    title: "Diagnose: Show Lessons in DB",
    description:
      "Read-only. Lists every lesson in the Mindset and Affiliate Marketing courses so you can confirm what's actually in the database.",
    endpoint: "/api/admin/migrate/diagnose",
  },
  {
    id: "june19-updates",
    title: "June 19 Updates",
    description:
      "Updates the Lesson 12 Google Drive resource link, and adds Lesson 1 Part 2 (YouTube) while converting the existing Lesson 1 Cloudinary video to Part 1 — all in Affiliate Marketing.",
    endpoint: "/api/admin/migrate/june19-updates",
  },
  {
    id: "lesson10-part2-cloudinary",
    title: "Lesson 10 Part 2 → Cloudinary Video",
    description:
      "Replaces the YouTube video on 'Part 2 — Practical Sales Closing' (Lesson 10: Sales Closing) with the Cloudinary video link.",
    endpoint: "/api/admin/migrate/lesson10-part2-cloudinary",
  },
  {
    id: "fix-arrangement",
    title: "Fix Lesson Arrangement",
    description:
      "Moves DM Sales Closing into Lesson 10: Sales Closing as Part 3, moves Conclusion before Bonus Lessons, and creates Bonus 4 with the Cloudinary video (removing it from the wrong Bonus 1 position).",
    endpoint: "/api/admin/migrate/fix-arrangement",
  },
  {
    id: "cloudinary-lessons",
    title: "Add Cloudinary Videos to Lessons",
    description:
      "Adds Lesson 1 (Mindset and getting into Result mode) to the Mindset course and Part 4 Bonus to Affiliate Marketing — both with Cloudinary video links.",
    endpoint: "/api/admin/migrate/cloudinary-lessons",
  },
  {
    id: "affiliate-lessons",
    title: "Fix Affiliate Marketing Lessons",
    description:
      "Adds Part 3 DM Sales Closing (lesson 10), fixes Part 5 broken video link (lesson 12), and adds the Conclusion lesson (lesson 13) to the Affiliate Marketing course.",
    endpoint: "/api/admin/migrate/affiliate-lessons",
  },
];

export default function MigrationsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, MigrationResult>>({});
  const [welcomeEmail, setWelcomeEmail] = useState("");
  const [welcomeRunning, setWelcomeRunning] = useState(false);
  const [welcomeResult, setWelcomeResult] = useState<MigrationResult | null>(null);

  async function sendWelcome() {
    if (!welcomeEmail.trim() || welcomeRunning) return;
    setWelcomeRunning(true);
    setWelcomeResult(null);
    try {
      const res = await fetch("/api/admin/tools/resend-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: welcomeEmail.trim() }),
      });
      const data = await res.json();
      setWelcomeResult({ success: res.ok && data.success, results: data.results, error: data.error });
    } catch {
      setWelcomeResult({ success: false, error: "Network error — check connection and try again." });
    } finally {
      setWelcomeRunning(false);
    }
  }

  async function runMigration(migration: Migration) {
    if (running) return;
    setRunning(migration.id);
    setResults((prev) => ({ ...prev, [migration.id]: { success: false, results: [] } }));

    try {
      const res = await fetch(migration.endpoint, { method: "POST" });
      const data = await res.json();
      setResults((prev) => ({
        ...prev,
        [migration.id]: {
          success: res.ok && data.success,
          results: data.results,
          error: !res.ok ? data.error : undefined,
        },
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [migration.id]: { success: false, error: "Network error — check connection and try again." },
      }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Migrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Run one-time data migrations. Each is safe to run multiple times — already-done steps are skipped.
        </p>
      </div>

      {/* Email tools */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base">Resend Welcome Email</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manually send the welcome + referral link email to a user who didn&apos;t receive it after signup.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="user@email.com"
              value={welcomeEmail}
              onChange={(e) => setWelcomeEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendWelcome()}
              className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
            <button
              onClick={sendWelcome}
              disabled={welcomeRunning || !welcomeEmail.trim()}
              className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60"
            >
              {welcomeRunning ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><Mail className="h-4 w-4" /> Send</>
              )}
            </button>
          </div>
          {welcomeResult && (
            <div className={`rounded-xl p-3 text-sm ${welcomeResult.error ? "bg-danger/10 border border-danger/20" : "bg-muted/50 border border-border"}`}>
              {welcomeResult.error ? (
                <div className="flex items-center gap-2 text-danger font-medium">
                  <XCircle className="h-4 w-4 shrink-0" /> {welcomeResult.error}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-success font-semibold">
                    <CheckCircle className="h-4 w-4" /> Done
                  </div>
                  {(welcomeResult.results || []).map((line, i) => (
                    <p key={i} className="font-mono text-xs text-success">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {migrations.map((migration) => {
          const result = results[migration.id];
          const isRunning = running === migration.id;

          return (
            <Card key={migration.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{migration.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{migration.description}</p>
                  </div>
                  <button
                    onClick={() => runMigration(migration)}
                    disabled={!!running}
                    className="shrink-0 flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running…
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        Run
                      </>
                    )}
                  </button>
                </div>
              </CardHeader>

              {result && (
                <CardContent className="pt-0">
                  <div
                    className={`rounded-xl p-4 text-sm ${
                      result.error
                        ? "bg-danger/10 border border-danger/20"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    {result.error ? (
                      <div className="flex items-center gap-2 text-danger font-medium">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {result.error}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-success font-semibold mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Migration complete
                        </div>
                        {(result.results || []).map((line, i) => (
                          <p
                            key={i}
                            className={`font-mono text-xs leading-relaxed ${
                              line.startsWith("✓")
                                ? "text-success"
                                : line.startsWith("⚠")
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
