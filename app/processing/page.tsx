import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";

const statCards = [
    { label: "Pending", icon: Clock, iconColor: "text-warning", bg: "bg-warning/10", value: 0 },
    { label: "In Progress", icon: Activity, iconColor: "text-primary", bg: "bg-primary/10", value: 0 },
    { label: "Completed", icon: CheckCircle, iconColor: "text-success", bg: "bg-success/10", value: 0 },
    { label: "Failed", icon: XCircle, iconColor: "text-destructive", bg: "bg-destructive/10", value: 0 },
];

export default function ProcessingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Processing</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Monitor background tasks — transcription, face detection, and recognition.
                </p>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, icon: Icon, iconColor, bg, value }) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-black tabular-nums leading-none">{value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Task Queue
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                            <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold">No active tasks</p>
                        <p className="text-xs text-muted-foreground">
                            Upload media to trigger processing pipelines
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
