"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const record_model_1 = require("../modules/records/record.model");
const user_model_1 = require("../modules/users/user.model");
const CATEGORIES = [
    { id: 'food', name: 'Food & Dining' },
    { id: 'travel', name: 'Travel' },
    { id: 'bills', name: 'Bills & Utilities' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'health', name: 'Health & Fitness' },
    { id: 'education', name: 'Education' },
    { id: 'others', name: 'Others' },
];
const EXPENSE_NOTES = {
    food: [
        'Lunch at office canteen',
        'Dinner with family',
        'Grocery shopping',
        'Zomato order',
        'Swiggy breakfast',
        'Coffee at Starbucks',
        'Street food',
        'Fruit and vegetables',
        'Bakery items',
        'Restaurant dinner',
    ],
    travel: [
        'Ola cab to airport',
        'Metro card recharge',
        'Auto rickshaw fare',
        'Uber ride home',
        'Petrol refill',
        'Train ticket booking',
        'Flight booking',
        'Bus pass recharge',
        'Parking fee',
        'Toll charges',
    ],
    bills: [
        'Electricity bill payment',
        'WiFi bill',
        'Water bill payment',
        'Mobile recharge',
        'DTH recharge',
        'Gas cylinder booking',
        'House rent transfer',
        'Society maintenance',
        'Newspaper subscription',
        'OTT subscription',
    ],
    shopping: [
        'Amazon purchase',
        'Flipkart order',
        'Clothes shopping',
        'Shoes purchase',
        'Accessories order',
        'Home decor purchase',
        'Electronics purchase',
        'Book store shopping',
        'Stationery restock',
        'Gift purchase',
    ],
    entertainment: [
        'Movie tickets',
        'Netflix subscription',
        'Spotify premium',
        'Gaming purchase',
        'Concert tickets',
        'Amusement park booking',
        'OTT subscription renewal',
        'Game top-up',
        'Cricket match tickets',
        'Comedy show booking',
    ],
    health: [
        'Doctor consultation',
        'Medicine purchase',
        'Gym membership',
        'Health checkup',
        'Dental visit',
        'Eye checkup',
        'Vitamins and supplements',
        'Yoga class fee',
        'Physiotherapy session',
        'Lab tests payment',
    ],
    education: [
        'Online course fee',
        'Books and materials',
        'Coaching fees',
        'Certification exam fee',
        'Workshop registration',
        'Udemy course',
        'Library membership',
        'Skill training fee',
        'Study material purchase',
        'Mock test package',
    ],
    others: [
        'Birthday gift',
        'Charity donation',
        'Miscellaneous payment',
        'Home repair',
        'Laundry service',
        'Salon and grooming',
        'Pet food purchase',
        'Plant purchase',
        'Festival expenses',
        'General household expense',
    ],
};
const INCOME_NOTES = [
    'Monthly salary credited',
    'Freelance project payment',
    'Consulting fees received',
    'Bonus credited',
    'Side project income',
    'Investment returns',
    'Rent income received',
    'Referral bonus',
    'Performance incentive',
    'Part-time work payment',
];
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomDateInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = randomInt(1, daysInMonth);
    const hour = randomInt(7, 22);
    const minute = randomInt(0, 59);
    return new Date(year, month - 1, day, hour, minute);
}
function buildMonthlyDistribution(totalEntries) {
    const currentMonth = Math.round(totalEntries * 0.3);
    const previousMonth = Math.round(totalEntries * 0.4);
    const olderMonth = totalEntries - currentMonth - previousMonth;
    const now = new Date();
    return [
        { year: now.getFullYear(), month: now.getMonth() + 1, total: currentMonth },
        { year: now.getFullYear(), month: now.getMonth(), total: previousMonth },
        { year: now.getFullYear(), month: now.getMonth() - 1, total: olderMonth },
    ].map((entry) => {
        let { year, month } = entry;
        while (month <= 0) {
            month += 12;
            year -= 1;
        }
        const incomeCount = Math.max(1, Math.round(entry.total * 0.1));
        const expenseCount = entry.total - incomeCount;
        return { year, month, incomeCount, expenseCount };
    });
}
async function ensureDemoUsers() {
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
    ];
    for (const user of demoUsers) {
        const passwordHash = await bcryptjs_1.default.hash(user.password, env_1.env.BCRYPT_SALT_ROUNDS);
        await user_model_1.UserModel.findOneAndUpdate({ email: user.email }, {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            passwordHash,
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
    }
    const admin = await user_model_1.UserModel.findOne({ email: 'admin@walletwhiz.dev' });
    const analyst = await user_model_1.UserModel.findOne({ email: 'analyst@walletwhiz.dev' });
    const viewer = await user_model_1.UserModel.findOne({ email: 'viewer@walletwhiz.dev' });
    if (!admin || !analyst || !viewer) {
        throw new Error('Failed to ensure demo users');
    }
    return { admin, analyst, viewer };
}
async function run() {
    await (0, db_1.connectDatabase)();
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');
    const countArgIndex = args.indexOf('--count');
    const totalEntries = countArgIndex >= 0 && args[countArgIndex + 1]
        ? Math.max(2000, parseInt(args[countArgIndex + 1], 10))
        : 2000;
    const { admin, analyst, viewer } = await ensureDemoUsers();
    if (shouldClear) {
        const deletedRecords = await record_model_1.RecordModel.deleteMany({});
        console.log(`Cleared ${deletedRecords.deletedCount} existing records`);
    }
    const currentCount = await record_model_1.RecordModel.countDocuments({ isDeleted: false });
    if (!shouldClear && currentCount >= totalEntries) {
        console.log(`Current active record count is already ${currentCount}. Use --clear to reseed.`);
        return;
    }
    const users = [admin, analyst, viewer];
    const monthlyDistribution = buildMonthlyDistribution(totalEntries);
    const docs = [];
    for (const { year, month, expenseCount, incomeCount } of monthlyDistribution) {
        for (let i = 0; i < expenseCount; i++) {
            const category = randomFrom(CATEGORIES);
            const amountRanges = {
                food: [50, 800],
                travel: [30, 2500],
                bills: [200, 5000],
                shopping: [100, 8000],
                entertainment: [50, 1500],
                health: [100, 3000],
                education: [200, 10000],
                others: [50, 2000],
            };
            const [min, max] = amountRanges[category.id] || [100, 1000];
            const actor = randomFrom(users);
            docs.push({
                amount: randomFloat(min, max),
                type: 'expense',
                category: category.id,
                occurredAt: randomDateInMonth(year, month),
                notes: randomFrom(EXPENSE_NOTES[category.id]),
                createdBy: actor._id,
                updatedBy: actor._id,
                isDeleted: false,
            });
        }
        for (let i = 0; i < incomeCount; i++) {
            const actor = randomFrom(users);
            const isSalary = i < Math.floor(incomeCount * 0.4);
            const note = isSalary ? 'Monthly salary credited' : randomFrom(INCOME_NOTES.slice(1));
            const amount = isSalary ? randomFloat(40000, 120000) : randomFloat(2000, 30000);
            const day = isSalary ? randomInt(1, 5) : randomInt(1, 28);
            const occurredAt = new Date(year, month - 1, day, randomInt(9, 18), randomInt(0, 59));
            docs.push({
                amount,
                type: 'income',
                category: 'others',
                occurredAt,
                notes: note,
                createdBy: actor._id,
                updatedBy: actor._id,
                isDeleted: false,
            });
        }
    }
    const BATCH_SIZE = 200;
    let inserted = 0;
    for (let index = 0; index < docs.length; index += BATCH_SIZE) {
        const batch = docs.slice(index, index + BATCH_SIZE);
        await record_model_1.RecordModel.insertMany(batch, { ordered: false });
        inserted += batch.length;
        process.stdout.write(`\rInserted ${inserted} / ${docs.length}`);
    }
    const finalCount = await record_model_1.RecordModel.countDocuments({ isDeleted: false });
    console.log(`\nSeed complete. Active record count: ${finalCount}`);
    console.log(`Admin: ${admin.email} password123`);
    console.log(`Analyst: ${analyst.email} password123`);
    console.log(`Viewer: ${viewer.email} password123`);
}
void run()
    .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, db_1.disconnectDatabase)();
});
