"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const record_model_1 = require("../modules/records/record.model");
const user_model_1 = require("../modules/users/user.model");
const expenseCategories = [
    'food',
    'travel',
    'bills',
    'shopping',
    'entertainment',
    'health',
    'education',
    'others',
];
const expenseNotes = {
    food: [
        'Lunch with team',
        'Coffee and breakfast',
        'Weekend dinner',
        'Swiggy order',
        'Groceries for the week',
    ],
    travel: [
        'Cab to office',
        'Metro recharge',
        'Fuel refill',
        'Weekend train tickets',
        'Airport transfer',
    ],
    bills: [
        'Electricity bill payment',
        'Internet recharge',
        'Rent transfer',
        'Mobile plan recharge',
        'Water bill payment',
    ],
    shopping: [
        'Bought a new shirt',
        'Home essentials purchase',
        'Ordered accessories online',
        'Supermarket shopping',
        'Picked up kitchen supplies',
    ],
    entertainment: [
        'Movie night tickets',
        'Streaming subscription',
        'Concert booking',
        'Game purchase',
        'Weekend outing',
    ],
    health: [
        'Pharmacy purchase',
        'Doctor consultation',
        'Protein supplements',
        'Gym membership renewal',
        'Health check-up',
    ],
    education: [
        'Online course fee',
        'Bought study materials',
        'Workshop registration',
        'Book purchase',
        'Certification exam fee',
    ],
    others: [
        'Miscellaneous expense',
        'Household payment',
        'General transfer',
        'Unexpected expense',
        'Daily spend',
    ],
};
const incomeNotes = [
    'Monthly salary credited',
    'Freelance payment received',
    'Project bonus credited',
    'Consulting payout received',
    'Client transfer received',
];
function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
}
async function run() {
    await (0, db_1.connectDatabase)();
    const existingCount = await record_model_1.RecordModel.countDocuments({ isDeleted: false });
    if (existingCount > 0) {
        console.log(`Records already exist (${existingCount}), skipping demo record creation.`);
        return;
    }
    const adminUser = await user_model_1.UserModel.findOne({ email: 'admin@walletwhiz.dev' });
    if (!adminUser) {
        throw new Error('Admin user not found. Run `npm run ensure-demo-users` first.');
    }
    const now = new Date();
    const records = Array.from({ length: 72 }).map((_, index) => {
        const occurredAt = new Date(now);
        occurredAt.setDate(now.getDate() - index * 2);
        const type = index % 6 === 0 ? 'income' : 'expense';
        const category = type === 'income' ? 'others' : randomFrom(expenseCategories);
        return {
            amount: type === 'income' ? 45000 + index * 180 : 250 + (index % 8) * 420,
            type,
            category,
            occurredAt,
            notes: type === 'income'
                ? randomFrom(incomeNotes)
                : randomFrom(expenseNotes[category] ?? expenseNotes.others),
            createdBy: adminUser._id,
            updatedBy: adminUser._id,
            isDeleted: false,
        };
    });
    await record_model_1.RecordModel.insertMany(records);
    const insertedCount = await record_model_1.RecordModel.countDocuments({ isDeleted: false });
    console.log(`Demo records ensured. Current active record count: ${insertedCount}`);
}
void run()
    .catch((error) => {
    console.error('Failed to ensure demo records', error);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, db_1.disconnectDatabase)();
});
