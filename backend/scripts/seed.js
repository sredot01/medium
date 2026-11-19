const { initializeDatabase } = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  // Initialize database first
  await initializeDatabase();

  try {
    // Create sample users
    console.log('\n👤 Creating users...');
    const users = [];
    
    const usersData = [
      {
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
        bio: 'Full-stack developer and tech enthusiast',
      },
      {
        email: 'sarah@example.com',
        password: 'password123',
        name: 'Sarah Johnson',
        bio: 'Frontend developer specializing in React and modern web technologies',
      },
      {
        email: 'mike@example.com',
        password: 'password123',
        name: 'Mike Chen',
        bio: 'DevOps engineer passionate about containerization and cloud technologies',
      },
      {
        email: 'emma@example.com',
        password: 'password123',
        name: 'Emma Wilson',
        bio: 'UX/UI designer and frontend developer',
      },
    ];

    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create sample posts
    console.log('\n📝 Creating posts...');
    const posts = [];
    
    const postsData = [
      {
        title: 'Getting Started with Next.js and TypeScript',
        content: `<h2>Introduction to Next.js</h2><p>Next.js has become one of the most popular React frameworks for building modern web applications. Combined with TypeScript, it provides a powerful foundation for creating type-safe, performant applications.</p><h3>Why Choose Next.js?</h3><p>Next.js offers several compelling features that make it stand out:</p><ul><li>Server-side rendering (SSR) out of the box</li><li>Static site generation (SSG) capabilities</li><li>API routes for backend functionality</li><li>Excellent developer experience</li><li>Automatic code splitting</li></ul><h3>Setting Up Your First Project</h3><p>Getting started with Next.js and TypeScript is straightforward. Here's how to create a new project:</p><pre>npx create-next-app@latest my-app --typescript</pre><p>This command creates a new Next.js project with TypeScript configured and ready to go.</p><h3>Conclusion</h3><p>Next.js and TypeScript together provide a robust solution for building modern web applications. The combination offers type safety, excellent performance, and an outstanding developer experience.</p>`,
        excerpt: 'Learn how to get started with Next.js and TypeScript to build modern, type-safe web applications.',
        author: users[0].name,
        userId: users[0].id,
        tags: ['Next.js', 'TypeScript', 'React', 'Web Development'],
        category: 'Web Development',
        coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23667eea" width="800" height="600"/%3E%3Ctext fill="white" font-size="48" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENext.js %26 TypeScript%3C/text%3E%3C/svg%3E',
      },
      {
        title: 'Mastering Tailwind CSS: A Modern Approach to Styling',
        content: `<h2>What is Tailwind CSS?</h2><p>Tailwind CSS is a utility-first CSS framework that has revolutionized how developers approach styling web applications. Instead of writing custom CSS, you compose styles directly in your HTML using utility classes.</p><h3>Why Developers Love Tailwind</h3><ul><li><strong>Rapid development</strong> - Build UIs faster with pre-built utility classes</li><li><strong>Consistent design system</strong> - Built-in design tokens ensure consistency</li><li><strong>No naming conflicts</strong> - No need to invent class names</li><li><strong>Smaller bundle sizes</strong> - Purge unused styles in production</li><li><strong>Highly customizable</strong> - Configure every aspect to match your design</li></ul><h3>Getting Started</h3><p>Installing Tailwind CSS is straightforward. Here's a quick setup guide:</p><pre>npm install tailwindcss</pre><p>Then create a configuration file and start using utility classes in your HTML.</p><h3>Best Practices</h3><p>When working with Tailwind, consider creating reusable components to avoid repetition and maintain consistency across your application.</p>`,
        excerpt: 'Discover why Tailwind CSS has become the go-to styling solution for modern web applications.',
        author: users[1].name,
        userId: users[1].id,
        tags: ['Tailwind CSS', 'CSS', 'Frontend', 'Web Design'],
        category: 'Frontend Development',
        coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2338bdf8" width="800" height="600"/%3E%3Ctext fill="white" font-size="48" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ETailwind CSS%3C/text%3E%3C/svg%3E',
      },
      {
        title: 'Introduction to Docker and Containerization',
        content: `<h2>Understanding Containerization</h2><p>Docker has transformed how we develop, ship, and run applications. Containerization provides a consistent environment across different stages of development and deployment, solving the infamous "it works on my machine" problem.</p><h3>Key Benefits</h3><ul><li><strong>Consistency</strong> - Same environment from development to production</li><li><strong>Isolation</strong> - Each container runs independently with its own dependencies</li><li><strong>Portability</strong> - Run anywhere Docker is installed</li><li><strong>Efficiency</strong> - Share the host OS kernel, lightweight compared to VMs</li><li><strong>Scalability</strong> - Easily scale applications horizontally</li></ul><h3>Docker Basics</h3><p>A Docker image is a lightweight, standalone package that includes everything needed to run a piece of software. Containers are runtime instances of images.</p><h3>Getting Started</h3><p>Start by creating a Dockerfile that defines your application environment, then build and run your container.</p><pre>docker build -t myapp .\ndocker run -p 3000:3000 myapp</pre>`,
        excerpt: 'Learn the fundamentals of Docker and containerization for modern development workflows.',
        author: users[2].name,
        userId: users[2].id,
        tags: ['Docker', 'DevOps', 'Containers', 'Infrastructure'],
        category: 'DevOps',
        coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%232563eb" width="800" height="600"/%3E%3Ctext fill="white" font-size="48" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EDocker Containers%3C/text%3E%3C/svg%3E',
      },
      {
        title: 'Building RESTful APIs with Node.js and Express',
        content: `<h2>REST API Design Principles</h2><p>RESTful APIs are the backbone of modern web applications. Node.js and Express provide a powerful, flexible platform for building scalable APIs.</p><h3>Core Concepts</h3><ul><li><strong>Resources</strong> - Everything is a resource with a unique identifier</li><li><strong>HTTP Methods</strong> - GET, POST, PUT, DELETE for CRUD operations</li><li><strong>Stateless</strong> - Each request contains all necessary information</li><li><strong>JSON</strong> - Standard data format for requests and responses</li></ul><h3>Express Middleware</h3><p>Middleware functions are the heart of Express applications. They have access to the request and response objects and can modify them or end the request-response cycle.</p><h3>Best Practices</h3><p>Always validate input, handle errors properly, use appropriate HTTP status codes, and implement authentication and authorization.</p>`,
        excerpt: 'A comprehensive guide to building robust RESTful APIs using Node.js and Express framework.',
        author: users[0].name,
        userId: users[0].id,
        tags: ['Node.js', 'Express', 'API', 'Backend'],
        category: 'Backend Development',
        coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2310b981" width="800" height="600"/%3E%3Ctext fill="white" font-size="48" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENode.js API%3C/text%3E%3C/svg%3E',
      },
      {
        title: 'Modern UI/UX Design Principles for Web Applications',
        content: `<h2>The Foundation of Good Design</h2><p>Great user interfaces aren't just about aesthetics—they're about creating intuitive, accessible experiences that users love.</p><h3>Key Principles</h3><ul><li><strong>Simplicity</strong> - Remove unnecessary complexity</li><li><strong>Consistency</strong> - Maintain patterns throughout your application</li><li><strong>Feedback</strong> - Always inform users of their actions</li><li><strong>Accessibility</strong> - Design for everyone, including users with disabilities</li><li><strong>Performance</strong> - Fast, responsive interfaces keep users engaged</li></ul><h3>Color and Typography</h3><p>Choose colors that reflect your brand while ensuring good contrast. Typography should be readable and establish clear visual hierarchy.</p><h3>Responsive Design</h3><p>Your application should work seamlessly across all devices and screen sizes.</p>`,
        excerpt: 'Essential UI/UX design principles every web developer should know to create exceptional user experiences.',
        author: users[3].name,
        userId: users[3].id,
        tags: ['UI/UX', 'Design', 'Web Design', 'User Experience'],
        category: 'Design',
        coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f59e0b" width="800" height="600"/%3E%3Ctext fill="white" font-size="48" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EUI/UX Design%3C/text%3E%3C/svg%3E',
      },
    ];

    for (const postData of postsData) {
      const post = Post.create(postData);
      posts.push(post);
      console.log(`✅ Created post: ${post.title}`);
    }

    // Create some likes
    console.log('\n❤️  Creating likes...');
    try {
      Like.create(users[1].id, posts[0].id); // Sarah likes John's Next.js post
      Like.create(users[2].id, posts[0].id); // Mike likes John's Next.js post
      Like.create(users[3].id, posts[0].id); // Emma likes John's Next.js post
      Like.create(users[0].id, posts[1].id); // John likes Sarah's Tailwind post
      Like.create(users[2].id, posts[1].id); // Mike likes Sarah's Tailwind post
      Like.create(users[0].id, posts[2].id); // John likes Mike's Docker post
      Like.create(users[1].id, posts[2].id); // Sarah likes Mike's Docker post
      console.log('✅ Created 7 likes');
    } catch (error) {
      console.log('✅ Likes already exist or partially created');
    }

    // Create some comments
    console.log('\n💬 Creating comments...');
    Comment.create({
      userId: users[1].id,
      postId: posts[0].id,
      content: 'Great introduction to Next.js! Really helpful for beginners.',
    });
    Comment.create({
      userId: users[2].id,
      postId: posts[0].id,
      content: 'I\'ve been using Next.js for a while now and it\'s amazing. TypeScript integration is seamless!',
    });
    Comment.create({
      userId: users[0].id,
      postId: posts[1].id,
      content: 'Tailwind has completely changed how I approach styling. Great article!',
    });
    Comment.create({
      userId: users[3].id,
      postId: posts[2].id,
      content: 'Docker is a game-changer for development workflows. Thanks for the clear explanation!',
    });
    console.log('✅ Created comments');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Likes: 7`);
    console.log(`   Comments: 4`);
    console.log('\n🔑 Test Accounts (password: password123):');
    users.forEach(user => {
      console.log(`   ${user.email} - ${user.name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
