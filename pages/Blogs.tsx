
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Tag, User } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { BlogPost } from '../types';
import { getBlogPosts } from '../utils/storage';
import SEO from '../components/SEO';
import { COMPANY_NAME } from '../constants';

interface BlogsProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  activeArticleId?: string | null;
}

const Blogs: React.FC<BlogsProps> = ({ onNavigate, activeArticleId }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Load posts and handle deep linking
  useEffect(() => {
    // Fix: getBlogPosts is async and returns a Promise, so we must await it within an async wrapper
    const loadPosts = async () => {
      const loadedPosts = await getBlogPosts();
      setPosts(loadedPosts);

      if (activeArticleId) {
        const found = loadedPosts.find(p => p.id === activeArticleId);
        if (found) {
          setSelectedPost(found);
        }
      } else {
        setSelectedPost(null);
      }
    };
    loadPosts();
  }, [activeArticleId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPost]);

  const handleReadPost = (post: BlogPost) => {
    // Navigate updates the URL so sharing works
    onNavigate('blogs', { article: post.id });
    trackEvent('read_article', { 
      article_id: post.id, 
      article_title: post.title 
    });
  };

  const handleBack = () => {
    onNavigate('blogs'); // Clear params
  };

  // --- ARTICLE VIEW ---
  if (selectedPost) {
    // Construct Structured Data for Article (JSON-LD)
    // This helps Google and LLMs cite this specific article
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedPost.title,
      "image": selectedPost.image,
      "author": {
        "@type": "Person",
        "name": selectedPost.author
      },
      "publisher": {
        "@type": "Organization",
        "name": COMPANY_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": "https://worldwide-shades.com/logo.png" // Placeholder
        }
      },
      "datePublished": selectedPost.date, // Ideally ISO format
      "description": selectedPost.excerpt,
      "articleBody": typeof selectedPost.content === 'string' ? selectedPost.content : "Full article content...",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://worldwide-shades.com/?page=blogs&article=${selectedPost.id}`
      }
    };

    return (
      <div className="bg-white min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SEO 
          title={selectedPost.title}
          description={selectedPost.excerpt}
          image={selectedPost.image}
          type="article"
          schema={articleSchema}
        />

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
           <div className="h-full bg-indigo-600 w-full animate-[progress_2s_ease-out_forwards] origin-left scale-x-0" style={{ animationTimeline: 'scroll()' }} />
        </div>

        {/* Hero Image */}
        <div className="relative h-[50vh] w-full overflow-hidden">
           <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
           <div className="absolute top-6 left-6">
              <button 
                onClick={handleBack}
                className="bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 px-4 py-2 rounded-full flex items-center gap-2 transition-all text-sm font-bold"
              >
                <ArrowLeft size={16} /> Back to Magazine
              </button>
           </div>
           <div className="absolute bottom-0 left-0 w-full max-w-4xl mx-auto p-6 md:p-12">
              <div className="flex gap-3 mb-4 text-white/80 text-sm font-bold uppercase tracking-wider">
                 <span className="bg-indigo-600 text-white px-2 py-0.5 rounded">{selectedPost.category}</span>
                 <span className="flex items-center gap-1"><Clock size={14} /> {selectedPost.readTime}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight shadow-sm">{selectedPost.title}</h1>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Main Content */}
           <article className="lg:col-span-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                       {selectedPost.author.charAt(0)}
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-900">{selectedPost.author}</div>
                       <div className="text-xs text-slate-500">{selectedPost.date}</div>
                    </div>
                 </div>
                 <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
                    <Share2 size={20} />
                 </button>
              </div>
              
              <div className="prose prose-lg prose-indigo max-w-none text-slate-600 whitespace-pre-wrap">
                 {typeof selectedPost.content === 'string' ? selectedPost.content : selectedPost.content}
              </div>

              <div className="mt-12 pt-12 border-t border-gray-200">
                 <h3 className="text-xl font-bold text-slate-900 mb-6">More to Explore</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {posts.filter(p => p.id !== selectedPost.id).slice(0, 2).map(post => (
                       <div key={post.id} className="group cursor-pointer" onClick={() => handleReadPost(post)}>
                          <div className="h-48 rounded-xl overflow-hidden mb-3">
                             <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{post.title}</h4>
                       </div>
                    ))}
                 </div>
              </div>
           </article>

           {/* Sidebar */}
           <aside className="lg:col-span-4 space-y-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-24">
                 <h4 className="font-bold text-slate-900 mb-4">Shop This Look</h4>
                 <div className="mb-6 h-48 bg-white rounded-lg overflow-hidden border border-gray-200 relative group">
                    <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336048/fabrics/ecoweave-3p-light-filtering-shades-oak.jpg" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-white font-bold border border-white px-4 py-2 rounded-full">View Fabric</span>
                    </div>
                 </div>
                 <h5 className="font-bold text-slate-800">EcoWeave Collection</h5>
                 <p className="text-sm text-slate-500 mb-4">The exact texture featured in this article.</p>
                 <button 
                   onClick={() => onNavigate('builder')}
                   className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                 >
                   Start Customizing <ArrowRight size={16} />
                 </button>
              </div>

              <div className="bg-indigo-600 text-white p-6 rounded-xl text-center">
                 <h4 className="font-bold text-xl mb-2">Get 10% Off</h4>
                 <p className="text-indigo-100 text-sm mb-4">Sign up for our newsletter and get exclusive design tips and discounts.</p>
                 <input type="email" placeholder="Enter your email" className="w-full p-2 rounded text-slate-900 text-sm mb-2 focus:outline-none" />
                 <button className="w-full bg-white text-indigo-600 font-bold py-2 rounded hover:bg-indigo-50 transition-colors">Subscribe</button>
              </div>
           </aside>
        </div>
      </div>
    );
  }

  // --- FEED VIEW ---
  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Interior Design Magazine"
        description="Trends, guides, and inspiration for modern window treatments and interior design."
        type="website"
      />

      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
         <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">The Shade Journal</h1>
         <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Insights on interior design, window treatment technology, and creating the perfect home atmosphere.
         </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 -mt-10">
         {/* Featured Post */}
         {posts.length > 0 && (
            <div 
                onClick={() => handleReadPost(posts[0])}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 cursor-pointer group grid grid-cols-1 lg:grid-cols-2 mb-12 transform hover:-translate-y-1 transition-all duration-300"
            >
                <div className="h-[400px] lg:h-auto overflow-hidden relative">
                <img src={posts[0].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white text-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                    Featured
                </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                    {posts[0].category}
                    <span className="text-slate-300">•</span>
                    {posts[0].readTime}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {posts[0].title}
                </h2>
                <p className="text-slate-600 text-lg mb-6 line-clamp-3">
                    {posts[0].excerpt}
                </p>
                <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        {posts[0].author.charAt(0)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">Read Article</div>
                    <ArrowRight size={16} className="text-indigo-600 group-hover:translate-x-2 transition-transform" />
                </div>
                </div>
            </div>
         )}

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map(post => (
               <div 
                  key={post.id} 
                  onClick={() => handleReadPost(post)}
                  className="group cursor-pointer flex flex-col h-full"
               >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                     <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded text-slate-800">
                        {post.category}
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                     <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Calendar size={12} /> {post.date}
                        <span>•</span>
                        <Clock size={12} /> {post.readTime}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {post.title}
                     </h3>
                     <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                     </p>
                     <span className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:underline">
                        Read Now <ArrowRight size={14} />
                     </span>
                  </div>
               </div>
            ))}
         </div>
         
         {posts.length === 0 && (
             <div className="text-center py-20 text-slate-400">
                 <p>No articles found. Check back soon!</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default Blogs;
