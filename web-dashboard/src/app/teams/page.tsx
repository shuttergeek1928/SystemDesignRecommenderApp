import { TeamsView } from "@/components/views/TeamsView";

export default function TeamsPage() {
    return (
        <div className="min-h-[calc(100vh-16rem)] py-16 px-4 md:px-8">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            Teams & Talent
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            Manage your high-performing teams, monitor developer productivity,
                            and align skills with project requirements.
                        </p>
                    </div>
                </div>

                <TeamsView />
            </div>
        </div>
    );
}
