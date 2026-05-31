export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-offwhite rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-secondary" />
      </div>
      <p className="font-display text-charcoal text-xl mb-1">{title}</p>
      <p className="text-secondary text-sm mb-5">{description}</p>
      {action}
    </div>
  )
}
