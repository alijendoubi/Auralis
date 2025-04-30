#!/bin/bash

# MED Clinic Database Seed Script

echo "MED Clinic Database Seed Script"
echo "==============================="
echo "This script will seed the Firestore database with sample data for development."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please log in to Firebase:"
    firebase login
fi

# Check if Firebase emulators are running
curl -s http://localhost:8080 > /dev/null
if [ $? -ne 0 ]; then
    echo "Firebase emulators are not running. Starting emulators..."
    gnome-terminal -- bash -c "firebase emulators:start; read -p 'Press Enter to close...'" 2>/dev/null || \
    xterm -e "firebase emulators:start; read -p 'Press Enter to close...'" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd '$PWD' && firebase emulators:start"' 2>/dev/null || \
    start cmd /k "firebase emulators:start" 2>/dev/null || \
    firebase emulators:start &
    
    # Wait for emulators to start
    echo "Waiting for emulators to start..."
    sleep 10
fi

# Create a temporary seed data file
cat > seed-data.js << 'EOL'
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  admin.initializeApp({
    projectId: 'med-clinic-dev'
  });
}

const db = admin.firestore();

// Sample data
const users = [
  {
    uid: 'admin123',
    email: 'admin@medclinic.com',
    displayName: 'Admin User',
    role: 'admin',
    approved: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'therapist123',
    email: 'therapist@medclinic.com',
    displayName: 'Dr. Jane Smith',
    role: 'therapist',
    approved: true,
    specialties: ['Anxiety', 'Depression', 'PTSD'],
    bio: 'Licensed therapist with 10 years of experience in cognitive behavioral therapy.',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'therapist456',
    email: 'therapist2@medclinic.com',
    displayName: 'Dr. John Doe',
    role: 'therapist',
    approved: true,
    specialties: ['Family Therapy', 'Addiction', 'Grief'],
    bio: 'Specializing in family therapy and addiction recovery for over 15 years.',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'therapist789',
    email: 'therapist3@medclinic.com',
    displayName: 'Dr. Sarah Johnson',
    role: 'therapist',
    approved: false,
    specialties: ['Child Psychology', 'Trauma', 'Anxiety'],
    bio: 'Child psychology specialist with expertise in trauma-informed care.',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const clients = [
  {
    id: 'client123',
    therapistId: 'therapist123',
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '555-123-4567',
    dateOfBirth: new Date(1985, 5, 15),
    address: '123 Main St, Anytown, USA',
    emergencyContact: {
      name: 'Bob Brown',
      relationship: 'Spouse',
      phone: '555-123-4568'
    },
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'client456',
    therapistId: 'therapist123',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    phone: '555-123-4569',
    dateOfBirth: new Date(1990, 8, 22),
    address: '456 Oak St, Anytown, USA',
    emergencyContact: {
      name: 'Diana Davis',
      relationship: 'Spouse',
      phone: '555-123-4570'
    },
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'client789',
    therapistId: 'therapist456',
    name: 'Eve Franklin',
    email: 'eve@example.com',
    phone: '555-123-4571',
    dateOfBirth: new Date(1978, 2, 10),
    address: '789 Pine St, Anytown, USA',
    emergencyContact: {
      name: 'Frank Franklin',
      relationship: 'Spouse',
      phone: '555-123-4572'
    },
    status: 'inactive',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const appointments = [
  {
    id: 'appt123',
    therapistId: 'therapist123',
    clientId: 'client123',
    clientName: 'Alice Brown',
    date: new Date(Date.now() + 86400000), // Tomorrow
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    type: 'Individual Therapy',
    notes: 'Follow-up on anxiety management techniques',
    reminderSent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'appt456',
    therapistId: 'therapist123',
    clientId: 'client456',
    clientName: 'Charlie Davis',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    type: 'Individual Therapy',
    notes: 'Initial assessment',
    reminderSent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'appt789',
    therapistId: 'therapist456',
    clientId: 'client789',
    clientName: 'Eve Franklin',
    date: new Date(Date.now() + 259200000), // 3 days from now
    startTime: '11:00',
    endTime: '12:00',
    status: 'pending',
    type: 'Family Therapy',
    notes: 'Family conflict resolution session',
    reminderSent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'appt101',
    therapistId: 'therapist123',
    clientId: 'client123',
    clientName: 'Alice Brown',
    date: new Date(Date.now() - 86400000), // Yesterday
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    type: 'Individual Therapy',
    notes: 'Discussed progress with anxiety management',
    reminderSent: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const notes = [
  {
    id: 'note123',
    therapistId: 'therapist123',
    clientId: 'client123',
    appointmentId: 'appt101',
    title: 'Session Notes - Alice Brown',
    content: 'Client reports reduced anxiety symptoms. Sleep has improved. Continuing with mindfulness exercises.',
    template: 'SOAP',
    templateData: {
      subjective: 'Client reports reduced anxiety symptoms and improved sleep.',
      objective: 'Client appears more relaxed than previous session. Maintained good eye contact.',
      assessment: 'Anxiety symptoms improving with current treatment plan.',
      plan: 'Continue mindfulness exercises. Schedule follow-up in 1 week.'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const forms = [
  {
    id: 'form123',
    therapistId: 'therapist123',
    title: 'Initial Assessment',
    description: 'Please complete this form before your first appointment.',
    fields: [
      {
        id: 'field1',
        type: 'text',
        label: 'What brings you to therapy?',
        required: true
      },
      {
        id: 'field2',
        type: 'radio',
        label: 'Have you been in therapy before?',
        options: ['Yes', 'No'],
        required: true
      },
      {
        id: 'field3',
        type: 'checkbox',
        label: 'Please select any symptoms you are experiencing:',
        options: ['Anxiety', 'Depression', 'Sleep Issues', 'Relationship Problems', 'Work Stress', 'Other'],
        required: false
      },
      {
        id: 'field4',
        type: 'textarea',
        label: 'Please describe your current situation in more detail:',
        required: false
      }
    ],
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const clientForms = [
  {
    id: 'clientform123',
    formId: 'form123',
    clientId: 'client123',
    therapistId: 'therapist123',
    title: 'Initial Assessment',
    responses: [
      {
        fieldId: 'field1',
        response: 'I have been experiencing anxiety and panic attacks for the past 6 months.'
      },
      {
        fieldId: 'field2',
        response: 'No'
      },
      {
        fieldId: 'field3',
        response: ['Anxiety', 'Sleep Issues']
      },
      {
        fieldId: 'field4',
        response: 'My anxiety has been affecting my work performance and relationships. I find it difficult to relax and often worry about the future.'
      }
    ],
    status: 'completed',
    submittedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const payments = [
  {
    id: 'payment123',
    therapistId: 'therapist123',
    clientId: 'client123',
    appointmentId: 'appt101',
    amount: 150.00,
    currency: 'USD',
    status: 'paid',
    method: 'card',
    stripePaymentId: 'pi_mock_123456',
    description: 'Therapy session - 2025-04-29',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const reviews = [
  {
    id: 'review123',
    therapistId: 'therapist123',
    clientId: 'client123',
    appointmentId: 'appt101',
    rating: 5,
    comment: 'Dr. Smith was very helpful and understanding. I felt comfortable discussing my issues.',
    anonymous: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const availability = [
  {
    id: 'avail123',
    therapistId: 'therapist123',
    weekday: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    breaks: [
      {
        startTime: '12:00',
        endTime: '13:00',
        description: 'Lunch'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'avail124',
    therapistId: 'therapist123',
    weekday: 2, // Tuesday
    startTime: '09:00',
    endTime: '17:00',
    breaks: [
      {
        startTime: '12:00',
        endTime: '13:00',
        description: 'Lunch'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'avail125',
    therapistId: 'therapist123',
    weekday: 3, // Wednesday
    startTime: '09:00',
    endTime: '17:00',
    breaks: [
      {
        startTime: '12:00',
        endTime: '13:00',
        description: 'Lunch'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'avail126',
    therapistId: 'therapist123',
    weekday: 4, // Thursday
    startTime: '09:00',
    endTime: '17:00',
    breaks: [
      {
        startTime: '12:00',
        endTime: '13:00',
        description: 'Lunch'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'avail127',
    therapistId: 'therapist123',
    weekday: 5, // Friday
    startTime: '09:00',
    endTime: '15:00',
    breaks: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Seed data function
async function seedData() {
  console.log('Seeding data to Firestore...');
  
  // Clear existing data
  console.log('Clearing existing data...');
  const collections = ['users', 'clients', 'appointments', 'notes', 'forms', 'clientForms', 'payments', 'reviews', 'availability'];
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    const batchSize = snapshot.size;
    
    if (batchSize === 0) {
      console.log(`No existing data in ${collection} collection.`);
      continue;
    }
    
    console.log(`Deleting ${batchSize} documents from ${collection} collection...`);
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${batchSize} documents from ${collection} collection.`);
  }
  
  // Add new data
  console.log('Adding new data...');
  
  // Users
  for (const user of users) {
    await db.collection('users').doc(user.uid).set(user);
  }
  console.log(`Added ${users.length} users.`);
  
  // Clients
  for (const client of clients) {
    await db.collection('clients').doc(client.id).set(client);
  }
  console.log(`Added ${clients.length} clients.`);
  
  // Appointments
  for (const appointment of appointments) {
    await db.collection('appointments').doc(appointment.id).set(appointment);
  }
  console.log(`Added ${appointments.length} appointments.`);
  
  // Notes
  for (const note of notes) {
    await db.collection('notes').doc(note.id).set(note);
  }
  console.log(`Added ${notes.length} notes.`);
  
  // Forms
  for (const form of forms) {
    await db.collection('forms').doc(form.id).set(form);
  }
  console.log(`Added ${forms.length} forms.`);
  
  // Client Forms
  for (const clientForm of clientForms) {
    await db.collection('clientForms').doc(clientForm.id).set(clientForm);
  }
  console.log(`Added ${clientForms.length} client forms.`);
  
  // Payments
  for (const payment of payments) {
    await db.collection('payments').doc(payment.id).set(payment);
  }
  console.log(`Added ${payments.length} payments.`);
  
  // Reviews
  for (const review of reviews) {
    await db.collection('reviews').doc(review.id).set(review);
  }
  console.log(`Added ${reviews.length} reviews.`);
  
  // Availability
  for (const avail of availability) {
    await db.collection('availability').doc(avail.id).set(avail);
  }
  console.log(`Added ${availability.length} availability records.`);
  
  console.log('Data seeding completed successfully!');
  process.exit(0);
}

// Run the seed function
seedData().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
EOL

# Create a service account key file if it doesn't exist
if [ ! -f "serviceAccountKey.json" ]; then
    echo "Creating a mock service account key file..."
    cat > serviceAccountKey.json << 'EOL'
{
  "type": "service_account",
  "project_id": "med-clinic-dev",
  "private_key_id": "mock-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n",
  "client_email": "mock-service-account@med-clinic-dev.iam.gserviceaccount.com",
  "client_id": "mock-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mock-service-account%40med-clinic-dev.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
EOL
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/firebase-admin" ]; then
    echo "Installing required dependencies..."
    npm install --no-save firebase-admin
fi

# Run the seed script
echo "Running seed script..."
node seed-data.js

# Clean up
echo "Cleaning up temporary files..."
rm -f seed-data.js

echo "Database seeding completed!"
echo "You can now access the Firebase Emulator UI at http://localhost:4000"
echo "Login credentials for testing:"
echo "- Admin: admin@medclinic.com"
echo "- Therapist: therapist@medclinic.com"
echo "- Therapist 2: therapist2@medclinic.com"
echo "- Therapist 3 (unapproved): therapist3@medclinic.com"
