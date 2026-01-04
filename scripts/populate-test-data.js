#!/usr/bin/env node

/**
 * Test Data Population Script
 * This script populates the Zapsters Attendance System with sample data
 * Run with: node scripts/populate-test-data.js
 */

const API_BASE = 'http://localhost:5001/api';

// Test data
const domains = [
    { name: 'Web Development' },
    { name: 'UI/UX Design' },
    { name: 'Cybersecurity' },
    { name: 'Game Development' },
    { name: 'AI & ML' },
    { name: 'Power BI' }
];

const batches = [
    { name: 'Batch A', startDate: '2024-01-01', endDate: '2024-03-31' },
    { name: 'Batch B', startDate: '2024-02-01', endDate: '2024-04-30' },
    { name: 'Batch C', startDate: '2024-03-01', endDate: '2024-05-31' }
];

const students = [
    { name: 'John Doe', email: 'john.doe@zapsters.com' },
    { name: 'Jane Smith', email: 'jane.smith@zapsters.com' },
    { name: 'Mike Johnson', email: 'mike.johnson@zapsters.com' },
    { name: 'Sarah Williams', email: 'sarah.williams@zapsters.com' },
    { name: 'David Brown', email: 'david.brown@zapsters.com' },
    { name: 'Emily Davis', email: 'emily.davis@zapsters.com' },
    { name: 'Chris Wilson', email: 'chris.wilson@zapsters.com' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@zapsters.com' }
];

async function makeRequest(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return response.json();
}

async function populateData() {
    console.log('🚀 Starting data population...\n');

    try {
        // 1. Create Domains
        console.log('📚 Creating domains...');
        const createdDomains = [];
        for (const domain of domains) {
            const result = await makeRequest(`${API_BASE}/admin/domains`, 'POST', domain);
            createdDomains.push(result);
            console.log(`  ✅ Created: ${result.name} (${result.id})`);
        }

        // 2. Create Batches for each domain
        console.log('\n📦 Creating batches...');
        const createdBatches = [];
        for (const domain of createdDomains) {
            for (const batch of batches) {
                const batchData = {
                    ...batch,
                    domainId: domain.id
                };
                const result = await makeRequest(`${API_BASE}/admin/batches`, 'POST', batchData);
                createdBatches.push(result);
                console.log(`  ✅ Created: ${result.name} for ${domain.name}`);
            }
        }

        // 3. Create Students
        console.log('\n👥 Creating students...');
        const createdStudents = [];
        let studentIndex = 0;

        for (const domain of createdDomains) {
            // Get batches for this domain
            const domainBatches = createdBatches.filter(b => b.domainId === domain.id);

            // Add 2-3 students per batch
            for (const batch of domainBatches.slice(0, 2)) {
                for (let i = 0; i < 2; i++) {
                    if (studentIndex >= students.length) break;

                    const student = students[studentIndex];
                    const studentData = {
                        ...student,
                        domainId: domain.id,
                        batchId: batch.id
                    };

                    const result = await makeRequest(`${API_BASE}/admin/students`, 'POST', studentData);
                    createdStudents.push(result);
                    console.log(`  ✅ Created: ${result.name} in ${domain.name} - ${batch.name}`);
                    studentIndex++;
                }
            }
        }

        // 4. Create Sessions
        console.log('\n📅 Creating sessions...');
        const today = new Date();
        const sessions = [];

        for (let i = 0; i < 5; i++) {
            const sessionDate = new Date(today);
            sessionDate.setDate(today.getDate() - i);

            // Create sessions for first few batches
            for (const batch of createdBatches.slice(0, 3)) {
                const sessionData = {
                    domainId: batch.domainId,
                    batchId: batch.id,
                    date: sessionDate.toISOString().split('T')[0],
                    time: '10:00',
                    durationMinutes: 120,
                    meetLink: 'https://meet.google.com/abc-defg-hij'
                };

                const result = await makeRequest(`${API_BASE}/attendance/sessions`, 'POST', sessionData);
                sessions.push(result);
                console.log(`  ✅ Created session for ${batch.name} on ${sessionData.date} (Code: ${result.attendanceCode})`);
            }
        }

        // 5. Mark some attendance
        console.log('\n✓ Marking sample attendance...');
        let attendanceMarked = 0;

        for (const session of sessions.slice(0, 10)) {
            // Get students for this batch
            const batchStudents = createdStudents.filter(s => s.batchId === session.batchId);

            // Mark attendance for 60-80% of students
            const attendanceCount = Math.floor(batchStudents.length * (0.6 + Math.random() * 0.2));

            for (let i = 0; i < attendanceCount && i < batchStudents.length; i++) {
                try {
                    await makeRequest(`${API_BASE}/attendance/mark`, 'POST', {
                        userId: batchStudents[i].id,
                        code: session.attendanceCode
                    });
                    attendanceMarked++;
                } catch (error) {
                    // Ignore errors (might be duplicate attendance)
                }
            }
        }

        console.log(`  ✅ Marked ${attendanceMarked} attendance records`);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✨ Data population complete!');
        console.log('='.repeat(50));
        console.log(`📚 Domains created: ${createdDomains.length}`);
        console.log(`📦 Batches created: ${createdBatches.length}`);
        console.log(`👥 Students created: ${createdStudents.length}`);
        console.log(`📅 Sessions created: ${sessions.length}`);
        console.log(`✓ Attendance records: ${attendanceMarked}`);
        console.log('\n🎉 You can now login and explore the system!');
        console.log('   Admin: admin@zapsters.com');
        console.log('   Student: Use any student email from above');

    } catch (error) {
        console.error('\n❌ Error populating data:', error.message);
        console.error('Make sure the backend server is running on port 5001');
    }
}

// Run the script
populateData();
