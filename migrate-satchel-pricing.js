/**
 * Database Migration Script
 * Purpose: Update existing pricing records to new satchel structure
 * 
 * Old Structure:
 * satchel: { a4: 90, a3: 110 }
 * 
 * New Structure:
 * satchel: {
 *   economy: { a4: 90, a3: 110 },
 *   express: { a4: 110, a3: 130 }
 * }
 * 
 * Run this script ONCE after deploying the new code
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Pricing = require('./models/Pricing');

async function migrateSatchelPricing() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔍 Finding pricing records with old satchel structure...');
        const pricingRecords = await Pricing.find({});

        console.log(`📊 Found ${pricingRecords.length} pricing record(s)`);

        for (const record of pricingRecords) {
            // Check if already migrated
            if (record.satchel?.economy && record.satchel?.express) {
                console.log(`⏭️  Record ${record._id} already migrated, skipping...`);
                continue;
            }

            // Check if old structure exists
            if (record.satchel?.a4 !== undefined && record.satchel?.a3 !== undefined) {
                const oldA4 = record.satchel.a4;
                const oldA3 = record.satchel.a3;

                console.log(`🔄 Migrating record ${record._id}...`);
                console.log(`   Old: { a4: ${oldA4}, a3: ${oldA3} }`);

                // Update to new structure
                record.satchel = {
                    economy: {
                        a4: oldA4,
                        a3: oldA3
                    },
                    express: {
                        a4: oldA4 + 20, // Express is R20 more expensive
                        a3: oldA3 + 20
                    }
                };

                await record.save();

                console.log(`✅ Migrated successfully`);
                console.log(`   New Economy: { a4: ${record.satchel.economy.a4}, a3: ${record.satchel.economy.a3} }`);
                console.log(`   New Express: { a4: ${record.satchel.express.a4}, a3: ${record.satchel.express.a3} }`);
            } else {
                console.log(`⚠️  Record ${record._id} has unexpected structure, skipping...`);
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateSatchelPricing();
