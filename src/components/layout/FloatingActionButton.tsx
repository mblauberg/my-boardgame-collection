export function FloatingActionButton({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-xl shadow-primary/30 transform hover:scale-110 active:scale-95 transition-all duration-200 z-50">
      <span className="material-symbols-outlined text-3xl">add</span>
    </button>
  );
}
