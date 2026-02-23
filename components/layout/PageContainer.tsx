"use client";

interface PageContainerProps {
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageContainer({
  title,
  description,
  headerActions,
  children,
}: PageContainerProps) {
  return (
    <div className="flex flex-col h-[calc(90vh-1rem)] md:h-[calc(90vh-1.5rem)]">
      {/* Fixed Header */}
      <div className="shrink-0 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-6">
        {children}
      </div>
    </div>
  );
}
