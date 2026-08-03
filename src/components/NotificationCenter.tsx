"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { UserPreferences } from "@/lib/user-preferences";

export function NotificationCenter({ preferences }: { preferences: UserPreferences }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const items = [
    ...(preferences.notifySpecialtyPrompts ? [{ id: "specialty", title: preferences.language === "fr" ? "Nouveaux prompts métier" : "New specialty prompts", body: preferences.language === "fr" ? "Découvrez les dernières ressources ajoutées au catalogue." : "Discover the latest catalog additions.", href: "/catalogue" }] : []),
    ...(preferences.notifySavedPromptUpdates ? [{ id: "saved", title: preferences.language === "fr" ? "Bibliothèque personnelle" : "Personal library", body: preferences.language === "fr" ? "Vérifiez les prompts récemment mis à jour." : "Review recently updated saved prompts.", href: "/dossiers" }] : []),
    ...(preferences.notifyBlogArticles ? [{ id: "blog", title: preferences.language === "fr" ? "Nouvelle ressource" : "New resource", body: preferences.language === "fr" ? "Un nouvel article est disponible dans le blog." : "A new article is available in the blog.", href: "/blog" }] : []),
  ];
  useEffect(() => { try { setRead(JSON.parse(localStorage.getItem("insepti_notifications_read") ?? "[]")); } catch {} }, []);
  const unread = items.filter((item) => !read.includes(item.id)).length;
  function saveRead(ids: string[]) { setRead(ids); localStorage.setItem("insepti_notifications_read", JSON.stringify(ids)); }
  return <div className="notification-center"><button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" aria-expanded={open}><svg viewBox="0 0 24 24" aria-hidden><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{unread > 0 && <span>{unread}</span>}</button>{open && <div className="notification-menu"><header><strong>Notifications</strong><button onClick={() => saveRead(items.map((item) => item.id))}>Tout lire</button></header>{items.length ? items.map((item) => <Link key={item.id} href={item.href} onClick={() => { saveRead(Array.from(new Set([...read, item.id]))); setOpen(false); }} className={read.includes(item.id) ? "is-read" : ""}><i/><div><strong>{item.title}</strong><p>{item.body}</p></div></Link>) : <p className="notification-empty">Aucune notification activée.</p>}</div>}</div>;
}
