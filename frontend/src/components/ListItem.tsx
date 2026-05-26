import React from 'react'

function ListItem({
  task: {
    id,
    title = 'Untitled',
    description = '',
    creationTime = '',
  } = {},
}: {
  task?: any
}) {

  return (
    <li key={id ?? title} className="flex justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4">
        <div className="min-w-0 flex-auto">
          <p className="text-sm/6 font-semibold text-white">{title}</p>
          <p className="mt-1 truncate text-xs/5 text-gray-400">{description}</p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        <p className="mt-1 text-xs/5 text-gray-400">
          Updated <time dateTime={creationTime}>{creationTime}</time>
        </p>
      </div>
    </li>
  )
}

export default ListItem