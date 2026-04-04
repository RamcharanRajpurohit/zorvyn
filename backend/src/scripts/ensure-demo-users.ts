import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../config/db'
import { env } from '../config/env'
import { UserModel } from '../modules/users/user.model'

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@walletwhiz.dev',
    role: 'admin',
    status: 'active',
    password: 'password123',
  },
  {
    name: 'Analyst User',
    email: 'analyst@walletwhiz.dev',
    role: 'analyst',
    status: 'active',
    password: 'password123',
  },
  {
    name: 'Viewer User',
    email: 'viewer@walletwhiz.dev',
    role: 'viewer',
    status: 'active',
    password: 'password123',
  },
] as const

async function run() {
  await connectDatabase()

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, env.BCRYPT_SALT_ROUNDS)

    await UserModel.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        passwordHash,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )
  }

  const users = await UserModel.find({}, 'name email role status').sort({ role: 1, email: 1 }).lean()
  console.log('Demo users ensured:')
  console.log(JSON.stringify(users, null, 2))
}

void run()
  .catch((error) => {
    console.error('Failed to ensure demo users', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
