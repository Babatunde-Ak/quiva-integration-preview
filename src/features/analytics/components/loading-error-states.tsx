'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle } from 'lucide-react'

// Loading States
export function StatsCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-6">
        <div className={`${height} w-full`}>
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export function UserStatsCardSkeleton() {
  return (
    <Card className="bg-muted/50 border-border">
      <CardContent className="p-4 text-center">
        <Skeleton className="h-6 w-12 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </CardContent>
    </Card>
  )
}

// Loading state for full sections
export function AnalyticsStatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function UserGrowthSectionLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <UserStatsCardSkeleton key={i} />
        ))}
      </div>
      
      <ChartSkeleton />
    </div>
  )
}

export function VolumeChartSectionLoading() {
  return <ChartSkeleton height="h-96" />
}

export function BottomChartsSectionLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

// Error States
interface ErrorStateProps {
  error: Error
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description 
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-90">
            {description || error.message || "Failed to load data"}
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit bg-background hover:bg-muted"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function ChartErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="h-80 w-full flex items-center justify-center">
          <ErrorState
            error={error}
            onRetry={onRetry}
            title="Failed to load chart"
            description="There was a problem loading the chart data."
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Empty States
export function EmptyState({ 
  title = "No data available",
  description = "There's no data to display at the moment.",
  action
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="h-80 w-full flex flex-col items-center justify-center text-center p-6">
      <div className="text-muted-foreground mb-4">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}

// Refresh indicator
export function RefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="border-border bg-background/95 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Updating data...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}