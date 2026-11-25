const User = require('../models/User');
const Earning = require('../models/Earning');

exports.getOverview = async (req, res) => {
  const now = new Date();
  const startDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 29
  ));

  try {
    const [userStats, earningOverview] = await Promise.all([
      User.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
            },
            active: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$isActive', true] },
                      { $ne: ['$isSuspended', true] },
                      { $ne: ['$isBanned', true] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            newLast30Days: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0]
              }
            }
          }
        }
      ]),
      Earning.aggregate([
        { $match: { date: { $gte: startDate, $lte: now } } },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  records: { $sum: 1 },
                  totalEarnings: { $sum: '$earnings' },
                  totalExpenses: { $sum: '$expenses' },
                  netProfit: { $sum: '$netProfit' },
                  discrepancies: {
                    $sum: { $cond: [{ $eq: ['$discrepancy', true] }, 1, 0] }
                  }
                }
              }
            ],
            dailyTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$date',
                      timezone: 'UTC'
                    }
                  },
                  records: { $sum: 1 },
                  earnings: { $sum: '$earnings' },
                  netProfit: { $sum: '$netProfit' }
                }
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  _id: 0,
                  date: '$_id',
                  records: 1,
                  earnings: 1,
                  netProfit: 1
                }
              }
            ]
          }
        }
      ])
    ]);
    const periodStats = earningOverview[0] || {};

    res.json({
      generatedAt: now.toISOString(),
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      users: userStats[0] || {
        total: 0,
        verified: 0,
        active: 0,
        newLast30Days: 0
      },
      earnings: (periodStats.summary || [])[0] || {
        records: 0,
        totalEarnings: 0,
        totalExpenses: 0,
        netProfit: 0,
        discrepancies: 0
      },
      dailyTrend: periodStats.dailyTrend || []
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ message: 'Unable to load the admin overview' });
  }
};
