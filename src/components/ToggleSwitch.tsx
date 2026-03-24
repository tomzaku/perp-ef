interface ToggleSwitchProps {
  checked: boolean;
  color?: string;
}

export function ToggleSwitch({ checked, color = 'bg-accent-cyan' }: ToggleSwitchProps) {
  return (
    <span
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
        checked ? color : 'bg-bg-tertiary'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </span>
  );
}
