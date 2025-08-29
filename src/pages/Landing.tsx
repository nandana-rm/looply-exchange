import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gift, ArrowUpDown, DollarSign, ShoppingBag, 
  Heart, Users, MapPin, Zap, CheckCircle,
  Play, Star, ArrowRight, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Landing = () => {
  const features = [
    {
      icon: Gift,
      title: "Gift & Donate",
      description: "Share items you no longer need with those who will treasure them",
      color: "text-primary"
    },
    {
      icon: ArrowUpDown,
      title: "Barter & Exchange", 
      description: "Trade items directly without money - find exactly what you need",
      color: "text-accent"
    },
    {
      icon: DollarSign,
      title: "Sell & Buy",
      description: "Classic marketplace for buying and selling at great prices",
      color: "text-destructive"
    },
    {
      icon: Users,
      title: "NGO Support",
      description: "Connect with NGOs to claim donations for worthy causes",
      color: "text-primary-glow"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Items Exchanged" },
    { number: "200+", label: "NGO Partners" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Community Member",
      content: "Found amazing vintage furniture through bartering. Love the sustainable approach!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Green Earth NGO",
      role: "Non-Profit Organization",
      content: "Looply helped us collect thousands of books for our literacy program.",
      avatar: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=60&h=60&fit=crop"
    },
    {
      name: "Mike Chen",
      role: "Regular User",
      content: "Sold my old electronics and found great deals. The community is amazing!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-primary text-primary-foreground">
              🎉 Join the Sustainable Marketplace Revolution
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Gift • Barter • Sell • Buy
              <span className="block text-primary mt-2">
                All in One Platform
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with your community to exchange items sustainably. 
              From gifting to NGO donations, discover a new way to share resources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  Browse Items
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Four Ways to Connect
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you want to give, trade, sell, or buy - we've got you covered
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-elevated transition-shadow cursor-pointer group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-background flex items-center justify-center group-hover:scale-110 transition-transform ${feature.color}`}>
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in just three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "List Your Items",
                description: "Upload photos and describe items you want to gift, barter, or sell",
                icon: Gift
              },
              {
                step: 2, 
                title: "Connect & Match",
                description: "Browse, swipe, and connect with others in your community",
                icon: Heart
              },
              {
                step: 3,
                title: "Exchange Safely",
                description: "Meet in safe locations or coordinate delivery for seamless exchanges",
                icon: CheckCircle
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="p-8 text-center h-full">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                    <step.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by Our Community
            </h2>
            <div className="flex justify-center mb-4">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-500 fill-current" />
              ))}
            </div>
            <p className="text-muted-foreground">Trusted by thousands of users worldwide</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Join Looply?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Start sharing, trading, and connecting with your community today. 
              It's free to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-card text-card-foreground hover:bg-card/90">
                  <Zap className="mr-2 h-5 w-5" />
                  Join Now - It's Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;