import dbConnect from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import EmailCourse from '@/models/EmailCourse'
import Page from '@/models/Page'
import Project from '@/models/Project'

function serialize(value) {
  return JSON.parse(JSON.stringify(value))
}

export async function getFeaturedProjects(limit = 6) {
  try {
    await dbConnect()

    const projects = await Project.find({ isActive: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .select('title description technologies metrics images image slug status category year isOwnProject')
      .limit(limit)
      .lean()

    return serialize(projects)
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }
}

export async function getHomeServices(limit = 6) {
  try {
    await dbConnect()

    const servicesPage = await Page.findOne({
      slug: 'services',
      isPublished: true,
    }).select('content.services').lean()

    const services = servicesPage?.content?.services

    if (Array.isArray(services)) {
      return serialize(services.slice(0, limit))
    }
  } catch (error) {
    console.error('Error fetching home services:', error)
  }

  const { homepageSchema } = await import('@/lib/pageData')
  return homepageSchema.services.slice(0, limit)
}

export async function getLatestPosts(limit = 3) {
  try {
    await dbConnect()

    const posts = await BlogPost.find({ status: 'published' })
      .select('title excerpt content category tags readTime views featured slug createdAt featuredImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return serialize(posts)
  } catch (error) {
    console.error('Error fetching latest posts:', error)
    return []
  }
}

export async function getFeaturedCourse(slug = 'react-5-dias') {
  try {
    await dbConnect()

    const course = await EmailCourse.findOne({ isActive: true, slug })
      .select('-emails.htmlContent')
      .lean()

    return course ? serialize(course) : null
  } catch (error) {
    console.error('Error fetching featured course:', error)
    return null
  }
}
