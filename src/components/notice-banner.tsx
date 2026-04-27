import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getPinnedNotice } from "@/lib/db/queries";

export async function NoticeBanner() {
  const notice = await getPinnedNotice();
  if (!notice) return null;

  return (
    <Link
      href={`/notices/${notice.id}`}
      className="bg-primary text-primary-foreground hover:bg-primary/90 block transition"
    >
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-2 px-6 text-xs sm:text-sm">
        <Megaphone className="size-4 shrink-0" />
        <span className="bg-primary-foreground/15 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          공지
        </span>
        <span className="line-clamp-1 flex-1">{notice.title}</span>
        <span className="shrink-0 opacity-80">자세히 →</span>
      </div>
    </Link>
  );
}
