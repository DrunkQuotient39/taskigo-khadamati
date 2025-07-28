import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown, Play, Star, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from './ScrollReveal';
import type { Messages } from '@/lib/i18n';

interface ParallaxHeroProps {
  messages: Messages;
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export default function ParallaxHero({ messages, onGetStarted, onWatchDemo }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y1Spring = useSpring(y1, springConfig);
  const y2Spring = useSpring(y2, springConfig);
  const y3Spring = useSpring(y3, springConfig);

  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+', color: 'text-khadamati-blue' },
    { icon: CheckCircle, label: 'Services Completed', value: '125K+', color: 'text-khadamati-success' },
    { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-khadamati-yellow' },
    { icon: TrendingUp, label: 'Growth Rate', value: '+120%', color: 'text-khadamati-blue' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <motion.div
          style={{ y: y3Spring }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-khadamati-blue/20 to-khadamati-yellow/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          style={{ y: y2Spring }}
          className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-r from-khadamati-yellow/15 to-khadamati-blue/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Geometric Patterns */}
        <motion.div
          style={{ y: y1Spring }}
          className="absolute top-1/4 right-1/4 w-64 h-64 opacity-5"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <motion.polygon
              points="100,10 40,198 190,78 10,78 160,198"
              fill="currentColor"
              className="text-khadamati-blue"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Column - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ opacity, scale }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <Badge className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white px-4 py-2 text-sm font-medium">
                🚀 #1 Service Platform in the Region
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-gradient">Taskego</span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Your Service
              </span>
              <br />
              <span className="text-khadamati-blue">Marketplace</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Connect with verified professionals for 
              <span className="text-khadamati-blue font-semibold"> cleaning</span>,
              <span className="text-khadamati-yellow font-semibold"> repairs</span>, and
              <span className="text-khadamati-blue font-semibold"> maintenance</span> services. 
              Available in English and Arabic.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white px-8 py-4 text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 btn-animated"
              >
                Get Started Free
                <ArrowDown className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={onWatchDemo}
                variant="outline"
                size="lg"
                className="border-2 border-khadamati-blue text-khadamati-blue hover:bg-khadamati-blue hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-3 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Elements */}
          <motion.div
            style={{ y: y1Spring }}
            className="relative hidden lg:block"
          >
            {/* Main Device Mockup */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="relative z-10"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-khadamati-blue/10 to-khadamati-yellow/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 bg-gradient-to-r from-khadamati-blue to-khadamati-yellow rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 text-center"
              style={{ animationDelay: '1s' }}
            >
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm font-semibold text-khadamati-blue">4.9/5 Rating</div>
            </motion.div>

            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="absolute -bottom-6 -right-6 bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white rounded-2xl shadow-xl p-4 text-center"
              style={{ animationDelay: '2s' }}
            >
              <div className="text-2xl mb-1">🚀</div>
              <div className="text-sm font-semibold">50K+ Users</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400 dark:text-gray-500"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}