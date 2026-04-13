import { RecommendationDashboard } from "@/components/views/Dashboard";

export default function DashboardPage() {
    return (
        <div className="min-h-[calc(100vh-16rem)] py-12 px-4 md:px-8 bg-secondary/20">
            <div className="container mx-auto">
                <RecommendationDashboard />
            </div>
        </div>
    );
}
