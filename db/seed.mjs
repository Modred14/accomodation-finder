// db/seed.mjs
// Run with: npm run db:seed
// Populates the database with realistic demo data for OAU, Ile-Ife.
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) dotenv.config({ path: p });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

const DEMO_PASSWORD = "Password123!";

// ---------------------------------------------------------------------------
// IMAGE SYSTEM
//
// Why not LoremFlickr: it resolves a keyword like "house,exterior" against a
// live Flickr tag search, so the *same* seed can return a house one day and
// a landscape/river/random tagged photo the next. That's fundamentally
// incompatible with "cover image must unquestionably be a house exterior".
//
// Approach instead: never search. Pin every image to a specific, known
// Unsplash photo ID, requested straight from Unsplash's CDN
// (images.unsplash.com/photo-<id>), which is a static asset lookup, not a
// search. The same ID always returns the same photo, forever. That gets us
// determinism; correctness of the *content* still comes down to us having
// picked IDs that genuinely show what we say they show.
//
// NOTE ON VERIFICATION: these IDs were chosen from commonly-referenced
// interior/real-estate stock photos. Do one visual pass after seeding and
// swap any ID below that doesn't match its label — that's a one-line change
// in IMAGE_SETS, nothing else in the file needs to move.
//
// Each property_type maps to a "style" bucket (studio / apartment / hostel),
// and each bucket holds several complete 4-photo SETS (exterior, interior,
// bedroom, kitchen) so that all four photos for one property look like they
// belong to the same real building. A property is assigned one full set,
// deterministically, based on a hash of its own seed string, so re-running
// the seed always reproduces identical image URLs.
// ---------------------------------------------------------------------------

