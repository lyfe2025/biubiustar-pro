import React from 'react'

interface HighlightTextProps {
  text: string
  searchQuery: string
  className?: string
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, searchQuery, className = '' }) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
            >
              {part}
            </mark>
          )
        }
        return part
      })}
    </span>
  )
}

export default HighlightText