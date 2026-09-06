'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
  AIMarketingOverview,
  AIMarketingInsight,
  WeeklyMarketingPlan,
  AIContentIdea,
  RepurposeCandidate,
  BrandKnowledge,
  PostAnalytics,
  SocialPlatform,
} from '@/lib/types/database';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingOverviewCard } from '@/components/marketing/MarketingOverviewCard';
import { AIInsightsSection } from '@/components/marketing/AIInsightsSection';
import { WeeklyPlanSection } from '@/components/marketing/WeeklyPlanSection';
import { ContentIdeasSection } from '@/components/marketing/ContentIdeasSection';
import { RepurposingEngineCard } from '@/components/marketing/RepurposingEngineCard';
import { PlatformStrategyGrid } from '@/components/marketing/PlatformStrategyGrid';
import { TopUnderperformingSection } from '@/components/marketing/TopUnderperformingSection';
import { MarketingChatDrawer } from '@/components/marketing/MarketingChatDrawer';
import { BrandKnowledgeModal } from '@/components/marketing/BrandKnowledgeModal';
import { WhyAmISeeingThisModal } from '@/components/marketing/WhyAmISeeingThisModal';
import { MarketingHealthScoreModal } from '@/components/marketing/MarketingHealthScoreModal';
import { MarketingReportModal } from '@/components/marketing/MarketingReportModal';
import { EmptyMarketingState } from '@/components/marketing/EmptyMarketingState';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function AIMarketingPage() {
  const { user } = useAuth();

  // Core data states
  const [overview, setOverview] = useState<AIMarketingOverview | null>(null);
  const [insights, setInsights] = useState<AIMarketingInsight[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMarketingPlan | null>(null);
  const [contentIdeas, setContentIdeas] = useState<AIContentIdea[]>([]);
  const [repurposeCandidates, setRepurposeCandidates] = useState<RepurposeCandidate[]>([]);
  const [brandKnowledge, setBrandKnowledge] = useState<BrandKnowledge | null>(null);
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatform[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);

  // Modals state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [whyInsight, setWhyInsight] = useState<AIMarketingInsight | null>(null);
  const [whyMetricKey, setWhyMetricKey] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [ovRes, insRes, planRes, ideasRes, repRes, bkRes, accRes, postsRes] = await Promise.all([
        fetch('/api/marketing/overview'),
        fetch('/api/marketing/insights'),
        fetch('/api/marketing/weekly-plan', { method: 'POST' }),
        fetch('/api/marketing/content-ideas'),
        fetch('/api/marketing/repurpose'),
        fetch('/api/marketing/brand-knowledge'),
        fetch('/api/social-accounts'),
        fetch('/api/analytics/posts?limit=10'),
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData.overview || null);
      }
      if (insRes.ok) {
        const insData = await insRes.json();
        setInsights(insData.insights || []);
      }
      if (planRes.ok) {
        const planData = await planRes.json();
        setWeeklyPlan(planData.plan || null);
      }
      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setContentIdeas(ideasData.ideas || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setRepurposeCandidates(repData.candidates || []);
      }
      if (bkRes.ok) {
        const bkData = await bkRes.json();
        setBrandKnowledge(bkData.brandKnowledge || null);
      }
      if (accRes.ok) {
        const accData = await accRes.json();
        const connected = (accData.accounts || [])
          .filter((a: { status: string }) => a.status === 'connected')
          .map((a: { platform: SocialPlatform }) => a.platform);
        setConnectedPlatforms(connected);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error('Failed to load marketing manager data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/marketing/refresh', { method: 'POST' });
      await loadAllData();
    } catch (err) {
      console.error('Error refreshing marketing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateWeeklyPlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/marketing/weekly-plan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWeeklyPlan(data.plan || null);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGenerateIdeas = async () => {
    setGeneratingIdeas(true);
    try {
      const res = await fetch('/api/marketing/content-ideas', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setContentIdeas(data.ideas || []);
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-light/20 border border-emerald-light/40 flex items-center justify-center text-emerald-deep dark:text-emerald-light animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-emerald-deep dark:text-gray-200 font-urdu">
          مارکیٹنگ ڈیٹا کا تجزیہ کیا جا رہا ہے... (Analyzing your marketing data)
        </p>
      </div>
    );
  }

  const isEmpty = posts.length === 0 && connectedPlatforms.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-fadeIn">
      {/* 1. Marketing Header */}
      <MarketingHeader
        primaryGoal={brandKnowledge?.primary_goal || 'increase_engagement'}
        confidence={overview?.confidence || 'medium'}
        lastUpdated={overview?.dataFreshness?.lastDataUpdated || null}
        sampleSize={overview?.dataFreshness?.sampleSize || posts.length}
        onRefresh={handleRefresh}
        onOpenBrandKnowledge={() => setIsBrandModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        refreshing={refreshing}
      />

      {/* Empty State vs Full State */}
      {isEmpty ? (
        <EmptyMarketingState />
      ) : (
        <>
          {/* 2. Marketing Overview & Health Meter */}
          {overview && (
            <MarketingOverviewCard
              overview={overview}
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
              onOpenWhyModal={(key) => {
                setWhyMetricKey(key);
                setWhyInsight(null);
              }}
            />
          )}

          {/* 3. AI Insights & Recommended Actions */}
          <AIInsightsSection
            insights={insights}
            onOpenWhyModal={(ins) => {
              setWhyInsight(ins);
              setWhyMetricKey(null);
            }}
          />

          {/* 4. Weekly 7-Day Strategy Schedule */}
          <WeeklyPlanSection
            plan={weeklyPlan}
            onGeneratePlan={handleGenerateWeeklyPlan}
            generating={generatingPlan}
          />

          {/* 5. High-Resonance Content Ideas */}
          <ContentIdeasSection
            ideas={contentIdeas}
            onGenerateIdeas={handleGenerateIdeas}
            generating={generatingIdeas}
          />

          {/* 6. Repurposing Engine */}
          <RepurposingEngineCard candidates={repurposeCandidates} />

          {/* 7. Platform Specific Playbooks */}
          <PlatformStrategyGrid connectedPlatforms={connectedPlatforms} />

          {/* 8. Top vs Underperforming Content Intelligence */}
          <TopUnderperformingSection posts={posts} />
        </>
      )}

      {/* Floating Ask Marketing Manager Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-emerald-deep hover:bg-emerald-primary text-white shadow-elevated transition-all flex items-center gap-2.5 font-bold text-xs border border-gold-border/60 hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-4 h-4 text-gold-light" />
        <span>Ask Marketing Manager</span>
      </button>

      {/* Modals & Drawers */}
      <MarketingChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <BrandKnowledgeModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brandKnowledge={brandKnowledge}
        onSaved={(updated) => setBrandKnowledge(updated)}
      />

      <MarketingReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {overview && (
        <MarketingHealthScoreModal
          isOpen={isHealthModalOpen}
          onClose={() => setIsHealthModalOpen(false)}
          healthScore={overview.healthScore}
        />
      )}

      <WhyAmISeeingThisModal
        insight={whyInsight}
        metricKey={whyMetricKey}
        onClose={() => {
          setWhyInsight(null);
          setWhyMetricKey(null);
        }}
      />
    </div>
  );
}
