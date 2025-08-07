import React from 'react'

interface PostSkeletonProps {
  count?: number
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 rounded-full px-8 py-2"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="bg-gray-200 h-4 w-20 rounded"></div>
                <div className="bg-gray-200 h-4 w-16 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 h-4 w-12 rounded"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mb-4">
            <div className="bg-gray-200 h-6 w-3/4 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 w-full rounded"></div>
              <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
              <div className="bg-gray-200 h-4 w-4/5 rounded"></div>
            </div>
            
            {/* Image Skeleton */}
            {index % 2 === 0 && (
              <div className="mt-4">
                {index % 4 === 0 ? (
                  <div className="bg-gray-200 w-full max-w-md h-64 rounded-lg"></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((_, imgIndex) => (
                      <div key={imgIndex} className="bg-gray-200 w-full h-32 rounded-lg"></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 w-5 h-5 rounded"></div>
                <div className="bg-gray-200 h-4 w-8 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 w-5 h-5 rounded"></div>
                <div className="bg-gray-200 h-4 w-8 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 w-5 h-5 rounded"></div>
                <div className="bg-gray-200 h-4 w-12 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 h-6 w-12 rounded-full"></div>
              <div className="bg-gray-200 h-6 w-16 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default PostSkeleton