import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Server, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Configure your Persona application.
                </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* API Configuration */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Server className="h-4 w-4 text-primary" />
                            API Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Backend URL</label>
                            <Input
                                defaultValue="http://localhost:8000"
                                className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                The base URL of your Persona Server instance.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Use the theme toggle in the navbar to switch between Light, Dark, and System modes.
                        </p>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Notification preferences will be available in a future update.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
