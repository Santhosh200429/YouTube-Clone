export const mockTrendingVideos = [
  {
    id: "mock-video-1",
    title: "How to Build a Next.js Application",
    channelTitle: "Web Dev Tutorials",
    channelId: "mock-channel-1",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Next.js+Tutorial",
    viewCount: "1254789",
    description: "Learn how to build modern web applications with Next.js and React.",
  },
  {
    id: "mock-video-2",
    title: "Responsive Design Principles for 2025",
    channelTitle: "Design Masters",
    channelId: "mock-channel-2",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Design+Principles",
    viewCount: "987654",
    description: "Master the art of responsive design with these essential principles for modern websites.",
  },
  {
    id: "mock-video-3",
    title: "JavaScript Performance Optimization Techniques",
    channelTitle: "JS Wizards",
    channelId: "mock-channel-3",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=JS+Performance",
    viewCount: "567890",
    description: "Learn advanced techniques to optimize your JavaScript code for better performance.",
  },
  {
    id: "mock-video-4",
    title: "Building a YouTube Clone with Next.js",
    channelTitle: "Code Projects",
    channelId: "mock-channel-4",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=YouTube+Clone",
    viewCount: "345678",
    description: "Follow along as we build a complete YouTube clone using Next.js, Tailwind CSS, and the YouTube API.",
  },
  {
    id: "mock-video-5",
    title: "The Future of AI in Web Development",
    channelTitle: "Tech Insights",
    channelId: "mock-channel-5",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=AI+Development",
    viewCount: "789012",
    description: "Explore how artificial intelligence is transforming the landscape of web development.",
  },
  {
    id: "mock-video-6",
    title: "Mastering CSS Grid Layout",
    channelTitle: "CSS Masters",
    channelId: "mock-channel-6",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=CSS+Grid",
    viewCount: "234567",
    description: "A comprehensive guide to mastering CSS Grid Layout for modern web design.",
  },
  {
    id: "mock-video-7",
    title: "React Server Components Explained",
    channelTitle: "React Experts",
    channelId: "mock-channel-7",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Server+Components",
    viewCount: "456789",
    description: "Understanding React Server Components and how they improve performance in your applications.",
  },
  {
    id: "mock-video-8",
    title: "TypeScript Best Practices for 2025",
    channelTitle: "TypeScript Tutorials",
    channelId: "mock-channel-8",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=TypeScript",
    viewCount: "678901",
    description: "Learn the best practices for writing clean, maintainable TypeScript code in 2025.",
  },
]

export const mockSearchResults = [
  ...mockTrendingVideos,
  {
    id: "mock-search-1",
    title: "Advanced Search Techniques for Developers",
    channelTitle: "Dev Tips",
    channelId: "mock-channel-9",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Search+Techniques",
    viewCount: "123456",
    description: "Master advanced search techniques to find solutions to coding problems faster.",
  },
  {
    id: "mock-search-2",
    title: "Building Accessible Web Applications",
    channelTitle: "Accessibility Matters",
    channelId: "mock-channel-10",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Accessibility",
    viewCount: "234567",
    description: "Learn how to build web applications that are accessible to everyone.",
  },
]

export const mockVideoDetails = {
  id: "mock-video-details",
  title: "Building a YouTube Clone with Next.js and Tailwind CSS",
  channelTitle: "Code Projects",
  channelId: "mock-channel-4",
  publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  thumbnailUrl: "/placeholder.svg?height=360&width=640&text=YouTube+Clone",
  viewCount: "345678",
  description: `In this comprehensive tutorial, we'll build a complete YouTube clone using Next.js, Tailwind CSS, and the YouTube API.

Topics covered:
- Setting up a Next.js project
- Implementing the YouTube Data API
- Creating responsive layouts with Tailwind CSS
- Building a video player component
- Implementing search functionality
- Creating a sidebar navigation
- Adding dark mode support
- Implementing video sharing functionality

This project is perfect for intermediate developers looking to improve their React and Next.js skills while building a real-world application.`,
}

export const mockChannelDetails = {
  id: "mock-channel-4",
  title: "Code Projects",
  description:
    "We create tutorials and project-based learning content for web developers. Our focus is on React, Next.js, and modern web development techniques.",
  thumbnailUrl: "/placeholder.svg?height=100&width=100&text=CP",
  subscriberCount: "1234567",
  videoCount: "156",
}

