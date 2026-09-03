"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2, Save, Upload } from "lucide-react";
import { articleInputSchema, type ArticleInput } from "@/lib/validations";
import type { Article, Author, Category, League, Player, Sport, Tag, Team } from "@/types";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

interface ArticleFormProps {
  article?: Article;
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  teams: Team[];
  leagues: League[];
  players: Player[];
}

const inputClass =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-semibold";

export function ArticleForm({ article, authors, categories, tags, teams, leagues, players }: ArticleFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = Boolean(article);

  const form = useForm<ArticleInput>({
    resolver: zodResolver(articleInputSchema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      excerpt: article?.excerpt ?? "",
      content: article?.content ?? "",
      featuredImage: article?.featuredImage ?? "",
      status: article?.status ?? "DRAFT",
      authorId: article?.author.id ?? "",
      categoryId: article?.category.id ?? "",
      sport: article?.sport ?? "FOOTBALL",
      teamId: article?.team?.id ?? "",
      leagueId: article?.league?.id ?? "",
      playerId: article?.player?.id ?? "",
      tagIds: article?.tags.map((t) => t.id) ?? [],
      seoTitle: article?.seoTitle ?? "",
      metaDescription: article?.metaDescription ?? "",
      canonicalUrl: article?.canonicalUrl ?? "",
    },
  });

  const selectedSport = form.watch("sport") as Sport;
  const filteredTeams = useMemo(() => teams.filter((t) => t.sport === selectedSport), [teams, selectedSport]);
  const filteredLeagues = useMemo(() => leagues.filter((l) => l.sport === selectedSport), [leagues, selectedSport]);
  const selectedTeamId = form.watch("teamId");
  const filteredPlayers = useMemo(
    () => (selectedTeamId ? players.filter((p) => p.teamId === selectedTeamId) : []),
    [players, selectedTeamId],
  );
  const selectedTagIds = form.watch("tagIds") ?? [];

  function generateSlug() {
    const title = form.getValues("title");
    if (title) form.setValue("slug", slugify(title));
  }

  function toggleTag(tagId: string) {
    const current = form.getValues("tagIds") ?? [];
    form.setValue("tagIds", current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]);
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormError(null);
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error ?? "Failed to upload image.");
        return;
      }
      form.setValue("featuredImage", data.url, { shouldValidate: true, shouldDirty: true });
    } catch {
      setFormError("Network error while uploading image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function onSubmit(values: ArticleInput) {
    setFormError(null);
    const payload = { ...values, slug: values.slug || slugify(values.title) };
    try {
      const res = await fetch(isEditing ? `/api/admin/articles/${article!.id}` : "/api/admin/articles", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to save article.");
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {
      setFormError("Network error while saving.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {formError ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="title">
              Title
            </label>
            <input id="title" className={inputClass} {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="slug">
              Slug
            </label>
            <div className="flex gap-2">
              <input id="slug" className={inputClass} {...form.register("slug")} />
              <Button type="button" variant="secondary" onClick={generateSlug} className="shrink-0">
                <Wand2 className="h-4 w-4" aria-hidden />
                Generate
              </Button>
            </div>
            {form.formState.errors.slug ? (
              <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="excerpt">
              Excerpt
            </label>
            <textarea id="excerpt" rows={2} className={textareaClass} {...form.register("excerpt")} />
            {form.formState.errors.excerpt ? (
              <p className="text-xs text-red-500">{form.formState.errors.excerpt.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="content">
              Content
            </label>
            <textarea id="content" rows={16} className={textareaClass} {...form.register("content")} />
            <p className="text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
            {form.formState.errors.content ? (
              <p className="text-xs text-red-500">{form.formState.errors.content.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="featuredImage">
              Featured image URL
            </label>
            <div className="flex gap-2">
              <input id="featuredImage" className={inputClass} placeholder="https://…" {...form.register("featuredImage")} />
              <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold hover:bg-muted">
                <Upload className="h-4 w-4" aria-hidden />
                {uploading ? "Uploading" : "Upload"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={uploadImage} disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF. Maximum 5 MB.</p>
          </div>

          <fieldset className="rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-bold">SEO (optional)</legend>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="seoTitle">
                  SEO title
                </label>
                <input id="seoTitle" className={inputClass} {...form.register("seoTitle")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="metaDescription">
                  Meta description
                </label>
                <textarea id="metaDescription" rows={2} className={textareaClass} {...form.register("metaDescription")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="canonicalUrl">
                  Canonical URL
                </label>
                <input id="canonicalUrl" className={inputClass} {...form.register("canonicalUrl")} />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select id="status" className={inputClass} {...form.register("status")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="sport">
              Sport
            </label>
            <select id="sport" className={inputClass} {...form.register("sport")}>
              <option value="FOOTBALL">Football</option>
              <option value="NBA">NBA</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="categoryId">
              Category
            </label>
            <select id="categoryId" className={inputClass} {...form.register("categoryId")}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.formState.errors.categoryId ? (
              <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="authorId">
              Author
            </label>
            <select id="authorId" className={inputClass} {...form.register("authorId")}>
              <option value="">Select an author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {form.formState.errors.authorId ? (
              <p className="text-xs text-red-500">{form.formState.errors.authorId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="teamId">
              Team (optional)
            </label>
            <select id="teamId" className={inputClass} {...form.register("teamId")}>
              <option value="">None</option>
              {filteredTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="leagueId">
              League (optional)
            </label>
            <select id="leagueId" className={inputClass} {...form.register("leagueId")}>
              <option value="">None</option>
              {filteredLeagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="playerId">
              Player (optional)
            </label>
            <select id="playerId" className={inputClass} {...form.register("playerId")} disabled={filteredPlayers.length === 0}>
              <option value="">None</option>
              {filteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedTeamId && filteredPlayers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No players on file for this team.</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Tags</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4" aria-hidden />
          {form.formState.isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Article"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push("/admin/articles")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
