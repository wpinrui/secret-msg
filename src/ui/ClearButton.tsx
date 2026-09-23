export function ClearButton({
  label,
  disabled,
  onClear,
}: {
  label: string;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClear}
    >
      ✕
    </button>
  );
}
