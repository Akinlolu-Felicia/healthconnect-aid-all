import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Plus, 
  Heart, 
  HeartHandshake,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_id: string;
  author_name?: string;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

const CommunityForum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: ForumComment[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: ""
  });

  const categories = [
    { id: "general", name: "General Health", color: "bg-blue-100 text-blue-800" },
    { id: "mental-health", name: "Mental Health", color: "bg-green-100 text-green-800" },
    { id: "chronic-conditions", name: "Chronic Conditions", color: "bg-purple-100 text-purple-800" },
    { id: "nutrition", name: "Nutrition & Diet", color: "bg-orange-100 text-orange-800" },
    { id: "fitness", name: "Fitness & Exercise", color: "bg-red-100 text-red-800" },
    { id: "pregnancy", name: "Pregnancy & Parenting", color: "bg-pink-100 text-pink-800" },
    { id: "support", name: "Support & Encouragement", color: "bg-yellow-100 text-yellow-800" }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithAuthors = data?.map(post => ({
        ...post,
        author_name: "Anonymous"
      })) || [];

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentsWithAuthors = data?.map(comment => ({
        ...comment,
        author_name: "Anonymous"
      })) || [];

      setComments(prev => ({
        ...prev,
        [postId]: commentsWithAuthors
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title || !newPost.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tags = newPost.tags ? newPost.tags.split(",").map(tag => tag.trim()) : [];
      
      const { error } = await supabase
        .from("forum_posts")
        .insert({
          user_id: user.id,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags
        });

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your post has been shared with the community."
      });

      setNewPost({
        title: "",
        content: "",
        category: "general",
        tags: ""
      });
      setShowNewPost(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive"
      });
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from("forum_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment
        });

      if (error) throw error;

      setNewComment("");
      fetchComments(postId);
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted."
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive"
      });
    }
  };

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || "bg-gray-100 text-gray-800";
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Community Health Forum</h2>
        <p>Please sign in to participate in the community discussions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Community Health Forum</h1>
        <p className="text-muted-foreground">Connect, share experiences, and support each other</p>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">All Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {loading ? (
            <p>Loading posts...</p>
          ) : (
            <>
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {post.author_name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at))} ago
                          </p>
                        </div>
                      </div>
                      <Badge className={getCategoryStyle(post.category)}>
                        {categories.find(c => c.id === post.category)?.name || post.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4">{post.content}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.upvotes || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            fetchComments(post.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comments
                        </Button>
                      </div>
                    </div>

                    {selectedPost?.id === post.id && (
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-medium mb-4">Comments</h4>
                        
                        <div className="space-y-3 mb-4">
                          {comments[post.id]?.map((comment) => (
                            <div key={comment.id} className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {comment.author_name?.charAt(0) || "A"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{comment.author_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.created_at))} ago
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addComment(post.id)}
                          />
                          <Button 
                            onClick={() => addComment(post.id)}
                            variant="medical"
                            size="sm"
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${category.color.split(' ')[0]}`} />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {posts.filter(p => p.category === category.id).length} posts
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's your question or topic?"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, experience, or question..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="diabetes, exercise, mental health (separate with commas)"
                />
              </div>

              <Button onClick={createPost} variant="medical" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityForum;