import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, MessageCircle, ExternalLink } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Help Center</h1>
                <p className="text-sm text-muted-foreground">
                    Learn how to use Persona — AI Face Identifier.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Getting Started
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Learn the basics — uploading media, enrolling persons, and searching for faces.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            FAQ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Answers to frequently asked questions about face recognition and media processing.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Need help? Contact our team for support and troubleshooting.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Workflow Guide */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="text-center space-y-2">
                            <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">1</span>
                            </div>
                            <p className="text-sm font-medium">Upload</p>
                            <p className="text-xs text-muted-foreground">
                                Upload video, audio, or images
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">2</span>
                            </div>
                            <p className="text-sm font-medium">Process</p>
                            <p className="text-xs text-muted-foreground">
                                AI detects faces & transcribes audio
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">3</span>
                            </div>
                            <p className="text-sm font-medium">Enroll</p>
                            <p className="text-xs text-muted-foreground">
                                Identify unknown faces by enrolling them
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">4</span>
                            </div>
                            <p className="text-sm font-medium">Search</p>
                            <p className="text-xs text-muted-foreground">
                                Find people across all your media
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
