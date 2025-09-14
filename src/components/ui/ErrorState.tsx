interface ErrorStateProps { error: any }
export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div style={{ color: '#c62828', fontSize: 12, padding: 8 }}>
      {(error && (error.message || error.toString())) || 'Error'}
    </div>
  );
}
