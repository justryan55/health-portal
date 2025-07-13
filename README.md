# Health Portal

A Next.js front end for the Health Portal with Supabase being used for the back end.

## Getting Started

1. Run 'npm i' to install dependencies
2. Copy 'env.example' to 'env' and update following environmental details with the supabase details:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Run 'npm run dev' to run the application.

Notes

Core AI Coach Features
Smart Workout Generation: The AI could analyze your current exercises, progress patterns, and goals to automatically suggest new workouts. Instead of manually planning every session, users could say "create a push day for me" or "I want to focus on strength this week" and get a tailored plan.
Real-time Form & Progress Coaching: During workouts, the coach could provide guidance like "Your bench press weight has plateaued for 3 weeks - try reducing weight by 10% and increasing reps" or "Great job hitting all your sets! Consider adding 5lbs next session."
Adaptive Planning: Rather than static weekly plans, the AI could dynamically adjust based on performance, recovery, missed sessions, or changing goals. If someone misses Monday's workout, it could redistribute exercises across the remaining days.
Recovery & Wellness Insights: The coach could track patterns in performance drops, suggest rest days, and notice when someone might be overtraining or under-recovering.
Implementation Approach
Conversational Interface: Add a chat interface where users can ask questions, get advice, or request workout modifications. This could live in your existing "Coach (AI Assistant)" section.
Smart Notifications: Proactive coaching through notifications - "You haven't worked legs in 5 days" or "Your upper body volume is 40% higher than lower body this week."
Data-Driven Recommendations: Use the workout history to identify weak points, suggest progression schemes, and recommend exercise variations to prevent plateaus.
Goal Setting & Tracking: Help users set realistic goals and break them into actionable steps, then monitor progress and adjust strategies.
