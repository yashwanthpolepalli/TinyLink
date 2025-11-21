import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link as WouterLink } from "wouter";
import { Link as LinkIcon, Copy, Trash2, ExternalLink, Search, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { insertLinkSchema } from "@shared/schema";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import type { Link } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: links, isLoading, error } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  const filteredLinks = links?.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = async (code: string) => {
    const shortUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

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
            <WouterLink href="/healthz">
              <Badge variant="secondary" className="cursor-pointer" data-testid="link-health">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                System Online
              </Badge>
            </WouterLink>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          <AddLinkForm />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Links</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and track your shortened URLs
                </p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>

            {error ? (
              <EmptyState
                icon={<AlertCircle className="w-12 h-12 text-destructive" />}
                title="Failed to load links"
                description="There was an error loading your links. Please try again."
              />
            ) : isLoading ? (
              <LoadingTable />
            ) : filteredLinks && filteredLinks.length > 0 ? (
              <LinksTable links={filteredLinks} onCopy={copyToClipboard} />
            ) : searchQuery ? (
              <EmptyState
                icon={<Search className="w-12 h-12 text-muted-foreground" />}
                title="No results found"
                description={`No links match "${searchQuery}"`}
              />
            ) : (
              <EmptyState
                icon={<LinkIcon className="w-12 h-12 text-muted-foreground" />}
                title="No links yet"
                description="Create your first short link to get started"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const formSchema = insertLinkSchema.extend({
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, "Code must be 6-8 alphanumeric characters").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

function AddLinkForm() {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetUrl: "",
      code: "",
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; code?: string }) => {
      return await apiRequest("POST", "/api/links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Success!",
        description: "Short link created successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      const message = error.message || "Failed to create link";
      if (message.includes("409") || message.includes("already exists")) {
        form.setError("code", { message: "This code is already taken" });
      }
      toast({
        title: "Error",
        description: message.includes("409") ? "This code is already taken" : "Failed to create link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createLinkMutation.mutate({
      targetUrl: data.targetUrl,
      code: data.code || undefined,
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Create Short Link</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Shorten a long URL with an optional custom code
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="targetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very-long-url"
                      data-testid="input-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Short Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mylink"
                      data-testid="input-code"
                      maxLength={8}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    6-8 alphanumeric characters. Leave blank for auto-generated code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full sm:w-auto"
              data-testid="button-create"
              disabled={createLinkMutation.isPending}
            >
              {createLinkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Create Short Link
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}

function LinksTable({ links, onCopy }: { links: Link[]; onCopy: (code: string) => void }) {
  const { toast } = useToast();

  const deleteLinkMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("DELETE", `/api/links/${code}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Deleted",
        description: "Link has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (code: string) => {
    deleteLinkMutation.mutate(code);
  };

  return (
    <>
      {/* Desktop table view */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Short Code</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead className="text-center w-28">Clicks</TableHead>
                <TableHead className="w-40">Last Clicked</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} className="hover-elevate">
                  <TableCell>
                    <WouterLink href={`/code/${link.code}`}>
                      <code className="font-mono font-medium text-primary hover:underline cursor-pointer" data-testid={`link-code-${link.code}`}>
                        {link.code}
                      </code>
                    </WouterLink>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-md">
                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-primary transition-colors"
                        data-testid={`link-target-${link.code}`}
                      >
                        {link.targetUrl}
                      </a>
                      <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="tabular-nums font-medium" data-testid={`text-clicks-${link.code}`}>
                      {link.totalClicks}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground" data-testid={`text-lastclicked-${link.code}`}>
                      {link.lastClicked
                        ? formatDistanceToNow(new Date(link.lastClicked), { addSuffix: true })
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(link.code)}
                        data-testid={`button-copy-${link.code}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(link.code)}
                        disabled={deleteLinkMutation.isPending}
                        data-testid={`button-delete-${link.code}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {links.map((link) => (
          <Card key={link.id} className="p-4" data-testid={`card-link-${link.code}`}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <WouterLink href={`/code/${link.code}`}>
                  <code className="font-mono font-semibold text-lg text-primary hover:underline cursor-pointer" data-testid={`link-code-${link.code}`}>
                    {link.code}
                  </code>
                </WouterLink>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(link.code)}
                    data-testid={`button-copy-${link.code}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(link.code)}
                    disabled={deleteLinkMutation.isPending}
                    data-testid={`button-delete-${link.code}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Target URL</span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={link.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-primary transition-colors"
                      data-testid={`link-target-${link.code}`}
                    >
                      {link.targetUrl}
                    </a>
                    <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground font-medium">Clicks</span>
                    <div className="font-semibold tabular-nums" data-testid={`text-clicks-${link.code}`}>
                      {link.totalClicks}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground font-medium">Last Clicked</span>
                    <div className="text-muted-foreground" data-testid={`text-lastclicked-${link.code}`}>
                      {link.lastClicked
                        ? formatDistanceToNow(new Date(link.lastClicked), { addSuffix: true })
                        : "Never"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function LoadingTable() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {icon}
        <h3 className="text-lg font-semibold mt-4">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      </div>
    </Card>
  );
}
