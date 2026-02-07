import FloorPlan from '../models/FloorPlan.js'
import Moodboard from '../models/Moodboard.js'
import ThreeDModel from '../models/ThreeDModel.js'

export const getUserProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 6, type = 'all', sortBy = 'recent', search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const userId = req.user.id

    const query = { userId, isDeleted: false }
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { style: searchRegex },
        { roomType: searchRegex }
      ]
    }

    let projects = []
    let total = 0

    const moodboardQuery = Moodboard.find(query)
    const floorPlanQuery = FloorPlan.find(query)
    const threeDQuery = ThreeDModel.find(query)

    if (type === 'moodboard') {
      total = await Moodboard.countDocuments(query)
      projects = await Moodboard.find(query)
        .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))
    } else if (type === 'floorplan') {
      total = await FloorPlan.countDocuments(query)
      projects = await FloorPlan.find(query)
        .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))
    } else if (type === 'threed') {
      total = await ThreeDModel.countDocuments(query)
      projects = await ThreeDModel.find(query)
        .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))
    } else {
      // Fetch all and aggregate
      // Note: This is a complex case for server-side pagination without a unified "Project" collection.
      // For now, we fetch a bit more from each to provide a balanced mix, or we use aggregation.
      // A truly aggregated server-side pagination requires a $facet or a unified collection.
      
      // Better approach for "all":
      const [mbItems, fpItems, tdItems] = await Promise.all([
        Moodboard.find(query).lean(),
        FloorPlan.find(query).lean(),
        ThreeDModel.find(query).lean()
      ])

      const combined = [
        ...mbItems.map(i => ({ ...i, type: 'moodboard' })),
        ...fpItems.map(i => ({ ...i, type: 'floorplan' })),
        ...tdItems.map(i => ({ ...i, type: 'threed' }))
      ]

      combined.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return sortBy === 'recent' ? dateB - dateA : dateA - dateB
      })

      total = combined.length
      projects = combined.slice(skip, skip + parseInt(limit))
    }

    // Always fetch total counts for stats chips
    const [mbCount, fpCount, tdCount] = await Promise.all([
      Moodboard.countDocuments({ userId, isDeleted: false }),
      FloorPlan.countDocuments({ userId, isDeleted: false }),
      ThreeDModel.countDocuments({ userId, isDeleted: false })
    ])

    res.status(200).json({
      status: 'success',
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      counts: {
        total: mbCount + fpCount + tdCount,
        moodboard: mbCount,
        floorplan: fpCount,
        threed: tdCount
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    next(error)
  }
}
