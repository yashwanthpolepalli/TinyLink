import { useParams, Link as WouterLink } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MousePointerClick, Calendar, TrendingUp, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import type { Link } from "@shared/schema";

export default function StatsPage() {
  const { code } = useParams();
  const { toast } = useToast();

  const { data: link, isLoading, error } = useQuery<Link>({
    queryKey: ["/api/links", code],
  });

  const copyToClipboard = async () => {
    if (!code) return;
    const shortUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  if (isLoading) {
    return <StatsLoadingState />;
  }

  if (error || !link) {
    return <StatsErrorState code={code || ""} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <WouterLink href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </WouterLink>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold font-mono tracking-tight" data-testid="text-code">
                  {link.code}
                </h1>
                <div className="flex items-center gap-2 text-lg">
                  <a
                    href={link.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-2xl"
                    data-testid="link-target"
                  >
                    {link.targetUrl}
                  </a>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
              <Button onClick={copyToClipboard} data-testid="button-copy">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              icon={<MousePointerClick className="w-6 h-6 text-primary" />}
              label="Total Clicks"
              value={link.totalClicks.toString()}
              testId="text-total-clicks"
            />
            <MetricCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              label="Last Clicked"
              value={
                link.lastClicked
                  ? formatDistanceToNow(new Date(link.lastClicked), { addSuffix: true })
                  : "Never"
              }
              subtitle={link.lastClicked ? format(new Date(link.lastClicked), "PPpp") : undefined}
              testId="text-last-clicked"
            />
            <MetricCard
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              label="Created"
              value={format(new Date(link.createdAt), "MMM d, yyyy")}
              subtitle={format(new Date(link.createdAt), "h:mm a")}
              testId="text-created"
            />
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Link Details</h2>
              <div className="space-y-3">
                <DetailRow label="Short URL" value={`${window.location.origin}/${link.code}`} mono />
                <DetailRow label="Target URL" value={link.targetUrl} />
                <DetailRow label="Link ID" value={link.id} mono />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  testId?: string;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-bold tabular-nums" data-testid={testId}>
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground min-w-24">{label}</span>
      <span className={`text-sm flex-1 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function StatsLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-9 w-48" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-32" />
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsErrorState({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <WouterLink href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </WouterLink>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-bold mt-4">Link Not Found</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              The short link "{code}" doesn't exist or has been deleted.
            </p>
            <WouterLink href="/">
              <Button className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </WouterLink>
          </div>
        </Card>
      </main>
    </div>
  );
}
