export default function SpeakAssistant({ onToggle, playing }) {
  return (
    <button
      className={`speak-fab${playing ? ' playing' : ''}`}
      onClick={onToggle}
      title={playing ? 'Bola band karo (stop)' : 'Screen suno (voice)'}
      aria-label={playing ? 'Stop voice' : 'Listen to screen'}
    >
      {playing ? '⏹' : '🔊'}
    </button>
  );
}