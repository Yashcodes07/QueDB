export default function ResultsTable({ columns, rows }) {
  if (!columns?.length) return null
  return (
    <div className="overflow-auto animate-fade-in">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-bg-secondary border-b border-border">
          <tr>
            {columns.map(col => (
              <th key={col} className="text-left px-4 py-2 text-text-muted font-medium whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? '' : 'bg-bg-secondary/40'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-text-secondary whitespace-nowrap border-b border-border/30 font-mono">
                  {cell === null || cell === undefined
                    ? <span className="text-text-muted italic">null</span>
                    : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
