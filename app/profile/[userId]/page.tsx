// app/profile/[userId]/page.tsx
import { getUserProfileById } from "@/lib/actions/profile";
import UserProfileView from "@/components/UserProfileView";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
    // Trong Next.js 15+, params là một Promise, cần await
    const { userId } = await params;
    const profile = await getUserProfileById(userId);

    if (!profile) {
        return notFound();
    }

    return <UserProfileView profile={profile} />;
}