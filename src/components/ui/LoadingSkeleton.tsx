interface LoadingSkeletonProps { height?: number }
export function LoadingSkeleton({ height = 300 }: LoadingSkeletonProps) {
  return (
    <div style={{ height, width: '100%', background: 'repeating-linear-gradient( -45deg, #f0f0f0, #f0f0f0 10px, #fafafa 10px, #fafafa 20px )', borderRadius: 4, animation: 'pulse 1.2s ease-in-out infinite' }} />
  );
}