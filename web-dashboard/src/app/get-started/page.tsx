import { RequirementForm } from "@/components/views/RequirementForm";

export default function GetStartedPage() {
    return (
        <div className="min-h-[calc(100vh-16rem)] py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Tell us about your project
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Our recommendation engine takes 12+ variables into account to find
                        the perfect architectural match for your team and business goals.
                    </p>
                </div>

                <RequirementForm />
            </div>
        </div>
    );
}
