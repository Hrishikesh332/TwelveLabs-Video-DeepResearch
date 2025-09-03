// Add this function after the extractRealSources function
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

// Updated Citation Sources Display section
{sources.length > 0 && sources.some(source => source.isReal) && (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Sources</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.filter(source => source.isReal).map((source, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src={getFaviconUrl(source.url)}
                alt={`${source.title} favicon`}
                className="w-6 h-6 rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                }}
              />
              <svg 
                className="w-4 h-4 text-gray-600 hidden fallback-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
              >
                {source.title}
              </a>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{source.description}</p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mt-2">
                Real Source
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

// Updated Sidebar Sources section
{sources.length > 0 && sources.some(source => source.isReal) ? (
  sources.filter(source => source.isReal).map((source, index) => (
    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start space-x-2 mb-2">
        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={getFaviconUrl(source.url)}
            alt={`${source.title} favicon`}
            className="w-4 h-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
          <svg 
            className="w-3 h-3 text-gray-600 hidden fallback-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block flex-1"
        >
          {source.title}
        </a>
      </div>
      <p className="text-xs text-gray-600 mt-1 line-clamp-2 ml-8">{source.description}</p>
    </div>
  ))
) : (
  <p className="text-sm text-gray-500 text-center py-4">No sources available yet</p>
)}
