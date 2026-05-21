import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import BlogPost from '../src/models/BlogPost.js';

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const posts = await BlogPost.find().select('title status createdAt').sort({ createdAt: -1 });

    console.log(`Total posts: ${posts.length}\n`);

    posts.forEach(p => {
      console.log(`- ${p.title}`);
      console.log(`  Status: ${p.status} | Fecha: ${p.createdAt.toISOString().split('T')[0]}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPosts();
