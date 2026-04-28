import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.error('Set MONGODB_URI in .env.local before running seed')
  process.exit(1)
}

async function seed() {

  
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const { default: User }     = await import('../models/User')
  const { default: Product }  = await import('../models/Product')
  const { default: Settings } = await import('../models/Settings')

  // Admin user
  const existing = await User.findOne({ email: 'admin@hmpmasala.com' })
  if (!existing) {
    await User.create({
      name:     'HMP Admin',
      email:    'admin@hmpmasala.com',
      phone:    '9999999999',
      password: await bcrypt.hash('Admin@1234', 12),
      role:     'admin',
    })
    console.log('Admin created: admin@hmpmasala.com / Admin@1234')
  } else {
    console.log('Admin already exists')
  }

  // Settings singleton
  const settings = await Settings.findOne()
  if (!settings) {
    await Settings.create({
      paymentEnabled:              false,
      whatsappVerificationEnabled: true,
      whatsappNumber:              '91XXXXXXXXXX',
      storeName:                   'HMP Masala',
    })
    console.log('Settings initialized')
  }

  // Sample products
  const count = await Product.countDocuments()
  if (count === 0) {
    await Product.insertMany([
      {
        name:        'Garam Masala',
        description: 'A warm and aromatic blend of whole spices, freshly ground in small batches. Perfect for curries, rice dishes, and marinades.',
        price:       149,
        stock:       50,
        category:    'Garam Masala',
        images:      [],
        isActive:    true,
      },
      {
        name:        'Chai Masala',
        description: 'A fragrant spice blend made for the perfect cup of masala chai. Notes of cardamom, ginger, cinnamon, and clove.',
        price:       99,
        stock:       75,
        category:    'Chai Masala',
        images:      [],
        isActive:    true,
      },
      {
        name:        'Biryani Masala',
        description: 'Rich, bold, and layered spice mix crafted specifically for aromatic biryani. Family recipe passed down through generations.',
        price:       179,
        stock:       30,
        category:    'Biryani Masala',
        images:      [],
        isActive:    true,
      },
      {
        name:        'Pav Bhaji Masala',
        description: 'Tangy and bold spice blend that brings the authentic street food flavor of Mumbai to your kitchen.',
        price:       89,
        stock:       60,
        category:    'Pav Bhaji Masala',
        images:      [],
        isActive:    true,
      },
    ])
    console.log('Sample products created')
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
