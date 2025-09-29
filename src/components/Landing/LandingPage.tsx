import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Play, ArrowRight, Heart, Users, BarChart3, MessageCircle, Star, CheckCircle, Globe, Lightbulb, Shield, Smartphone } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'story', 'solution', 'features', 'how-it-works', 'team', 'testimonials'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Heart,
      title: "AI Behavior Coach",
      description: "Log a behavior. Lumi explains what's happening and gives clear, doable strategies. Your behavior coach in the moment.",
      color: "text-[#C44E38]",
      bgColor: "bg-[#C44E38] bg-opacity-10"
    },
    {
      icon: Users,
      title: "Teacher Well-Being",
      description: "Quick check-ins. Reflection prompts. Encouragement to keep you steady.",
      color: "text-[#E88B6F]",
      bgColor: "bg-[#E88B6F] bg-opacity-10"
    },
    {
      icon: MessageCircle,
      title: "Family Communication",
      description: "Multilingual, strengths-based reports. Scripts for tough talks.",
      color: "text-[#B2C6E5]",
      bgColor: "bg-[#B2C6E5] bg-opacity-10"
    },
    {
      icon: BarChart3,
      title: "Child and Classroom Profiles",
      description: "See what's working—for one child, a whole group, or across common challenges.",
      color: "text-[#C3D4B7]",
      bgColor: "bg-[#C3D4B7] bg-opacity-10"
    }
  ];

  const testimonials = [
    {
      quote: "I wish I knew why he's doing this. I feel like I'm just guessing.",
      role: "Preschool Teacher",
      type: "without"
    },
    {
      quote: "I don't have time to write long notes. I need support I can use in the moment.",
      role: "Infant/Toddler Teacher",
      type: "without"
    },
    {
      quote: "When I talk to families, I want to sound compassionate, not judgmental—but I don't always know what to say.",
      role: "Transitional Kindergarten Teacher",
      type: "without"
    },
    {
      quote: "Lumi helped me understand that what looked like defiance was actually a child asking for connection. The strategies work because they address the real need.",
      role: "Head Start Teacher",
      type: "with"
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Clinical Director & Co-Founder",
      bio: "Infant & Early Childhood Mental Health specialist with 15+ years supporting educators and families.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Marcus Rodriguez",
      role: "Technology Director & Co-Founder", 
      bio: "Former classroom teacher turned AI engineer, passionate about human-centered technology in education.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E6E2DD] shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#C44E38] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">Lumi</span>
              <span className="text-sm text-[#615E59]">Classroom Behavior Coach™</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('story')}
                className="text-[#615E59] hover:text-[#1A1A1A] transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-[#615E59] hover:text-[#1A1A1A] transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-[#615E59] hover:text-[#1A1A1A] transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('team')}
                className="text-[#615E59] hover:text-[#1A1A1A] transition-colors"
              >
                Team
              </button>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setCurrentView('signin')}
                  variant="ghost"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setCurrentView('welcome')}
                  size="sm"
                >
                  Get Started
                </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1A1A1A]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1A1A1A]" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#E6E2DD] py-4">
              <nav className="space-y-4">
                <button 
                  onClick={() => scrollToSection('story')}
                  className="block w-full text-left text-[#615E59] hover:text-[#1A1A1A] transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left text-[#615E59] hover:text-[#1A1A1A] transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left text-[#615E59] hover:text-[#1A1A1A] transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('team')}
                  className="block w-full text-left text-[#615E59] hover:text-[#1A1A1A] transition-colors"
                >
                  Team
                </button>
                <div className="pt-4 border-t border-[#E6E2DD] space-y-2">
                  <Button
                    onClick={() => setCurrentView('signin')}
                    variant="ghost"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setCurrentView('welcome')}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#1A1A1A] mb-6 leading-tight">
                Classroom Behavior,<br />
                <span className="text-[#C44E38]">Decoded.</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#615E59] mb-4 font-medium">
                Teaching Is Human. So Is Lumi.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200 max-w-4xl mx-auto">
              <p className="text-lg text-[#615E59] mb-8 leading-relaxed">
                Lumi™ is your real-time classroom coach. Lumi combines AI insight with developmental science to deliver classroom behavior support, strengthen teacher wellbeing, and improve family communication. With Lumi, educators understand the "why," respond with strategies that work, and bring clarity, confidence, and care back into teaching.
              </p>
              
              <div className="bg-[#F8F6F4] rounded-2xl p-6 mb-8 border border-[#E6E2DD]">
                <p className="text-[#C44E38] font-semibold text-lg">
                  Real-time strategies. Real classroom relief.
                </p>
              </div>
            </div>

            <div className="animate-fade-in-up animation-delay-400 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                onClick={() => setCurrentView('welcome')}
                size="lg"
                className="px-12 py-4 text-lg"
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started
              </Button>
              <Button
                onClick={() => setCurrentView('signin')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Geometric Accent */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#F7D56F] bg-opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-[#E88B6F] bg-opacity-20 rounded-full blur-2xl"></div>
      </section>

      {/* Visual Break */}
      <section className="py-16 bg-[#F8F6F4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="w-16 h-16 bg-[#C44E38] bg-opacity-10 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#C44E38]" />
            </div>
            <div className="w-16 h-16 bg-[#E88B6F] bg-opacity-10 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-[#E88B6F]" />
            </div>
            <div className="w-16 h-16 bg-[#B2C6E5] bg-opacity-10 rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-[#B2C6E5]" />
            </div>
            <div className="w-16 h-16 bg-[#C3D4B7] bg-opacity-10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-[#C3D4B7]" />
            </div>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section id="story" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
                The Story Educators Know Too Well
              </h2>
              
              <div className="space-y-6 text-lg text-[#615E59] leading-relaxed">
                <p className="italic">
                  The child is screaming and hitting again.<br />
                  You stay calm on the outside—but inside, your mind is racing.
                </p>
                
                <div className="bg-[#F8F6F4] rounded-2xl p-6 border border-[#E6E2DD]">
                  <div className="space-y-2 text-[#1A1A1A]">
                    <p>What do I try next?</p>
                    <p>Will this work?</p>
                    <p>Will I be supported—or blamed?</p>
                  </div>
                </div>
                
                <p>
                  You care deeply. You show up every day.<br />
                  But too often, you're running on instincts, not insight.
                </p>
                
                <p className="font-semibold text-[#C44E38]">
                  And in those moments—when a child's needs feel bigger than your tools—it's easy to feel alone.
                </p>
              </div>
            </div>
            
            <div className="animate-fade-in-right">
              <Card className="p-8 bg-gradient-to-br from-[#F8F6F4] to-white border-[#E6E2DD]">
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  What Teachers Say Without Lumi
                </h3>
                <div className="space-y-6">
                  {testimonials.filter(t => t.type === 'without').map((testimonial, index) => (
                    <blockquote key={index} className="border-l-4 border-[#C44E38] pl-4">
                      <p className="text-[#615E59] italic mb-2">
                        "{testimonial.quote}"
                      </p>
                      <cite className="text-sm text-[#C44E38] font-medium">
                        — {testimonial.role}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-[#F8F6F4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              The Moment Lumi Steps In
            </h2>
            <p className="text-xl text-[#615E59] mb-8">
              That's where Lumi comes in.
            </p>
            <p className="text-2xl font-bold text-[#C44E38] mb-8">
              Lumi is not just another app.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <div className="space-y-6 text-lg text-[#615E59] leading-relaxed">
                <p>
                  It's a real-time support and insight platform, built for the people who care for children in their most tender, challenging, and defining moments.
                </p>
                
                <p>
                  You can log behaviors by voice or text—whatever's fastest in the moment.
                </p>
                
                <p>
                  And because Lumi works on tablet, mobile phone, or computer, it's there for you wherever you teach and however you move.
                </p>
                
                <div className="bg-white rounded-2xl p-6 border border-[#E6E2DD] shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-[#1A1A1A]">
                    <p>It's your calm in the chaos.</p>
                    <p>Your strategy coach.</p>
                    <p>Your emotional mirror.</p>
                    <p>Your bridge between classrooms, families, and systems.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in-right">
              <Card className="p-8 bg-gradient-to-br from-[#C44E38] bg-opacity-5 to-white border-[#C44E38] border-opacity-20">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#C44E38] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#C44E38] mb-4">
                    Lumi makes classroom life clearer, calmer, and caring.
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-[#615E59]">
                    <Smartphone className="w-5 h-5" />
                    <span>Available on all devices</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              What You Can Do With Lumi
            </h2>
            <p className="text-xl text-[#615E59] max-w-3xl mx-auto">
              In the heat of the moment, Lumi helps you understand, respond, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`p-8 text-center hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-[#615E59] leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <div className="bg-[#F8F6F4] rounded-2xl p-8 border border-[#E6E2DD] max-w-4xl mx-auto">
              <p className="text-lg text-[#615E59] mb-4">
                From educators to coaches to family advocates—Lumi helps everyone see the same story, and write a better one together.
              </p>
              <p className="text-[#C44E38] font-semibold text-xl">
                Real-time support. Human-centered care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F8F6F4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              How It Works
            </h2>
            <p className="text-xl text-[#615E59]">
              Four simple steps to transform challenging moments into learning opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Log a behavior in seconds",
                description: "Voice or text input captures what happened quickly and easily",
                icon: MessageCircle,
                color: "text-[#C44E38]"
              },
              {
                step: "2", 
                title: "Lumi explains the 'why'",
                description: "Understand the developmental and emotional context behind the behavior",
                icon: Lightbulb,
                color: "text-[#F7D56F]"
              },
              {
                step: "3",
                title: "Get 3–5 strategies that fit",
                description: "Personalized approaches based on the child, moment, and your teaching style",
                icon: Target,
                color: "text-[#E88B6F]"
              },
              {
                step: "4",
                title: "Track what works",
                description: "Share insights with families and your team, building on success",
                icon: TrendingUp,
                color: "text-[#C3D4B7]"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card 
                  key={index}
                  className={`p-8 text-center bg-white hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-[#C44E38] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto">
                      <IconComponent className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#C44E38] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[#615E59] leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Library Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
                The Learning Library & LumiEd
              </h2>
              
              <div className="space-y-6 text-lg text-[#615E59] leading-relaxed">
                <p>
                  Lumi includes a Learning Library with quick, practical resources—bite-sized guides, scripts, and visuals teachers can use in the moment. It's designed for busy classrooms, giving educators the right words, strategies, and reminders exactly when they're needed.
                </p>
                
                <div className="bg-[#F8F6F4] rounded-2xl p-6 border border-[#E6E2DD]">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                    Coming Soon: LumiEd
                  </h3>
                  <p className="text-[#615E59]">
                    LumiEd builds on the Learning Library, offering the next level of professional development. With deeper trainings, interactive modules, and on-demand learning, LumiEd helps educators grow their skills over time—while staying connected to classroom realities.
                  </p>
                </div>
                
                <p className="text-[#C44E38] font-semibold text-xl">
                  Quick answers today. Lasting growth tomorrow.
                </p>
              </div>
            </div>
            
            <div className="animate-fade-in-right">
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-[#F7D56F] bg-opacity-10 to-white">
                  <div className="w-12 h-12 bg-[#F7D56F] bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#F7D56F]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Multilingual</h4>
                  <p className="text-sm text-[#615E59]">English & Spanish resources</p>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-[#E88B6F] bg-opacity-10 to-white">
                  <div className="w-12 h-12 bg-[#E88B6F] bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#E88B6F]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Evidence-Based</h4>
                  <p className="text-sm text-[#615E59]">Grounded in developmental science</p>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-[#B2C6E5] bg-opacity-10 to-white">
                  <div className="w-12 h-12 bg-[#B2C6E5] bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-[#B2C6E5]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Mobile Ready</h4>
                  <p className="text-sm text-[#615E59]">Use anywhere, anytime</p>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-[#C3D4B7] bg-opacity-10 to-white">
                  <div className="w-12 h-12 bg-[#C3D4B7] bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-[#C3D4B7]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Human-Centered</h4>
                  <p className="text-sm text-[#615E59]">Built by educators, for educators</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              The People Behind Lumi
            </h2>
            <p className="text-xl text-[#615E59]">
              Human Potential Partners (HPP) is a people-centered innovation firm
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className={`p-8 text-center animate-fade-in-up`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-[#E6E2DD]">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                  {member.name}
                </h3>
                <p className="text-[#C44E38] font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-[#615E59] leading-relaxed">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Card className="p-8 bg-gradient-to-r from-[#F8F6F4] to-white border-[#E6E2DD] max-w-4xl mx-auto">
              <p className="text-lg text-[#615E59] mb-4">
                We believe AI should amplify—not replace—human potential. Our work strengthens the skills that matter most in education: emotional intelligence, relationships, adaptability, and resilience.
              </p>
              <p className="text-[#C44E38] font-semibold text-xl">
                Because every child—and every teacher—deserves light.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#F8F6F4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              What Educators Say With Lumi
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-12 bg-white border-[#E6E2DD] shadow-lg">
              <blockquote className="text-center">
                <p className="text-2xl text-[#1A1A1A] italic leading-relaxed mb-8">
                  "Lumi helped me understand that what looked like defiance was actually a child asking for connection. The strategies work because they address the real need."
                </p>
                <cite className="text-[#C44E38] font-semibold text-lg">
                  — Head Start Teacher
                </cite>
              </blockquote>
            </Card>
          </div>
        </div>
      </section>

      {/* What Lumi Means Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              What Lumi Means
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-[#615E59] leading-relaxed mb-8">
                Lumi means light. It shines clarity into the toughest classroom moments, helping teachers see behavior with new understanding. Lumi guides instead of judging, bringing calm where there is overwhelm and connection where there is confusion.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 bg-gradient-to-br from-[#F7D56F] bg-opacity-10 to-white">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                    For Educators
                  </h3>
                  <p className="text-[#615E59]">
                    It is the light in the moment.
                  </p>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-[#C3D4B7] bg-opacity-10 to-white">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                    For Children
                  </h3>
                  <p className="text-[#615E59]">
                    It is the path to safety, trust, and growth.
                  </p>
                </Card>
              </div>
              
              <div className="mt-8">
                <p className="text-2xl font-bold text-[#C44E38]">
                  Lumi: Light in the classroom. Chaos to calm in the moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F8F6F4]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is Lumi just for crisis behavior?",
                answer: "No. Lumi helps with everyday challenges like transitions, hitting, crying, or focus—plus bigger moments."
              },
              {
                question: "Does Lumi replace consultants?",
                answer: "No. Lumi supports daily practice and helps consultants go deeper when they arrive."
              },
              {
                question: "How does Lumi help families?",
                answer: "It generates clear, compassionate reports in multiple languages and provides scripts for sensitive conversations."
              },
              {
                question: "What devices work with Lumi?",
                answer: "Phones, tablets, and computers. Voice input makes it fast and easy."
              },
              {
                question: "Is Lumi science-backed?",
                answer: "Yes. Lumi is built on decades of research in child development, neuroscience, attachment theory, and early childhood mental health. Every strategy and reflection prompt is grounded in developmental science—not just surface-level behavior management."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  {faq.question}
                </h3>
                <p className="text-[#615E59] leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#C44E38] to-[#B2473A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to bring calm, clarity, and care into your classroom?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Your Lumi experience awaits you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                onClick={() => setCurrentView('welcome')}
                size="lg"
                className="bg-white text-[#C44E38] hover:bg-gray-50 px-12 py-4 text-lg font-semibold"
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started Free
              </Button>
              <Button
                onClick={() => setCurrentView('signin')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#C44E38] px-8 py-4 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#C44E38] rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Lumi</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Classroom Behavior Coach™ - Bringing clarity, confidence, and care to early childhood education through AI-powered developmental science.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LumiEd</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Human Potential Partners. All rights reserved. Lumi™ and Classroom Behavior Coach™ are trademarks of Human Potential Partners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};