export const mockComments = [
  {
    id: "mock-comment-1",
    authorName: "Web Dev Enthusiast",
    authorProfileImageUrl: "/placeholder.svg?height=48&width=48&text=WDE",
    text: "This tutorial was incredibly helpful! I've been struggling with implementing the YouTube API, but your explanations made it so clear.",
    likeCount: "342",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "mock-comment-2",
    authorName: "React Learner",
    authorProfileImageUrl: "/placeholder.svg?height=48&width=48&text=RL",
    text: "Great tutorial! Could you make one about implementing authentication in a Next.js app?",
    likeCount: "156",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "mock-comment-3",
    authorName: "CSS Wizard",
    authorProfileImageUrl: "/placeholder.svg?height=48&width=48&text=CW",
    text: "The Tailwind CSS implementation is so clean. I love how you structured the components.",
    likeCount: "98",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    id: "mock-comment-4",
    authorName: "Next.js Developer",
    authorProfileImageUrl: "/placeholder.svg?height=48&width=48&text=ND",
    text: "I've been using Next.js for a while, but I learned some new tricks from this video. Thanks for sharing!",
    likeCount: "76",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "mock-comment-5",
    authorName: "Frontend Beginner",
    authorProfileImageUrl: "/placeholder.svg?height=48&width=48&text=FB",
    text: "As someone just starting out with React, this was a bit advanced for me, but I still learned a lot. Looking forward to more tutorials!",
    likeCount: "45",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
]

export const mockChannelVideos = [
  {
    id: "mock-channel-video-1",
    title: "Building a YouTube Clone with Next.js",
    channelTitle: "Code Projects",
    channelId: "mock-channel-4",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=YouTube+Clone",
    viewCount: "345678",
    description: "Follow along as we build a complete YouTube clone using Next.js, Tailwind CSS, and the YouTube API.",
  },
  {
    id: "mock-channel-video-2",
    title: "Creating a Twitter Clone with React",
    channelTitle: "Code Projects",
    channelId: "mock-channel-4",
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Twitter+Clone",
    viewCount: "234567",
    description: "Learn how to build a Twitter clone using React, Firebase, and Tailwind CSS.",
  },
  {
    id: "mock-channel-video-3",
    title: "Building a Netflix Clone with Next.js",
    channelTitle: "Code Projects",
    channelId: "mock-channel-4",
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Netflix+Clone",
    viewCount: "456789",
    description: "Create a Netflix clone with Next.js, Tailwind CSS, and the TMDB API.",
  },
  {
    id: "mock-channel-video-4",
    title: "Building an Instagram Clone with React Native",
    channelTitle: "Code Projects",
    channelId: "mock-channel-4",
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
    thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Instagram+Clone",
    viewCount: "345678",
    description: "Learn how to build an Instagram clone using React Native and Firebase.",
  },
]

// Video titles for generating random content
const videoTitles = [
  "Building a Modern Web Application with React and TypeScript",
  "Advanced CSS Techniques for 2025",
  "JavaScript Performance Optimization Guide",
  "Introduction to Web3 Development",
  "Machine Learning for Frontend Developers",
  "Building Scalable Backend Systems with Node.js",
  "Mastering GraphQL APIs",
  "Responsive Design Patterns for Mobile-First Websites",
  "State Management in Modern React Applications",
  "Accessibility Best Practices for Web Development",
  "Serverless Architecture with AWS Lambda",
]

// Channel names for generating random content
const channelNames = [
  "Code Masters",
  "Web Dev Simplified",
  "Frontend Focus",
  "JavaScript Guru",
  "React Experts",
  "Tech Insights",
  "Programming with Mosh",
  "Dev Ed",
  "Traversy Media",
  "The Net Ninja",
]

// Function to generate random number between min and max (inclusive)
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate a random date within the last 30 days
function getRandomDate() {
  const daysAgo = getRandomInt(1, 30)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Function to generate random view count
function getRandomViewCount() {
  return getRandomInt(10000, 5000000).toString()
}

// Function to generate a random description
function getRandomDescription() {
  const descriptions = [
    "Learn how to build modern web applications with the latest technologies.",
    "Master advanced techniques to improve your development skills.",
    "A comprehensive guide to building scalable and maintainable applications.",
    "Discover the best practices for modern web development.",
    "Step-by-step tutorial for beginners and intermediate developers.",
    "Deep dive into advanced concepts and techniques.",
    "Everything you need to know about building professional applications.",
    "Tips and tricks to level up your development skills.",
    "Practical examples and real-world applications.",
    "From beginner to expert: A complete guide to mastering this technology.",
  ]

  return descriptions[getRandomInt(0, descriptions.length - 1)]
}

// Function to generate a random thumbnail URL
function getRandomThumbnail(title: string) {
  // Create a placeholder image with the title text
  const formattedTitle = title.replace(/\s+/g, "+").substring(0, 20)
  return `/placeholder.svg?height=180&width=320&text=${formattedTitle}`
}

// Function to generate a random set of mock videos
function generateRandomVideos(count: number) {
  const videos = []

  for (let i = 0; i < count; i++) {
    const title = videoTitles[getRandomInt(0, videoTitles.length - 1)]
    const channelName = channelNames[getRandomInt(0, channelNames.length - 1)]
    const channelId = `mock-channel-${getRandomInt(1, 20)}`

    videos.push({
      id: `mock-video-${Date.now()}-${i}`,
      title,
      channelTitle: channelName,
      channelId,
      publishedAt: getRandomDate(),
      thumbnailUrl: getRandomThumbnail(title),
      viewCount: getRandomViewCount(),
      description: getRandomDescription(),
    })
  }

  return videos
}

// Function to generate random comments
function generateRandomComments(count: number) {
  const comments = []
  const authorNames = ["Web Enthusiast", "Code Lover", "Dev Ninja", "JS Fan", "React Pro", "Tech Geek"]

  for (let i = 0; i < count; i++) {
    const authorName = authorNames[getRandomInt(0, authorNames.length - 1)]
    const initials = authorName
      .split(" ")
      .map((word) => word[0])
      .join("")

    comments.push({
      id: `mock-comment-${Date.now()}-${i}`,
      authorName,
      authorProfileImageUrl: `/placeholder.svg?height=48&width=48&text=${initials}`,
      text: getRandomDescription(),
      likeCount: getRandomInt(1, 500).toString(),
      publishedAt: getRandomDate(),
    })
  }

  return comments
}

// Main function to generate fresh mock data
export async function generateMockData() {
  // Generate trending videos
  const trendingVideos = generateRandomVideos(12)

  // Generate search results (include some trending videos for consistency)
  const searchResults = [...trendingVideos.slice(0, 5), ...generateRandomVideos(10)]

  // Generate a random video for video details
  const randomVideo = trendingVideos[getRandomInt(0, trendingVideos.length - 1)]
  const videoDetails = {
    ...randomVideo,
    description: `${randomVideo.description}\n\nThis is an extended description with more details about the video content.\n\nTopics covered:\n- Introduction to the subject\n- Core concepts and techniques\n- Advanced implementation strategies\n- Best practices and common pitfalls\n- Real-world examples and use cases\n\nThis video is suitable for developers of all skill levels who want to improve their knowledge and skills.`,
  }

  // Generate a random channel
  const channelName = channelNames[getRandomInt(0, channelNames.length - 1)]
  const initials = channelName
    .split(" ")
    .map((word) => word[0])
    .join("")
  const channelDetails = {
    id: `mock-channel-${getRandomInt(1, 20)}`,
    title: channelName,
    description: `${channelName} is a channel dedicated to teaching web development and programming concepts. We focus on practical, project-based learning to help you build real-world skills.`,
    thumbnailUrl: `/placeholder.svg?height=100&width=100&text=${initials}`,
    subscriberCount: getRandomInt(10000, 5000000).toString(),
    videoCount: getRandomInt(50, 500).toString(),
  }

  // Generate comments
  const comments = generateRandomComments(8)

  // Generate channel videos
  const channelVideos = generateRandomVideos(8)

  // Return the complete mock data set
  return {
    trendingVideos,
    searchResults,
    videoDetails,
    channelDetails,
    comments,
    channelVideos,
  }
}

// Check if we need to refresh mock data (if it's older than 24 hours)
if (typeof window !== "undefined") {
  const lastUpdated = localStorage.getItem("youtube-mock-data-updated")

  if (lastUpdated) {
    const lastUpdatedDate = new Date(lastUpdated)
    const now = new Date()
    const diffHours = (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60)

    if (diffHours > 24) {
      // Refresh mock data in background
      generateMockData()
        .then((newMockData) => {
          localStorage.setItem("youtube-mock-data", JSON.stringify(newMockData))
          localStorage.setItem("youtube-mock-data-updated", new Date().toISOString())
          console.log("Mock data refreshed automatically")
        })
        .catch(console.error)
    }
  }
}

export function getMockData() {
  if (typeof window === "undefined") {
    return {
      trendingVideos: mockTrendingVideos,
      searchResults: mockSearchResults,
      videoDetails: mockVideoDetails,
      channelDetails: mockChannelDetails,
      comments: mockComments,
      channelVideos: mockChannelVideos,
    }
  }

  // Check if we have stored mock data
  const storedMockData = localStorage.getItem("youtube-mock-data")
  const lastUpdated = localStorage.getItem("youtube-mock-data-updated")

  // If we have stored mock data, use it
  if (storedMockData) {
    try {
      const parsedData = JSON.parse(storedMockData)

      // Check if mock data needs to be refreshed (older than 24 hours)
      if (lastUpdated) {
        const lastUpdatedDate = new Date(lastUpdated)
        const now = new Date()
        const diffHours = (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60)

        if (diffHours > 24) {
          // Refresh in background
          generateMockData().catch(console.error)
        }
      }

      return parsedData
    } catch (error) {
      console.error("Error parsing stored mock data:", error)
    }
  }

  // If we don't have stored mock data or there was an error, use the default mock data
  // and try to refresh it
  generateMockData().catch(console.error)

  return {
    trendingVideos: mockTrendingVideos,
    searchResults: mockSearchResults,
    videoDetails: mockVideoDetails,
    channelDetails: mockChannelDetails,
    comments: mockComments,
    channelVideos: mockChannelVideos,
  }
}
