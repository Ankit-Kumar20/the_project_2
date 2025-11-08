import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '@/lib/theme-context';
import { Lightbulb, X, Warning, Sparkle, MapPin, CheckCircle, WarningCircle, Star, ArrowsClockwise } from '@phosphor-icons/react';

interface Insight {
  title: string;
  description: string;
  photo?: string;
  source?: string;
  location?: string;
  severity?: 'info' | 'warning' | 'critical';
}

interface InsightsData {
  mustSee: Insight[];
  warnings: Insight[];
  proTips: Insight[];
  hiddenGems: Insight[];
}

interface TripInsightsWidgetProps {
  tripDetails: any;
  nodes: any[];
  tripId?: string;
}

export interface TripInsightsWidgetRef {
  open: () => void;
  isLoading: () => boolean;
}

const TripInsightsWidget = forwardRef<TripInsightsWidgetRef, TripInsightsWidgetProps>(({ tripDetails, nodes, tripId }, ref) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);

  const isDark = theme === 'dark';

  // Expose open method and loading state via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      if (!isOpen) {
        fetchInsights();
      }
    },
    isLoading: () => isLoading
  }));

  const fetchInsights = async (forceRefresh = false) => {
    if (insights && !forceRefresh) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Transform nodes to match API expectation
      const transformedNodes = nodes.map(node => ({
        label: node.data.label,
        day: node.data.day,
        coordinates: node.data.coordinates,
      }));

      const response = await fetch('/api/trip-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tripDetails, 
          nodes: transformedNodes,
          tripId,
          forceRefresh,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);
        setIsCached(data.cached || false);
        setCachedAt(data.cachedAt ? new Date(data.cachedAt) : null);
        setIsOpen(true);
      } else {
        setError(data.error || 'Failed to fetch insights');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchInsights(true);
  };

  return (
    <>
      {/* Insights Panel */}
      {isOpen && (
        <div
          className="fixed bottom-[20px] left-[80px] w-[340px] max-h-[calc(100vh-100px)] rounded-[24px] overflow-hidden z-[999] flex flex-col"
          style={{
            background: isDark ? '#1a1a1a' : '#f3f4f6',
            border: isDark ? 'none' : 'none',
            boxShadow: isDark 
              ? '0 4px 6px rgba(0,0,0,0.5)' 
              : '0 4px 6px rgba(0,0,0,0.1)',
            fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-[20px] py-[14px] border-b"
            style={{ borderColor: isDark ? '#2a2a2a' : '#e5e5e5' }}
          >
            <div className="flex items-center gap-[8px]">
              <Lightbulb size={18} weight="fill" style={{ color: isDark ? '#fff' : '#000' }} />
              <span className="font-medium text-[14px]" style={{ color: isDark ? '#fff' : '#000' }}>
                Trip Insights
              </span>
              {isCached && cachedAt && (
                <span 
                  className="text-[10px] font-normal"
                  style={{ color: isDark ? '#666' : '#999' }}
                >
                  · Cached
                </span>
              )}
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer transition-all border-none"
                style={{
                  background: 'transparent',
                  color: isDark ? '#666' : '#999',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.color = isDark ? '#fff' : '#000';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDark ? '#666' : '#999';
                }}
                title="Refresh insights"
              >
                <ArrowsClockwise 
                  size={14} 
                  weight="bold"
                  style={{
                    animation: isLoading ? 'spin 1s linear infinite' : 'none',
                  }}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer transition-all border-none"
                style={{
                  background: isDark ? '#2a2a2a' : '#e5e5e5',
                  color: isDark ? '#fff' : '#000',
                }}
                onMouseEnter={(e) => {
                  if (isDark) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#000';
                  } else {
                    e.currentTarget.style.background = '#000';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDark) {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.color = '#fff';
                  } else {
                    e.currentTarget.style.background = '#e5e5e5';
                    e.currentTarget.style.color = '#000';
                  }
                }}
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-[20px] py-[16px] scrollbar-hide">
            {error ? (
              <div className="text-center py-[40px]">
                <Warning size={32} weight="regular" style={{ color: '#ff6b6b', margin: '0 auto' }} />
                <p className="text-[13px] mt-[12px]" style={{ color: isDark ? '#666' : '#999' }}>
                  {error}
                </p>
              </div>
            ) : insights ? (
              <div className="space-y-[24px]">
                {/* Must See Section */}
                {insights.mustSee && insights.mustSee.length > 0 && (
                  <Section
                    title="Must Experience"
                    items={insights.mustSee}
                    isDark={isDark}
                    showPhotos
                    icon="sparkle"
                  />
                )}

                {/* Warnings Section */}
                {insights.warnings && insights.warnings.length > 0 && (
                  <Section
                    title="Important Warnings"
                    items={insights.warnings}
                    isDark={isDark}
                    isWarning
                    icon="warning"
                  />
                )}

                {/* Pro Tips Section */}
                {insights.proTips && insights.proTips.length > 0 && (
                  <Section
                    title="Pro Tips"
                    items={insights.proTips}
                    isDark={isDark}
                    icon="lightbulb"
                  />
                )}

                {/* Hidden Gems Section */}
                {insights.hiddenGems && insights.hiddenGems.length > 0 && (
                  <Section
                    title="Hidden Gems"
                    items={insights.hiddenGems}
                    isDark={isDark}
                    showPhotos
                    icon="star"
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
});

TripInsightsWidget.displayName = 'TripInsightsWidget';

export default TripInsightsWidget;

// Section Component
function Section({
  title,
  items,
  isDark,
  isWarning = false,
  showPhotos = false,
  icon,
}: {
  title: string;
  items: Insight[];
  isDark: boolean;
  isWarning?: boolean;
  showPhotos?: boolean;
  icon?: 'sparkle' | 'warning' | 'lightbulb' | 'star';
}) {
  const getIcon = () => {
    const iconColor = isDark ? '#666' : '#999';
    switch (icon) {
      case 'sparkle':
        return <Sparkle size={12} weight="fill" style={{ color: iconColor }} />;
      case 'warning':
        return <WarningCircle size={12} weight="fill" style={{ color: '#ff6b6b' }} />;
      case 'lightbulb':
        return <Lightbulb size={12} weight="fill" style={{ color: iconColor }} />;
      case 'star':
        return <Star size={12} weight="fill" style={{ color: iconColor }} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h3
        className="text-[11px] uppercase tracking-wider font-medium mb-[12px] pb-[6px] border-b flex items-center gap-[6px]"
        style={{
          color: isDark ? '#666' : '#999',
          borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
        }}
      >
        {icon && getIcon()}
        {title}
      </h3>
      <div className="space-y-[10px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            draggable={showPhotos} // Only make draggable for must experience and hidden gems
            onDragStart={(e) => {
              if (showPhotos) {
                e.dataTransfer.setData('application/reactflow', JSON.stringify({
                  type: 'insight',
                  data: {
                    label: item.title,
                    info: item.description,
                    location: item.location,
                  }
                }));
                e.dataTransfer.effectAllowed = 'move';
              }
            }}
            className="rounded-[16px] p-[14px] transition-all"
            style={{
              background: isWarning
                ? isDark
                  ? '#2a1a1a'
                  : '#fff5f5'
                : isDark
                ? '#2a2a2a'
                : '#ffffff',
              border: isWarning 
                ? `1px solid ${isDark ? '#ff6b6b33' : '#ff6b6b44'}` 
                : 'none',
              cursor: showPhotos ? 'grab' : 'default',
            }}
            onMouseDown={(e) => {
              if (showPhotos && e.currentTarget.style) {
                e.currentTarget.style.cursor = 'grabbing';
              }
            }}
            onMouseUp={(e) => {
              if (showPhotos && e.currentTarget.style) {
                e.currentTarget.style.cursor = 'grab';
              }
            }}
          >
            {/* Photo */}
            {showPhotos && item.photo && (
              <div className="mb-[10px] rounded-[12px] overflow-hidden">
                <img
                  src={item.photo}
                  alt={item.title}
                  className="w-full h-[140px] object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex items-start gap-[8px]">
              {isWarning ? (
                <WarningCircle 
                  size={16} 
                  weight="fill" 
                  style={{ color: '#ff6b6b', marginTop: '2px', flexShrink: 0 }} 
                />
              ) : (
                <CheckCircle 
                  size={16} 
                  weight="fill" 
                  style={{ color: isDark ? '#4ade80' : '#22c55e', marginTop: '2px', flexShrink: 0 }} 
                />
              )}
              <div className="flex-1">
                <div
                  className="text-[13px] font-medium mb-[4px]"
                  style={{ color: isDark ? '#fff' : '#000' }}
                >
                  {item.title}
                </div>
                <div
                  className="text-[12px] leading-[1.6] font-normal"
                  style={{ color: isDark ? '#999' : '#666' }}
                >
                  {item.description}
                </div>
                {/* Location badge */}
                {item.location && (
                  <div className="flex items-center gap-[4px] mt-[8px]">
                    <MapPin size={11} weight="fill" style={{ color: isDark ? '#666' : '#999' }} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: isDark ? '#666' : '#999' }}
                    >
                      {item.location}
                    </span>
                  </div>
                )}
                {/* Source badge */}
                {item.source && (
                  <div
                    className="inline-block text-[9px] px-[8px] py-[3px] rounded-[6px] mt-[8px] font-medium"
                    style={{
                      background: isDark ? '#2a2a2a' : '#e5e5e5',
                      color: isDark ? '#666' : '#999',
                    }}
                  >
                    {item.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
