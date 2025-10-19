import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateWorkflowDialog() {
  const qc = useQueryClient();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }
      setSubmitting(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${API_BASE}/api/v1/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          status: "active",
          progress: 0,
          category: category || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }

      setOpen(false);
      setName("");
      setCategory("");
      await qc.invalidateQueries({ queryKey: ["workflows"] });
    } catch (e: any) {
      setError(e?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">Create Workflow</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Product Launch" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat">Category (optional)</Label>
            <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Marketing" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onCreate} disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
