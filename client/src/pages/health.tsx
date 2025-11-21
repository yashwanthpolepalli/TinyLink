import { useQuery } from "@tanstack/react-query";
import { Link as WouterLink } from "wouter";
import { ArrowLeft, Activity, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface HealthStatus {
  ok: boolean;
  version: string;
}

export default function HealthPage() {
  const { data: health, isLoading } = useQuery<HealthStatus>({
    queryKey: ["/healthz"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <LinkIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">TinyLink</h1>
            </div>
            <WouterLink href="/">
              <Button variant="ghost" size="sm" data-testid="button-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </WouterLink>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-3xl font-semibold tracking-tight">System Health</h1>
              <p className="text-muted-foreground">
                Monitor the status and version of TinyLink
              </p>
            </div>

            {isLoading ? (
              <Card className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Status
                        </p>
                        <div className="flex items-center gap-2">
                          {health?.ok ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              <span className="text-2xl font-bold" data-testid="text-status">Online</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-destructive" />
                              <span className="text-2xl font-bold">Offline</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={health?.ok ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {health?.ok ? "Healthy" : "Unhealthy"}
                      </Badge>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Version
                      </p>
                      <p className="text-2xl font-bold font-mono" data-testid="text-version">
                        {health?.version || "Unknown"}
                      </p>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Response Data</h2>
                    <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                      <pre data-testid="text-json">{JSON.stringify(health, null, 2)}</pre>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