function unsplash(id) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=800&q=80`;
}

// Complete, self-consistent 4-photo sets. Do not mix-and-match IDs across
// sets by hand — swap a whole set if one photo in it is wrong, so the
// exterior/interior/bedroom/kitchen still read as "the same place".
const IMAGE_SETS = {
  // Small single-room units: self-contain, single/shared rooms.
  studio: [
    {
      exterior: "photo-1570129477492-45c003edd2be",
      interior: "photo-1522708323590-d24dbb6b0267",
      bedroom: "photo-1522771739844-6a9f6d5f14af",
      kitchen: "photo-1600489000022-c2086d79f9d4",
    },
    {
      exterior: "photo-1568605114967-8130f3a36994",
      interior: "photo-1493809842364-78817add7ffb",
      bedroom: "photo-1505693416388-ac5ce068fe85",
      kitchen: "photo-1556909212-d5b604d0c90d",
    },
    {
      exterior: "photo-1512917774080-9991f1c4c750",
      interior: "photo-1493809842364-78817add7ffb",
      bedroom: "photo-1616594039964-ae9021a400a0",
      kitchen: "photo-1556911220-e15b29be8c8f",
    },
  ],
  // Larger multi-room units: flats, duplex rooms, room-and-parlour.
  apartment: [
    {
      exterior: "photo-1600585154340-be6161a56a0c",
      interior: "photo-1600607687939-ce8a6c25118c",
      bedroom: "photo-1631049307264-da0ec9d70304",
      kitchen: "photo-1600489000022-c2086d79f9d4",
    },
    {
      exterior: "photo-1613977257363-707ba9348227",
      interior: "photo-1600596542815-ffad4c1539a9",
      bedroom: "photo-1618221195710-dd6b41faaea6",
      kitchen: "photo-1600585154526-990dced4db0d",
    },
    {
      exterior: "photo-1600047509807-ba8f99d2cdde",
      interior: "photo-1560448204-e02f11c3d0e2",
      bedroom: "photo-1560185127-6ed189bf02f4",
      kitchen: "photo-1556912167-f556f1f39fdf",
    },
  ],
  // Shared hostel-style accommodation.
  hostel: [
    {
      exterior: "photo-1555854877-bab0e564b8d5",
      interior: "photo-1555854877-bab0e5643d33",
      bedroom: "photo-1540518614846-7eded433c457",
      kitchen: "photo-1556909212-d5b604d0c90d",
    },
    {
      exterior: "photo-1560448204-603b3fc33ddc",
      interior: "photo-1493663284031-b7e3aefcae8e",
      bedroom: "photo-1595526114035-0d45ed16cfbf",
      kitchen: "photo-1556911220-e15b29be8c8f",
    },
  ],
};

const STYLE_BY_PROPERTY_TYPE = {
  self_contain: "studio",
  shared_room: "studio",
  room_and_parlour: "apartment",
  flat: "apartment",
  duplex: "apartment",
  hostel: "hostel",
};

// Fixed order + labels. The frontend gallery MUST render in this order
// (exterior first / cover) and can use `label` to build accurate alt text.
const IMAGE_SLOTS = [
  { key: "exterior", label: "Exterior view" },
  { key: "interior", label: "Living area" },
  { key: "bedroom", label: "Bedroom" },
  { key: "kitchen", label: "Kitchen" },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Deterministically picks one complete image set for a property and returns
// the four rows ready to insert (in exterior -> interior -> bedroom ->
// kitchen order), each tagged with is_cover / sort_order / alt text.
function buildPropertyImages(propertyType, seed, title) {
  const style = STYLE_BY_PROPERTY_TYPE[propertyType] || "apartment";
  const pool = IMAGE_SETS[style];
  const set = pool[hashString(seed) % pool.length];

  return IMAGE_SLOTS.map((slot, i) => ({
    url: unsplash(set[slot.key]),
    is_cover: i === 0, // exterior is always the cover, always index 0
    sort_order: i,
    alt: `${slot.label} of ${title}`,
  }));
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding database...");
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // ---------------------------------------------------------------------
    // Universities
    // ---------------------------------------------------------------------
    const { rows: unis } = await client.query(
      `insert into universities (name, short_name, city, state)
       values
        ('Obafemi Awolowo University', 'OAU', 'Ile-Ife', 'Osun'),
        ('University of Ibadan', 'UI', 'Ibadan', 'Oyo'),
        ('University of Lagos', 'UNILAG', 'Lagos', 'Lagos')
       returning id, short_name`
    );
    const oau = unis.find((u) => u.short_name === "OAU");

    // ---------------------------------------------------------------------
    // Locations around OAU
    // ---------------------------------------------------------------------
    const locationSeed = [
      ["Road 1, Ede Road", "First stretch off Ede Road, closest to the main gate.", 0.8, 12],
      ["Damico", "Popular student axis with a dense cluster of self-contains.", 1.5, 20],
      ["Asherifa", "Quiet residential area favoured by postgraduates.", 2.2, 28],
      ["Sabo", "Busy commercial strip with shops, food and cyber cafes.", 1.8, 24],
      ["Mayfair", "Established estate with larger, pricier apartments.", 3.0, 35],
      ["Parakin", "Close to the Parakin gate, popular with 100-200 level students.", 1.1, 15],
      ["Lagere", "Further from campus but more affordable, shuttle-served.", 4.5, 50],
      ["Fajuyi", "Near Fajuyi park, mixed student and family housing.", 2.6, 30],
    ];
    const locationIds = {};
    for (const [name, description, distance, walk] of locationSeed) {
      const { rows } = await client.query(
        `insert into locations (university_id, name, description, distance_to_campus_km, walk_minutes)
         values ($1,$2,$3,$4,$5) returning id, name`,
        [oau.id, name, description, distance, walk]
      );
      locationIds[name] = rows[0].id;
    }

    // ---------------------------------------------------------------------
    // Facilities
    // ---------------------------------------------------------------------
    const facilityNames = [
      ["24-hour electricity", "zap"],
      ["Generator backup", "battery-charging"],
      ["Prepaid meter", "gauge"],
      ["Borehole water", "droplet"],
      ["Wi-Fi", "wifi"],
      ["POP ceiling", "layout-panel-top"],
      ["Tiled floor", "grid-3x3"],
      ["Fitted kitchen", "cooking-pot"],
      ["Wardrobe", "door-closed"],
      ["Reading table", "book-open"],
      ["Security gate", "shield"],
      ["Fenced compound", "fence"],
      ["CCTV", "camera"],
      ["Parking space", "car"],
      ["Air conditioning", "snowflake"],
      ["Ceiling fan", "fan"],
    ];
    const facilityIds = {};
    for (const [name, icon] of facilityNames) {
      const { rows } = await client.query(
        `insert into facilities (name, icon) values ($1,$2) returning id, name`,
        [name, icon]
      );
      facilityIds[name] = rows[0].id;
    }

    // ---------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------
    async function makeUser({ role, full_name, email, phone, university_id, is_verified, agency_name, bio }) {
      const { rows } = await client.query(
        `insert into users (role, full_name, email, phone, password_hash, university_id, is_verified, agency_name, bio)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
        [role, full_name, email, phone, hash, university_id || null, !!is_verified, agency_name || null, bio || null]
      );
      return rows[0].id;
    }

    const adminId = await makeUser({
      role: "admin",
      full_name: "Adaeze Okafor",
      email: "admin@abode.app",
      phone: "+2348030000001",
      is_verified: true,
      bio: "Platform administrator.",
    });

    const landlord1 = await makeUser({
      role: "landlord",
      full_name: "Chief Bayo Adeyemi",
      email: "bayo.landlord@abode.app",
      phone: "+2348030000002",
      is_verified: true,
      bio: "Property owner in Damico and Road 1 since 2011.",
    });

    const landlord2 = await makeUser({
      role: "landlord",
      full_name: "Mrs. Funke Ige",
      email: "funke.landlord@abode.app",
      phone: "+2348030000003",
      is_verified: false,
      bio: "Family-owned apartments around Mayfair.",
    });

    const agent1 = await makeUser({
      role: "agent",
      full_name: "Tunde Bakare",
      email: "tunde.agent@abode.app",
      phone: "+2348030000004",
      is_verified: true,
      agency_name: "Ife Homes Realty",
      bio: "Managing listings for multiple property owners around campus.",
    });

    const students = [];
    const studentSeed = [
      ["Chiamaka Nwosu", "chiamaka.student@abode.app"],
      ["Segun Fashola", "segun.student@abode.app"],
      ["Halima Yusuf", "halima.student@abode.app"],
      ["Emeka Umeh", "emeka.student@abode.app"],
      ["Blessing Etim", "blessing.student@abode.app"],
    ];
    for (const [full_name, email] of studentSeed) {
      const id = await makeUser({
        role: "student",
        full_name,
        email,
        phone: "+23480" + Math.floor(30000005 + Math.random() * 999),
        university_id: oau.id,
        is_verified: true,
      });
      students.push(id);
    }

    // ---------------------------------------------------------------------
    // Properties
    // ---------------------------------------------------------------------
    const propertySeed = [
      {
        owner: landlord1,
        location: "Road 1, Ede Road",
        title: "Self-Contain Apartment, Road 1 Ede Road",
        property_type: "self_contain",
        room_type: "Self-contain",
        price: 180000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 1,
        address: "12 Ede Road, opposite Sekan Bakery",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Prepaid meter", "Borehole water", "Security gate", "Tiled floor"],
        seed: "road1a",
        lat: 7.5232, lng: 4.5231,
      },
      {
        owner: landlord1,
        title: "Spacious Room & Parlour, Damico",
        location: "Damico",
        property_type: "room_and_parlour",
        room_type: "Room and parlour",
        price: 250000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 2,
        address: "5 Damico Close, near Mr. Biggs junction",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Generator backup", "Wi-Fi", "POP ceiling", "Wardrobe", "Fenced compound"],
        seed: "damicoa",
        lat: 7.5109, lng: 4.5297,
      },
      {
        owner: agent1,
        title: "Shared Room for Two, Sabo",
        location: "Sabo",
        property_type: "shared_room",
        room_type: "Shared room",
        price: 95000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 2,
        address: "Sabo market road, 3rd building from junction",
        status: "published",
        verified: false,
        facilities: ["Prepaid meter", "Reading table", "Ceiling fan"],
        seed: "saboa",
        lat: 7.5079, lng: 4.5178,
      },
      {
        owner: landlord2,
        title: "Modern 2-Bedroom Flat, Mayfair Estate",
        location: "Mayfair",
        property_type: "flat",
        room_type: "2-bedroom flat",
        price: 650000,
        period: "per_year",
        bedrooms: 2,
        bathrooms: 2,
        max_occupants: 3,
        address: "Block C, Mayfair Estate, off Ede Road",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Generator backup", "Wi-Fi", "CCTV", "Parking space", "Air conditioning", "Fitted kitchen"],
        seed: "mayfaira",
        lat: 7.5306, lng: 4.5259,
      },
      {
        owner: agent1,
        title: "Affordable Hostel Room, Parakin Gate",
        location: "Parakin",
        property_type: "hostel",
        room_type: "Hostel room (4 in a room)",
        price: 65000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 4,
        address: "Parakin hostel complex, gate 2",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Security gate", "Fenced compound"],
        seed: "parakina",
        lat: 7.5195, lng: 4.5340,
      },
      {
        owner: landlord2,
        title: "Cosy Self-Contain, Lagere",
        location: "Lagere",
        property_type: "self_contain",
        room_type: "Self-contain",
        price: 140000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 1,
        address: "14 Lagere Street, behind the shuttle park",
        status: "pending_review",
        verified: false,
        facilities: ["Prepaid meter", "Borehole water", "Ceiling fan"],
        seed: "lageera",
        lat: 7.4934, lng: 4.5601,
      },
      {
        owner: landlord1,
        title: "Executive Self-Contain, Asherifa",
        location: "Asherifa",
        property_type: "self_contain",
        room_type: "Self-contain",
        price: 220000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 1,
        address: "Asherifa close, near postgraduate lodge",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Wi-Fi", "POP ceiling", "Tiled floor", "Wardrobe", "Air conditioning"],
        seed: "asherifaa",
        lat: 7.5147, lng: 4.5088,
      },
      {
        owner: landlord2,
        title: "Duplex Room Space, Fajuyi",
        location: "Fajuyi",
        property_type: "duplex",
        room_type: "Room in duplex",
        price: 300000,
        period: "per_year",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 2,
        address: "Fajuyi park road, 2nd gate",
        status: "published",
        verified: false,
        facilities: ["Generator backup", "Parking space", "Fenced compound", "Reading table"],
        seed: "fajuyia",
        lat: 7.4988, lng: 4.5502,
      },
      {
        owner: agent1,
        title: "Budget Room, Damico Annex",
        location: "Damico",
        property_type: "shared_room",
        room_type: "Single room",
        price: 75000,
        period: "per_session",
        bedrooms: 1,
        bathrooms: 1,
        max_occupants: 1,
        address: "Damico annex, off the main close",
        status: "published",
        verified: false,
        facilities: ["Prepaid meter", "Ceiling fan"],
        seed: "damicob",
        lat: 7.5117, lng: 4.5302,
      },
      {
        owner: landlord1,
        title: "Twin-Room Apartment, Road 1",
        location: "Road 1, Ede Road",
        property_type: "flat",
        room_type: "2-bedroom flat",
        price: 480000,
        period: "per_year",
        bedrooms: 2,
        bathrooms: 1,
        max_occupants: 4,
        address: "Road 1 extension, close to the OAU shuttle stop",
        status: "published",
        verified: true,
        facilities: ["24-hour electricity", "Generator backup", "Security gate", "Fitted kitchen", "Wardrobe"],
        seed: "road1b",
        lat: 7.5241, lng: 4.5219,
      },
    ];

    const propertyIds = [];
    for (const p of propertySeed) {
      const slug =
        p.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 7);

      const { rows } = await client.query(
        `insert into properties
          (owner_id, university_id, location_id, title, slug, description, property_type, room_type,
           price_amount, price_period, bedrooms, bathrooms, max_occupants, address_line,
           distance_to_campus_km, status, is_verified, latitude, longitude)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         returning id`,
        [
          p.owner,
          oau.id,
          locationIds[p.location],
          p.title,
          slug,
          `${p.room_type} located in ${p.location}, a short distance from OAU campus. Well maintained and available for the next academic session. Come with your student ID for a smooth inspection.`,
          p.property_type,
          p.room_type,
          p.price,
          p.period,
          p.bedrooms,
          p.bathrooms,
          p.max_occupants,
          p.address,
          locationSeed.find((l) => l[0] === p.location)[3],
          p.status,
          p.verified,
          p.lat || null,
          p.lng || null,
        ]
      );
      const propertyId = rows[0].id;
      propertyIds.push({ id: propertyId, ...p });

      // Images: exactly 4 rows per property, always in
      // exterior -> interior -> bedroom -> kitchen order, exterior is cover.
      const images = buildPropertyImages(p.property_type, p.seed, p.title);
      for (const image of images) {
        await client.query(
          `insert into property_images (property_id, url, is_cover, sort_order, alt)
           values ($1,$2,$3,$4,$5)`,
          [propertyId, image.url, image.is_cover, image.sort_order, image.alt]
        );
      }

      // facilities
      for (const fname of p.facilities) {
        await client.query(
          `insert into property_facilities (property_id, facility_id) values ($1,$2)
           on conflict do nothing`,
          [propertyId, facilityIds[fname]]
        );
      }
    }

    // ---------------------------------------------------------------------
    // Reviews
    // ---------------------------------------------------------------------
    const published = propertyIds.filter((p) => p.status === "published");
    const reviewTexts = [
      [5, "Landlord is responsive and the light situation is very good. Recommend."],
      [4, "Nice room but a bit far from the faculty of science. Water runs fine."],
      [3, "Decent for the price, could use better security lighting at night."],
      [5, "Best self-contain I toured all semester. Worth the price."],
      [2, "Had issues with the agent following up after payment."],
    ];
    for (let i = 0; i < published.length && i < students.length; i++) {
      const [rating, comment] = reviewTexts[i % reviewTexts.length];
      await client.query(
        `insert into reviews (property_id, user_id, rating, comment) values ($1,$2,$3,$4)
         on conflict do nothing`,
        [published[i].id, students[i % students.length], rating, comment]
      );
    }

    // ---------------------------------------------------------------------
    // Favourites & comparison items
    // ---------------------------------------------------------------------
    await client.query(
      `insert into favourites (user_id, property_id) values ($1,$2),($1,$3),($4,$5)
       on conflict do nothing`,
      [students[0], published[0].id, published[1].id, students[1], published[2].id]
    );

    await client.query(
      `insert into comparison_items (user_id, property_id) values ($1,$2),($1,$3),($1,$4)
       on conflict do nothing`,
      [students[0], published[0].id, published[1].id, published[3].id]
    );

    // ---------------------------------------------------------------------
    // Inspection requests
    // ---------------------------------------------------------------------
    await client.query(
      `insert into inspection_requests (property_id, student_id, owner_id, preferred_date, preferred_time, message, status)
       values
        ($1,$2,$3, current_date + interval '3 day', 'Afternoon', 'Can I come with a friend to inspect?', 'pending'),
        ($4,$5,$6, current_date + interval '5 day', 'Morning', 'Available this Saturday morning?', 'confirmed')`,
      [
        published[0].id, students[0], published[0].owner,
        published[3].id, students[2], published[3].owner,
      ]
    );

    // ---------------------------------------------------------------------
    // Reports
    // ---------------------------------------------------------------------
    await client.query(
      `insert into reports (property_id, reported_by, reason, details, status)
       values ($1,$2,'inaccurate','Photos do not match what I saw during inspection.','open')`,
      [published[2].id, students[1]]
    );

    // ---------------------------------------------------------------------
    // Conversations & messages
    // ---------------------------------------------------------------------
    const { rows: convoRows } = await client.query(
      `insert into conversations (property_id, student_id, owner_id, last_message_at)
       values ($1,$2,$3, now()) returning id`,
      [published[0].id, students[0], published[0].owner]
    );
    const conversationId = convoRows[0].id;
    await client.query(
      `insert into messages (conversation_id, sender_id, body, created_at) values
        ($1,$2,'Good day sir, is this apartment still available for the new session?', now() - interval '2 hour'),
        ($1,$3,'Yes it is, you are welcome to schedule an inspection.', now() - interval '1 hour 40 minute'),
        ($1,$2,'Great, I have sent an inspection request for Saturday.', now() - interval '1 hour')`,
      [conversationId, students[0], published[0].owner]
    );

    console.log("Seed complete.");
    console.log("Demo login password for every seeded user:", DEMO_PASSWORD);
    console.log("Admin:", "admin@abode.app");
    console.log("Landlord:", "bayo.landlord@abode.app");
    console.log("Agent:", "tunde.agent@abode.app");
    console.log("Student:", "chiamaka.student@abode.app");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});