

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning, ShieldCheck, Upload, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

const reports = [
    { id: "REP001", date: "2024-07-20", description: "Mixed waste found in dry waste bin.", status: "Pending evidence" },
    { id: "REP002", date: "2024-07-18", description: "Wet waste not segregated properly.", status: "Resolved" },
    { id: "REP003", date: "2024-07-15", description: "Hazardous materials mixed with general waste.", status: "Pending evidence" },
];

const hasPendingReports = reports.some(r => r.status !== 'Resolved');

export function BulkProducerDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const handleUpload = (reportId: string) => {
        setIsUploading(reportId);
        toast({ title: "Simulating Upload...", description: "In a real app, this would open a file dialog." });
        setTimeout(() => {
             toast({ title: "Evidence Submitted", description: `Your evidence for report ${reportId} has been submitted for review.` });
             setIsUploading(null);
        }, 2000);
    }

    if (!user) return null;

    const hasFines = user.fines && user.fines > 0;
    const isCompliant = !hasFines && !hasPendingReports;

    return (
        <div className="grid gap-8">
            <Card className="bg-gradient-to-br from-primary to-green-700 text-primary-foreground">
                <CardHeader>
                    <CardTitle>{t('hello_user', { name: user.institutionName || user.name })}</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        {t('bulk_producer_welcome')}
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Card className="w-full bg-black/20 border-white/20">
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                                <ShieldCheck className="h-5 w-5 text-yellow-300" />
                            </CardHeader>
                            <CardContent>
                               {isCompliant ? (
                                    <>
                                        <div className="text-2xl font-bold text-green-300">Certified Compliant</div>
                                        <p className="text-xs text-primary-foreground/80">No pending reports or outstanding fines.</p>
                                    </>
                               ) : (
                                    <>
                                        <div className="text-2xl font-bold text-yellow-300">Action Required</div>
                                        <p className="text-xs text-primary-foreground/80">Resolve pending reports and fines.</p>
                                    </>
                               )}
                            </CardContent>
                        </Card>
                         <Card className="w-full bg-black/20 border-white/20">
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">{t('outstanding_fines')}</CardTitle>
                                <Banknote className="h-5 w-5 text-yellow-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rs. {user.fines?.toLocaleString() || 0}</div>
                                {hasFines && <p className="text-xs text-red-300">Please clear your dues.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('compliance_reports')}</CardTitle>
                    <CardDescription>
                        {t('compliance_reports_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 border rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <FileWarning className="h-5 w-5 text-destructive" />
                                    <p className="font-semibold">{report.description}</p>
                                    <Badge variant={report.status === 'Resolved' ? 'default' : 'destructive'}>
                                        {report.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Reported on: {report.date}</p>
                            </div>
                            {report.status !== 'Resolved' && (
                                <Button onClick={() => handleUpload(report.id)} disabled={isUploading === report.id}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {isUploading === report.id ? "Uploading..." : "Upload Evidence"}
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-primary"/>
                        {t('best_practices')}
                    </CardTitle>
                    <CardDescription>
                        {t('best_practices_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                       <li>{t('best_practice_1')}</li>
                       <li>{t('best_practice_2')}</li>
                       <li>{t('best_practice_3')}</li>
                       <li>{t('best_practice_4')}</li>
                   </ul>
                </CardContent>
            </Card>
        </div>
    )
}
