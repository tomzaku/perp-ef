export interface SpeakingQuestion {
  id: string;
  topic: string;
  question: string;
  sampleAnswers: {
    label: string;
    answer: string;
  }[];
  usefulPhrases?: string[];
}

export const speakingTopics = [
  'Self Introduction',
  'Work & Career',
  'Daily Life',
  'Hometown & Travel',
  'Technology',
  'Hobbies & Interests',
  'Food & Culture',
  'Future Plans',
  'Opinions & Ideas',
  'Relationships & Family',
  'Money & Finance',
  'Health & Wellness',
  'Education & Learning',
  'Environment & Nature',
  'Problem Solving',
] as const;

export const speakingQuestions: SpeakingQuestion[] = [
  // ── Self Introduction ──────────────────────────────────
  {
    id: 'sp-1',
    topic: 'Self Introduction',
    question: 'Tell me about yourself.',
    sampleAnswers: [
      {
        label: 'Software Engineer in Da Nang',
        answer:
          "I'm a software engineer based in Da Nang, Vietnam. I've been working in web development for about five years now, mostly with React and Node.js. I really enjoy building user interfaces and solving tricky frontend problems. Outside of work, I like exploring the local coffee shops around the Han River area and going to the beach on weekends.",
      },
      {
        label: 'General',
        answer:
          "I'm a frontend developer and I've been in the industry for a few years. I'm passionate about creating smooth, accessible web experiences. Right now I'm focusing on improving my English so I can work more effectively with international teams. In my free time, I enjoy reading tech blogs and playing badminton.",
      },
    ],
    usefulPhrases: [
      "I'm based in...",
      "I've been working in... for about...",
      'I really enjoy...',
      "Right now I'm focusing on...",
      'Outside of work, I like...',
    ],
  },
  {
    id: 'sp-2',
    topic: 'Self Introduction',
    question: "What's your typical workday like?",
    sampleAnswers: [
      {
        label: 'Software Engineer',
        answer:
          "I usually start my day around 8:30. First thing I do is check Slack and catch up on any messages from the team. Then we have a standup meeting at 9. After that, I usually spend the morning doing focused coding work — that's when I'm most productive. I grab lunch around noon, sometimes I go to a banh mi place near the office. In the afternoon, I might have a code review or a planning meeting, and then I wrap up around 6.",
      },
      {
        label: 'Remote Worker',
        answer:
          "Since I work remotely, my schedule is pretty flexible. I usually wake up around 7, make some coffee, and start working by 8. I have calls with my team in the morning because they're in a different timezone. The afternoon is usually my deep work time — I put on some music and just code for a few hours straight. I try to finish by 6 so I can go for a walk along the beach.",
      },
    ],
    usefulPhrases: [
      'First thing I do is...',
      "That's when I'm most productive.",
      'I usually spend the morning...',
      'I wrap up around...',
      'I try to finish by... so I can...',
    ],
  },
  {
    id: 'sp-3',
    topic: 'Self Introduction',
    question: 'What are your strengths and weaknesses?',
    sampleAnswers: [
      {
        label: 'Software Engineer',
        answer:
          "I'd say my biggest strength is problem-solving. When I run into a tough bug or a complex feature, I really enjoy digging into it and figuring out the root cause. I'm also pretty good at breaking down big tasks into smaller pieces. As for weaknesses, I sometimes spend too much time trying to make code perfect instead of shipping it. I've been working on finding a better balance between code quality and delivery speed.",
      },
    ],
    usefulPhrases: [
      "I'd say my biggest strength is...",
      "I'm pretty good at...",
      'As for weaknesses...',
      "I've been working on...",
      'finding a better balance between...',
    ],
  },

  // ── Work & Career ──────────────────────────────────────
  {
    id: 'sp-4',
    topic: 'Work & Career',
    question: 'Why did you choose software engineering?',
    sampleAnswers: [
      {
        label: 'Personal Story',
        answer:
          "Honestly, I got into it kind of by accident. In college, I took a programming class and I was hooked. There's something really satisfying about writing code and seeing it come to life on the screen. Plus, the tech industry in Vietnam has been growing so fast, especially in cities like Da Nang and Ho Chi Minh City. It felt like a great career path with lots of opportunities.",
      },
    ],
    usefulPhrases: [
      'I got into it kind of by accident.',
      "There's something really satisfying about...",
      'I was hooked.',
      'It felt like a great career path.',
      'The industry has been growing so fast.',
    ],
  },
  {
    id: 'sp-5',
    topic: 'Work & Career',
    question: 'Can you describe a challenging project you worked on?',
    sampleAnswers: [
      {
        label: 'Frontend Project',
        answer:
          "Last year, we had to rebuild our entire frontend from a legacy jQuery app to React. The tricky part was we couldn't just stop everything and rewrite — we had to do it incrementally while keeping the old app running. I came up with a migration strategy where we used micro-frontends to gradually replace sections. It took about four months, but in the end the performance improved a lot and the codebase was much easier to maintain.",
      },
    ],
    usefulPhrases: [
      'The tricky part was...',
      'I came up with a strategy where...',
      'We had to do it incrementally.',
      'In the end...',
      'The codebase was much easier to maintain.',
    ],
  },
  {
    id: 'sp-6',
    topic: 'Work & Career',
    question: 'Where do you see yourself in five years?',
    sampleAnswers: [
      {
        label: 'Tech Lead Path',
        answer:
          "In five years, I'd like to be in a tech lead or senior architect role. I want to be the person who makes key technical decisions and mentors junior developers. I'm also interested in the management side — not just writing code, but helping a team grow and deliver great products. I might also want to try working abroad for a while, maybe in Singapore or Europe, just to get that international experience.",
      },
    ],
    usefulPhrases: [
      "I'd like to be in a... role.",
      "I'm also interested in...",
      'not just... but also...',
      'I might also want to try...',
      'just to get that... experience.',
    ],
  },
  {
    id: 'sp-7',
    topic: 'Work & Career',
    question: 'How do you handle disagreements with coworkers?',
    sampleAnswers: [
      {
        label: 'Collaborative Approach',
        answer:
          "I try to listen first and understand where the other person is coming from. Usually, disagreements happen because we're looking at the problem from different angles. I like to suggest we both write down our pros and cons, and then decide based on data rather than opinions. If we still can't agree, I'm happy to bring in a third person to help us figure it out. At the end of the day, we're all trying to build the best product.",
      },
    ],
    usefulPhrases: [
      'I try to listen first and understand...',
      "We're looking at the problem from different angles.",
      'decide based on data rather than opinions',
      "I'm happy to bring in a third person.",
      "At the end of the day, we're all trying to...",
    ],
  },

  // ── Daily Life ─────────────────────────────────────────
  {
    id: 'sp-8',
    topic: 'Daily Life',
    question: 'What do you usually do on weekends?',
    sampleAnswers: [
      {
        label: 'Da Nang Lifestyle',
        answer:
          "It depends on the weather. If it's nice out, I usually go to My Khe beach in the morning for a swim or a jog. Da Nang has such beautiful beaches, it would be a waste not to enjoy them. In the afternoon, I might hang out at a coffee shop and read or do some side project coding. Sometimes my friends and I go to the Son Tra peninsula to ride motorbikes and enjoy the view. On rainy weekends, I just stay home and watch movies or play games.",
      },
    ],
    usefulPhrases: [
      'It depends on the weather.',
      'It would be a waste not to...',
      'I might hang out at...',
      'Sometimes my friends and I...',
      'I just stay home and...',
    ],
  },
  {
    id: 'sp-9',
    topic: 'Daily Life',
    question: 'How do you stay healthy?',
    sampleAnswers: [
      {
        label: 'Active Lifestyle',
        answer:
          "I try to exercise at least three or four times a week. I go to the gym near my apartment, and on nice days I go running along the Han River — the path there is really nice for jogging. I also try to eat more home-cooked meals instead of eating out all the time, which is hard because the street food in Da Nang is so good and so cheap. I've been cutting back on coffee a bit too, but that's the hardest part honestly.",
      },
    ],
    usefulPhrases: [
      'I try to... at least... times a week.',
      'I also try to...',
      "which is hard because...",
      "I've been cutting back on...",
      "that's the hardest part honestly.",
    ],
  },

  // ── Hometown & Travel ──────────────────────────────────
  {
    id: 'sp-10',
    topic: 'Hometown & Travel',
    question: 'Tell me about your hometown.',
    sampleAnswers: [
      {
        label: 'Da Nang',
        answer:
          "I live in Da Nang, which is a coastal city in central Vietnam. It's the third largest city in the country, but it still has a really relaxed vibe compared to Hanoi or Ho Chi Minh City. The best things about Da Nang are the beaches — My Khe beach is right in the city — and the food is amazing and super affordable. The tech scene has been growing a lot in the past few years, with many companies opening offices here. It's a great place to live if you want a good work-life balance.",
      },
    ],
    usefulPhrases: [
      "It's a coastal city in...",
      'it still has a really relaxed vibe compared to...',
      'The best things about... are...',
      'The tech scene has been growing a lot.',
      "It's a great place to live if...",
    ],
  },
  {
    id: 'sp-11',
    topic: 'Hometown & Travel',
    question: "What's a place you'd recommend visiting in Vietnam?",
    sampleAnswers: [
      {
        label: 'Central Vietnam',
        answer:
          "I'd definitely recommend Hoi An. It's only about 30 minutes from Da Nang, and it's this beautiful ancient town with lanterns everywhere. The old town is a UNESCO World Heritage site. The food there is incredible — you have to try cao lau and banh mi from Madam Khanh. If you go during the full moon, they turn off all the electric lights and the whole town is lit by lanterns and candles. It's really magical.",
      },
    ],
    usefulPhrases: [
      "I'd definitely recommend...",
      "It's only about... from...",
      'you have to try...',
      "It's really magical.",
      "If you go during..., they...",
    ],
  },
  {
    id: 'sp-12',
    topic: 'Hometown & Travel',
    question: 'Have you traveled abroad? Where would you like to go?',
    sampleAnswers: [
      {
        label: 'Aspiring Traveler',
        answer:
          "I haven't traveled abroad much, but I'd really love to visit Japan. I'm a big fan of Japanese culture — the food, the technology, the attention to detail in everything they do. I'd also love to visit San Francisco someday, just to see Silicon Valley and the tech scene there. As a software engineer, it would be so cool to see where all these big tech companies started.",
      },
    ],
    usefulPhrases: [
      "I haven't... much, but I'd really love to...",
      "I'm a big fan of...",
      "I'd also love to visit...",
      'it would be so cool to...',
      'the attention to detail in...',
    ],
  },

  // ── Technology ─────────────────────────────────────────
  {
    id: 'sp-13',
    topic: 'Technology',
    question: 'What technology trend are you most excited about?',
    sampleAnswers: [
      {
        label: 'AI Enthusiast',
        answer:
          "Right now, I'm really excited about AI and how it's changing the way we build software. Tools like GitHub Copilot and ChatGPT have already changed my daily workflow. I think in the next few years, we'll see AI being integrated into almost every app. As a frontend developer, I'm particularly interested in how we can build better user interfaces for AI-powered features — like chat interfaces, real-time suggestions, that kind of thing.",
      },
    ],
    usefulPhrases: [
      "Right now, I'm really excited about...",
      "it's changing the way we...",
      'have already changed my daily workflow',
      "I think in the next few years, we'll see...",
      "I'm particularly interested in...",
    ],
  },
  {
    id: 'sp-14',
    topic: 'Technology',
    question: "What's your favorite tech stack and why?",
    sampleAnswers: [
      {
        label: 'Modern Frontend',
        answer:
          "I'm a big fan of React with TypeScript on the frontend, and Node.js on the backend. I like React because it gives you a lot of flexibility and the ecosystem is huge — there's a library for almost everything. TypeScript is a game changer for me, it catches so many bugs before they even happen. For the backend, I've been using Node with Express or Fastify, and PostgreSQL for the database. It's nice having JavaScript across the whole stack.",
      },
    ],
    usefulPhrases: [
      "I'm a big fan of...",
      'it gives you a lot of flexibility',
      'the ecosystem is huge',
      "it's a game changer for me",
      "It's nice having... across the whole...",
    ],
  },
  {
    id: 'sp-15',
    topic: 'Technology',
    question: 'How do you keep up with new technologies?',
    sampleAnswers: [
      {
        label: 'Continuous Learner',
        answer:
          "I follow a bunch of tech blogs and newsletters — like JavaScript Weekly and the React blog. I also watch conference talks on YouTube when I'm eating lunch. Twitter is actually pretty useful for staying up to date too, I follow a lot of developers there. And honestly, the best way to learn is just building stuff. Whenever I hear about a new framework or tool, I try to build a small project with it to see how it feels.",
      },
    ],
    usefulPhrases: [
      'I follow a bunch of...',
      "I also watch... when I'm...",
      'is actually pretty useful for...',
      'honestly, the best way to learn is...',
      'I try to build a small project with it.',
    ],
  },

  // ── Hobbies & Interests ────────────────────────────────
  {
    id: 'sp-16',
    topic: 'Hobbies & Interests',
    question: "What do you do to unwind after a long day of coding?",
    sampleAnswers: [
      {
        label: 'Relaxed Evening',
        answer:
          "After a long day of staring at code, the last thing I want to do is look at another screen. So I usually go for a walk or a bike ride, especially if the weather is nice. Da Nang is great for that — the riverside walk along the Han River is beautiful in the evening. Sometimes I cook dinner and listen to a podcast. If I'm really tired, I just lie on the couch and watch a show on Netflix. Nothing fancy, just simple things to recharge.",
      },
    ],
    usefulPhrases: [
      'the last thing I want to do is...',
      "I usually go for a walk, especially if...",
      "is great for that",
      'Nothing fancy, just simple things to recharge.',
      "If I'm really tired, I just...",
    ],
  },
  {
    id: 'sp-17',
    topic: 'Hobbies & Interests',
    question: 'Do you have any side projects?',
    sampleAnswers: [
      {
        label: 'Passionate Developer',
        answer:
          "Yeah, I'm always tinkering with something. Right now I'm building an interview prep app — it's actually this thing we're using right now. I like side projects because there's no pressure and I can try out new technologies I wouldn't use at work. I've also built a few Chrome extensions and a small budgeting app. Most of them don't go anywhere, but the learning experience is always worth it.",
      },
    ],
    usefulPhrases: [
      "I'm always tinkering with something.",
      "there's no pressure",
      'I can try out new technologies I wouldn\'t use at work.',
      "Most of them don't go anywhere, but...",
      'the learning experience is always worth it.',
    ],
  },

  // ── Food & Culture ─────────────────────────────────────
  {
    id: 'sp-18',
    topic: 'Food & Culture',
    question: "What's your favorite Vietnamese dish?",
    sampleAnswers: [
      {
        label: 'Da Nang Foodie',
        answer:
          "Oh, that's a tough one. I'd have to say mi quang — it's a noodle dish that's really popular in Da Nang and Quang Nam. It's got these thick yellow noodles with shrimp, pork, herbs, and a small amount of broth. What I love about it is the texture — you've got crispy rice crackers, soft noodles, and crunchy peanuts all in one bowl. Every restaurant makes it a little differently, which makes it fun to try different places.",
      },
    ],
    usefulPhrases: [
      "Oh, that's a tough one.",
      "I'd have to say...",
      "it's really popular in...",
      'What I love about it is...',
      'Every restaurant makes it a little differently.',
    ],
  },
  {
    id: 'sp-19',
    topic: 'Food & Culture',
    question: 'What cultural differences have you noticed when working with international teams?',
    sampleAnswers: [
      {
        label: 'Cross-cultural Experience',
        answer:
          "One big difference is communication style. In Vietnam, people tend to be more indirect — we might say 'maybe' or 'I'll try' instead of a flat 'no.' But in Western teams, they appreciate directness. I had to learn to be more upfront about deadlines and blockers. Another thing is meeting culture — some teams love having lots of meetings, while in Vietnam we tend to prefer just messaging on Slack. It took some adjustment, but now I actually appreciate the direct communication style.",
      },
    ],
    usefulPhrases: [
      'One big difference is...',
      'people tend to be more...',
      'I had to learn to be more...',
      'It took some adjustment, but now I...',
      'I actually appreciate...',
    ],
  },

  // ── Future Plans ───────────────────────────────────────
  {
    id: 'sp-20',
    topic: 'Future Plans',
    question: 'What are your goals for learning English?',
    sampleAnswers: [
      {
        label: 'Career-focused',
        answer:
          "My main goal is to be confident enough to have technical discussions in English without hesitating too much. Right now, I can read and write pretty well, but speaking is where I struggle — especially in meetings where everyone is talking fast. I want to get to the point where I can crack jokes in English and express my ideas naturally, not just translate from Vietnamese in my head. I think that would really open up a lot of career opportunities for me.",
      },
    ],
    usefulPhrases: [
      'My main goal is to be confident enough to...',
      "speaking is where I struggle",
      'I want to get to the point where...',
      'not just... but...',
      'that would really open up a lot of...',
    ],
  },
  {
    id: 'sp-21',
    topic: 'Future Plans',
    question: 'If you could start your own company, what would it be?',
    sampleAnswers: [
      {
        label: 'Tech Startup',
        answer:
          "I've thought about this a lot actually. I'd love to start a SaaS company focused on developer tools — maybe something that helps teams do better code reviews or manage technical debt. The reason is that I see these problems every day at work and I think there's room for better solutions. Da Nang would be a great place to start because the cost of living is low and there's a lot of talented developers here. But honestly, I think I need a few more years of experience before I take that leap.",
      },
    ],
    usefulPhrases: [
      "I've thought about this a lot actually.",
      "I'd love to start...",
      'The reason is that...',
      'I think there\'s room for better solutions.',
      'I need a few more years of... before I...',
    ],
  },

  // ── Opinions & Ideas ───────────────────────────────────
  {
    id: 'sp-22',
    topic: 'Opinions & Ideas',
    question: 'Do you think remote work is better than working from an office?',
    sampleAnswers: [
      {
        label: 'Balanced View',
        answer:
          "I think it really depends on the person and the type of work. For me, I like a mix of both. Remote work is great for deep focus — I get so much more coding done at home without all the office distractions. But I miss the social aspect of the office, like grabbing lunch with coworkers or having quick whiteboard sessions. I think the ideal setup is maybe two or three days in the office and the rest from home. That way you get the best of both worlds.",
      },
    ],
    usefulPhrases: [
      'I think it really depends on...',
      'I like a mix of both.',
      "is great for...",
      'I miss the... aspect of...',
      'That way you get the best of both worlds.',
    ],
  },
  {
    id: 'sp-23',
    topic: 'Opinions & Ideas',
    question: 'What do you think about AI replacing software engineers?',
    sampleAnswers: [
      {
        label: 'Pragmatic View',
        answer:
          "I don't think AI will replace software engineers anytime soon, but it will definitely change what we do. AI is already great at writing boilerplate code and simple functions, but it still struggles with understanding business logic and making architectural decisions. I think the engineers who will do well are the ones who learn to use AI as a tool — like a really smart assistant — rather than seeing it as a threat. The job will evolve, but it won't disappear.",
      },
    ],
    usefulPhrases: [
      "I don't think... will... anytime soon, but...",
      'it will definitely change what we do.',
      'it still struggles with...',
      'the ones who will do well are...',
      'rather than seeing it as...',
    ],
  },
  {
    id: 'sp-24',
    topic: 'Opinions & Ideas',
    question: 'What advice would you give to someone starting their career in tech?',
    sampleAnswers: [
      {
        label: 'Mentoring Advice',
        answer:
          "I'd say focus on the fundamentals first — learn how things work under the hood, not just how to use frameworks. Frameworks change all the time, but if you understand the core concepts like how the browser works, how HTTP works, how databases work, you can pick up any new tool quickly. Also, don't be afraid to ask questions. I wasted so much time early in my career being too shy to ask for help. And build stuff! The best way to learn is by building real projects, even if they're small.",
      },
    ],
    usefulPhrases: [
      "I'd say focus on...",
      'learn how things work under the hood',
      "don't be afraid to...",
      'I wasted so much time... being too...',
      'The best way to learn is by...',
    ],
  },

  // ── More Self Introduction ─────────────────────────────
  {
    id: 'sp-25',
    topic: 'Self Introduction',
    question: 'How would you describe your personality?',
    sampleAnswers: [
      {
        label: 'Honest Self-Assessment',
        answer:
          "I'd describe myself as pretty easygoing but also quite driven when it comes to work. I'm the kind of person who likes to plan things out before jumping in. My friends say I'm a good listener — I tend to think before I speak, which sometimes makes me seem quiet in groups. But once I'm comfortable, I can talk for hours. I'm also a bit of a perfectionist, which is both a strength and a weakness.",
      },
    ],
    usefulPhrases: [
      "I'd describe myself as...",
      "I'm the kind of person who...",
      'My friends say I\'m...',
      'which is both a strength and a weakness',
      'once I\'m comfortable...',
    ],
  },
  {
    id: 'sp-26',
    topic: 'Self Introduction',
    question: "What's something most people don't know about you?",
    sampleAnswers: [
      {
        label: 'Fun Fact',
        answer:
          "Most people don't know that I used to want to be a musician. I played guitar all through high school and even performed at a few small events in Da Nang. I eventually chose software engineering because it felt more practical, but I still play guitar at home when I need to de-stress. In a way, coding and music are similar — they both require creativity and attention to patterns.",
      },
    ],
    usefulPhrases: [
      "Most people don't know that...",
      'I used to want to be...',
      'I eventually chose... because...',
      'In a way, ... and ... are similar.',
      'they both require...',
    ],
  },

  // ── More Work & Career ─────────────────────────────────
  {
    id: 'sp-27',
    topic: 'Work & Career',
    question: 'What do you enjoy most about your job?',
    sampleAnswers: [
      {
        label: 'Frontend Developer',
        answer:
          "What I enjoy most is that moment when you build something and it just works. Like, you design a component, write the logic, and then you see it come alive in the browser. That feeling never gets old. I also really enjoy the problem-solving aspect — when there's a tricky bug and you finally figure out what's causing it, it's like solving a puzzle. And I appreciate that in tech, you're always learning something new.",
      },
    ],
    usefulPhrases: [
      'What I enjoy most is...',
      'That feeling never gets old.',
      'I also really enjoy the... aspect.',
      "it's like solving a puzzle.",
      "you're always learning something new.",
    ],
  },
  {
    id: 'sp-28',
    topic: 'Work & Career',
    question: 'Tell me about a time you failed at work.',
    sampleAnswers: [
      {
        label: 'Learning from Failure',
        answer:
          "There was a time when I pushed a code change to production without testing it properly because we were under a tight deadline. It ended up breaking the checkout flow for about 20 minutes. I felt terrible about it. But it taught me a really important lesson — no matter how rushed you are, you should never skip testing. After that, I set up a proper CI/CD pipeline with automated tests, and we haven't had that kind of incident since.",
      },
    ],
    usefulPhrases: [
      'There was a time when...',
      'I felt terrible about it.',
      'It taught me a really important lesson.',
      'No matter how rushed you are...',
      "we haven't had that kind of incident since.",
    ],
  },
  {
    id: 'sp-29',
    topic: 'Work & Career',
    question: 'How do you deal with stress at work?',
    sampleAnswers: [
      {
        label: 'Practical Approach',
        answer:
          "When I'm stressed, the first thing I do is take a step back and write down everything that's on my plate. Just seeing it written out makes it feel more manageable. Then I prioritize — what's urgent, what can wait, what can I delegate. I also take short breaks to walk around or grab a coffee. If it's really bad, I'll talk to my team lead about it. I've learned that pretending you're not stressed just makes it worse.",
      },
    ],
    usefulPhrases: [
      'the first thing I do is...',
      'Just seeing it written out makes it feel more manageable.',
      'what\'s urgent, what can wait',
      "I've learned that...",
      'pretending you\'re not... just makes it worse.',
    ],
  },
  {
    id: 'sp-30',
    topic: 'Work & Career',
    question: 'What makes a good team in your opinion?',
    sampleAnswers: [
      {
        label: 'Team Player',
        answer:
          "I think the most important thing is trust. When team members trust each other, they're more willing to share ideas, ask for help, and give honest feedback. Good communication is also key — not just talking, but actually listening to each other. And diversity of perspectives really helps. The best teams I've been on had people with different backgrounds and strengths. Oh, and having a bit of fun together doesn't hurt either.",
      },
    ],
    usefulPhrases: [
      'I think the most important thing is...',
      'they\'re more willing to...',
      'is also key',
      'The best teams I\'ve been on had...',
      "doesn't hurt either.",
    ],
  },

  // ── More Daily Life ────────────────────────────────────
  {
    id: 'sp-31',
    topic: 'Daily Life',
    question: 'Do you prefer mornings or evenings? Why?',
    sampleAnswers: [
      {
        label: 'Night Owl',
        answer:
          "I'm definitely more of a night owl. My brain just works better in the evening for some reason. In the morning, I need at least two cups of coffee before I can think straight. But at night, especially after 9 or 10, I feel really focused and creative. The downside is that I sometimes stay up too late coding and then struggle to wake up the next day. I've been trying to shift my schedule earlier, but old habits die hard.",
      },
    ],
    usefulPhrases: [
      "I'm definitely more of a...",
      'My brain just works better in...',
      'before I can think straight',
      'The downside is that...',
      'old habits die hard.',
    ],
  },
  {
    id: 'sp-32',
    topic: 'Daily Life',
    question: 'How has your daily routine changed since you started working?',
    sampleAnswers: [
      {
        label: 'Before vs After',
        answer:
          "It's changed a lot actually. When I was in university, I'd wake up at like 10 or 11, go to class, hang out with friends, stay up super late. Now I have a much more structured routine — wake up at 7:30, work from 8:30 to 6, exercise, cook dinner. I've become way more disciplined with my time. I also spend a lot less time on social media because I simply don't have the energy after a full day of coding.",
      },
    ],
    usefulPhrases: [
      "It's changed a lot actually.",
      'When I was in university...',
      'Now I have a much more structured routine.',
      "I've become way more disciplined.",
      'I simply don\'t have the energy after...',
    ],
  },
  {
    id: 'sp-33',
    topic: 'Daily Life',
    question: "What's the first thing you do when you wake up?",
    sampleAnswers: [
      {
        label: 'Honest Morning Routine',
        answer:
          "Honestly, the very first thing I do is check my phone — I know it's a bad habit, but I just quickly scan Slack and emails to see if there's anything urgent. Then I get up, brush my teeth, and make coffee. I can't function without coffee. If I have time, I'll spend about 10 minutes reading the news or scrolling through Twitter. Then I jump in the shower and start getting ready for work.",
      },
    ],
    usefulPhrases: [
      'Honestly, the very first thing I do is...',
      "I know it's a bad habit, but...",
      "I can't function without...",
      'If I have time, I\'ll...',
      'Then I jump in the shower.',
    ],
  },

  // ── More Hometown & Travel ─────────────────────────────
  {
    id: 'sp-34',
    topic: 'Hometown & Travel',
    question: 'How has Da Nang changed over the years?',
    sampleAnswers: [
      {
        label: 'Local Perspective',
        answer:
          "Da Nang has changed dramatically in the last 10 years. It used to be a pretty quiet city, but now there are new buildings going up everywhere, lots of restaurants and cafes, and way more tourists. The tech scene has really taken off too — there are dozens of software companies now. The infrastructure has improved a lot with new bridges and roads. Sometimes I miss how quiet it used to be, but overall the growth has been really positive for the city.",
      },
    ],
    usefulPhrases: [
      'has changed dramatically in the last...',
      'It used to be... but now...',
      'has really taken off',
      'Sometimes I miss how... it used to be.',
      'overall the growth has been really positive.',
    ],
  },
  {
    id: 'sp-35',
    topic: 'Hometown & Travel',
    question: "What's the best time of year to visit your city?",
    sampleAnswers: [
      {
        label: 'Da Nang Seasons',
        answer:
          "I'd say the best time is from March to August. That's when the weather is warm and sunny, perfect for going to the beach. The water is really clear and calm during those months. If you come in June, you can catch the international fireworks festival — it's a huge event where different countries compete with fireworks displays over the Han River. I'd avoid October to December though, that's the rainy season and it can get pretty intense with flooding sometimes.",
      },
    ],
    usefulPhrases: [
      "I'd say the best time is...",
      "That's when the weather is...",
      'If you come in..., you can catch...',
      "I'd avoid... though.",
      'it can get pretty intense.',
    ],
  },
  {
    id: 'sp-36',
    topic: 'Hometown & Travel',
    question: 'Do you prefer traveling alone or with others?',
    sampleAnswers: [
      {
        label: 'It Depends',
        answer:
          "It depends on where I'm going and why. For short trips within Vietnam, I love going with friends — it's more fun sharing the experience, splitting costs, and having someone to take photos of you. But for longer trips, especially to new countries, I actually prefer traveling alone. When you're by yourself, you're forced to talk to strangers, you can go at your own pace, and you end up having more unexpected adventures. Some of my best travel memories are from solo trips.",
      },
    ],
    usefulPhrases: [
      'It depends on... and...',
      "it's more fun sharing the experience",
      "When you're by yourself, you're forced to...",
      'you can go at your own pace',
      'Some of my best... memories are from...',
    ],
  },

  // ── More Technology ────────────────────────────────────
  {
    id: 'sp-37',
    topic: 'Technology',
    question: "What's the hardest technical problem you've solved?",
    sampleAnswers: [
      {
        label: 'Performance Problem',
        answer:
          "We had this issue where our app was getting really slow for users with large datasets — like, pages were taking 5 to 10 seconds to load. After a lot of profiling and debugging, I found out it was a combination of things: unnecessary re-renders in React, unoptimized database queries, and we were loading way too much data on the initial page load. I ended up implementing virtual scrolling, adding pagination to the API, and memoizing some expensive components. It brought the load time down to under a second.",
      },
    ],
    usefulPhrases: [
      'We had this issue where...',
      'After a lot of profiling and debugging...',
      'it was a combination of things',
      'I ended up implementing...',
      'It brought the... down to...',
    ],
  },
  {
    id: 'sp-38',
    topic: 'Technology',
    question: 'How do you explain technical concepts to non-technical people?',
    sampleAnswers: [
      {
        label: 'Analogy Approach',
        answer:
          "I try to use analogies from everyday life. Like, I once explained APIs to a product manager by comparing them to a waiter at a restaurant — you tell the waiter what you want, the waiter goes to the kitchen, and comes back with your food. You don't need to know how the kitchen works. I also avoid jargon and focus on what it means for the user or the business, not the technical details. The key is to meet people where they are.",
      },
    ],
    usefulPhrases: [
      'I try to use analogies from everyday life.',
      'I once explained... by comparing them to...',
      'You don\'t need to know how... works.',
      'I also avoid jargon.',
      'The key is to meet people where they are.',
    ],
  },
  {
    id: 'sp-39',
    topic: 'Technology',
    question: 'What do you think about the state of web development today?',
    sampleAnswers: [
      {
        label: 'Honest Take',
        answer:
          "I think web development has become incredibly powerful but also kind of overwhelming. The tools we have today are amazing — you can build really sophisticated apps right in the browser. But there are so many frameworks, libraries, and build tools that it's hard to keep up. Every week there's a new thing everyone's excited about. I think the industry is slowly moving toward simpler tools though, which is a good trend. We went too far with complexity for a while.",
      },
    ],
    usefulPhrases: [
      'has become incredibly... but also kind of...',
      "there are so many... that it's hard to keep up",
      "every week there's a new thing",
      'is slowly moving toward...',
      'We went too far with... for a while.',
    ],
  },

  // ── More Hobbies & Interests ───────────────────────────
  {
    id: 'sp-40',
    topic: 'Hobbies & Interests',
    question: "What's the last book or article that really stuck with you?",
    sampleAnswers: [
      {
        label: 'Tech & Life',
        answer:
          "I recently read 'Atomic Habits' by James Clear, and it really changed how I think about building habits. The idea that stuck with me most is that you don't rise to the level of your goals, you fall to the level of your systems. I've started applying that to my coding practice — instead of saying 'I want to learn Rust,' I set up a system where I spend 20 minutes every morning reading Rust documentation. It's been really effective.",
      },
    ],
    usefulPhrases: [
      'it really changed how I think about...',
      'The idea that stuck with me most is...',
      "I've started applying that to...",
      "instead of saying..., I...",
      "It's been really effective.",
    ],
  },
  {
    id: 'sp-41',
    topic: 'Hobbies & Interests',
    question: 'Are you into any sports?',
    sampleAnswers: [
      {
        label: 'Casual Athlete',
        answer:
          "I play badminton a couple times a week with some coworkers. We're not super competitive or anything, it's just a fun way to exercise and hang out after work. There are a lot of badminton courts in Da Nang, and it's really cheap — like 30,000 dong per hour. I also got into swimming last year since living near the beach, it felt silly not to. I go to My Khe beach early in the morning when it's not crowded.",
      },
    ],
    usefulPhrases: [
      'a couple times a week',
      "We're not super competitive or anything.",
      "it's just a fun way to...",
      'I also got into... last year.',
      'it felt silly not to.',
    ],
  },
  {
    id: 'sp-42',
    topic: 'Hobbies & Interests',
    question: "What's something you've always wanted to learn but haven't yet?",
    sampleAnswers: [
      {
        label: 'Wishlist',
        answer:
          "I've always wanted to learn how to cook Thai food properly. I love Thai cuisine — the balance of sweet, sour, salty, and spicy is just incredible. I've tried making pad thai and green curry at home, but it never tastes quite right. I think I need to take an actual cooking class. I'd also love to learn to play piano someday, but that's a much bigger commitment. Maybe when I have more free time.",
      },
    ],
    usefulPhrases: [
      "I've always wanted to learn how to...",
      'the balance of... is just incredible.',
      'it never tastes quite right.',
      'I think I need to take an actual...',
      "that's a much bigger commitment.",
    ],
  },

  // ── More Food & Culture ────────────────────────────────
  {
    id: 'sp-43',
    topic: 'Food & Culture',
    question: "What's the best meal you've ever had?",
    sampleAnswers: [
      {
        label: 'Memorable Experience',
        answer:
          "The best meal I've ever had was at this tiny family-run restaurant in Hoi An. It was nothing fancy — just plastic chairs on the sidewalk. I had their bun bo Hue and it was absolutely incredible. The broth was so rich and flavorful, you could tell it had been simmering for hours. What made it special wasn't just the food though, it was the whole experience — sitting outside on a cool evening, watching people walk by, eating this amazing bowl of noodles that cost like 30,000 dong.",
      },
    ],
    usefulPhrases: [
      "The best... I've ever had was...",
      'It was nothing fancy.',
      'it was absolutely incredible.',
      'you could tell it had been...',
      "What made it special wasn't just... it was...",
    ],
  },
  {
    id: 'sp-44',
    topic: 'Food & Culture',
    question: 'How do you think Vietnamese coffee culture is different from Western coffee culture?',
    sampleAnswers: [
      {
        label: 'Coffee Lover',
        answer:
          "Vietnamese coffee culture is way more social and relaxed. In the West, people grab a coffee to go and drink it while they work or commute. But in Vietnam, going for coffee is an activity in itself. You sit down, relax, maybe spend an hour or two chatting with friends or just watching the street. The coffee itself is different too — we use robusta beans which are stronger and more bitter, and we often drink it with condensed milk. I think our coffee culture is more about the experience than just the caffeine.",
      },
    ],
    usefulPhrases: [
      'is way more... and...',
      'is an activity in itself.',
      'you sit down, relax, maybe spend...',
      'The... itself is different too.',
      'is more about the experience than just...',
    ],
  },
  {
    id: 'sp-45',
    topic: 'Food & Culture',
    question: 'Are there any holidays or festivals that are special to you?',
    sampleAnswers: [
      {
        label: 'Vietnamese Traditions',
        answer:
          "Tet is definitely the most special one for me. It's the Vietnamese Lunar New Year, and it's when the whole family gets together. Even if you're working in a different city, everyone goes home for Tet. We clean the house, decorate with flowers, cook special dishes like banh tet and thit kho. The best part is catching up with relatives you haven't seen all year. It's also the only time I really take a proper break from work — usually about a week off.",
      },
    ],
    usefulPhrases: [
      'is definitely the most special one for me.',
      "it's when the whole family gets together.",
      'Even if you\'re..., everyone...',
      "The best part is...",
      'the only time I really take a proper break.',
    ],
  },

  // ── More Future Plans ──────────────────────────────────
  {
    id: 'sp-46',
    topic: 'Future Plans',
    question: 'What skills do you want to develop in the next year?',
    sampleAnswers: [
      {
        label: 'Growth Mindset',
        answer:
          "My top priority is getting better at system design. I can build features and fix bugs all day, but when it comes to designing the architecture for a whole system, I still feel like I have a lot to learn. I also want to improve my public speaking — I'd like to give a talk at a tech meetup here in Da Nang. And of course, I want to keep improving my English speaking. Being able to communicate clearly in English would open so many doors for me.",
      },
    ],
    usefulPhrases: [
      'My top priority is...',
      'I can... all day, but when it comes to...',
      'I still feel like I have a lot to learn.',
      "I'd like to give a talk at...",
      'would open so many doors for me.',
    ],
  },
  {
    id: 'sp-47',
    topic: 'Future Plans',
    question: 'Do you think you will stay in Da Nang long-term?',
    sampleAnswers: [
      {
        label: 'Thoughtful Answer',
        answer:
          "For now, yes. Da Nang has everything I need — good weather, affordable living, a growing tech scene, and my family is nearby. But I wouldn't rule out moving somewhere else for a few years to gain different experience. Maybe Singapore or Japan. I think experiencing different work cultures would make me a better engineer. But honestly, I always see myself coming back to Da Nang eventually. It's home, and it's hard to beat the lifestyle here.",
      },
    ],
    usefulPhrases: [
      'For now, yes.',
      'has everything I need',
      "I wouldn't rule out...",
      'I think experiencing... would make me...',
      'I always see myself coming back to...',
    ],
  },

  // ── More Opinions & Ideas ──────────────────────────────
  {
    id: 'sp-48',
    topic: 'Opinions & Ideas',
    question: 'Is social media more helpful or harmful?',
    sampleAnswers: [
      {
        label: 'Nuanced View',
        answer:
          "I think it's both, and it really depends on how you use it. Social media is great for staying connected with people, discovering new ideas, and even finding job opportunities. Twitter has been really useful for my career — I've learned a lot from the dev community there. But it can also be a huge time waster and it's bad for mental health if you're constantly comparing yourself to others. I try to be intentional about it — I follow people who teach me things and I limit my scrolling time.",
      },
    ],
    usefulPhrases: [
      'it really depends on how you use it.',
      'is great for... but it can also be...',
      "has been really useful for my career.",
      "if you're constantly comparing yourself to others",
      'I try to be intentional about it.',
    ],
  },
  {
    id: 'sp-49',
    topic: 'Opinions & Ideas',
    question: 'Should coding be taught in schools?',
    sampleAnswers: [
      {
        label: 'Strong Opinion',
        answer:
          "Absolutely, yes. Even if kids don't grow up to be software engineers, learning to code teaches them logical thinking, problem-solving, and how to break down complex problems into smaller steps. Those skills are useful in any career. In Vietnam, computer science education in schools is still pretty basic — mostly just learning how to use Word and Excel. I think we should introduce real programming much earlier, maybe in middle school. It doesn't have to be anything complicated, just the fundamentals.",
      },
    ],
    usefulPhrases: [
      'Absolutely, yes.',
      'Even if... don\'t..., learning to... teaches them...',
      'Those skills are useful in any career.',
      'is still pretty basic',
      'It doesn\'t have to be anything complicated.',
    ],
  },
  {
    id: 'sp-50',
    topic: 'Opinions & Ideas',
    question: "What's one thing you would change about the tech industry?",
    sampleAnswers: [
      {
        label: 'Industry Critique',
        answer:
          "I'd change the obsession with working long hours. There's this culture, especially in startups, where working 60 or 70 hours a week is seen as something to be proud of. But research shows that after about 40 hours, your productivity actually drops. I've seen so many talented developers burn out because of this. I think the industry should focus more on sustainable work practices. A well-rested developer who works 40 hours will produce better code than an exhausted one working 70.",
      },
    ],
    usefulPhrases: [
      "I'd change the obsession with...",
      "There's this culture where... is seen as...",
      'research shows that...',
      "I've seen so many... burn out because of this.",
      'should focus more on sustainable...',
    ],
  },

  // ── Relationships & Family ─────────────────────────────
  {
    id: 'sp-51',
    topic: 'Relationships & Family',
    question: 'Tell me about your family.',
    sampleAnswers: [
      {
        label: 'Vietnamese Family',
        answer:
          "I come from a pretty typical Vietnamese family. My parents live in Da Nang — my dad is retired and my mom sells vegetables at the local market. I have one older sister who works as a teacher. We're a close-knit family, even though we don't always see each other during the week because of work. On weekends, I usually go to my parents' house for lunch. My mom always cooks way too much food, but that's just how Vietnamese parents show love.",
      },
    ],
    usefulPhrases: [
      'I come from a pretty typical...',
      "We're a close-knit family.",
      'even though we don\'t always...',
      "that's just how... show love.",
      'I usually go to... for lunch.',
    ],
  },
  {
    id: 'sp-52',
    topic: 'Relationships & Family',
    question: 'How do you maintain friendships as an adult?',
    sampleAnswers: [
      {
        label: 'Keeping in Touch',
        answer:
          "It's definitely harder than when you're in school, where you see your friends every day. Now everyone has different schedules, some friends have moved to other cities. What works for me is having regular routines — like I play badminton with a group every Wednesday, and I have a Telegram group with my close friends where we chat daily. I also try to make an effort to meet up in person at least once or twice a month. It takes more effort as an adult, but it's worth it.",
      },
    ],
    usefulPhrases: [
      "It's definitely harder than when...",
      'What works for me is having regular routines.',
      'I also try to make an effort to...',
      'It takes more effort as an adult.',
      "but it's worth it.",
    ],
  },
  {
    id: 'sp-53',
    topic: 'Relationships & Family',
    question: 'How do your parents feel about your career in tech?',
    sampleAnswers: [
      {
        label: 'Generational Gap',
        answer:
          "My parents are proud of me, but I don't think they fully understand what I do. My mom still tells her friends I 'work with computers.' She's asked me to fix her printer more than once. But they can see that I have a stable job with a good salary, and that's what matters most to them. In Vietnamese culture, parents just want their kids to have a secure future. My dad was skeptical at first because he wanted me to be a doctor, but he's come around now.",
      },
    ],
    usefulPhrases: [
      "I don't think they fully understand what I do.",
      "that's what matters most to them.",
      'In Vietnamese culture, parents just want...',
      'was skeptical at first because...',
      "he's come around now.",
    ],
  },

  // ── Money & Finance ────────────────────────────────────
  {
    id: 'sp-54',
    topic: 'Money & Finance',
    question: 'How do you manage your money?',
    sampleAnswers: [
      {
        label: 'Practical Approach',
        answer:
          "I try to follow the 50-30-20 rule — 50% for necessities, 30% for wants, and 20% for savings. Living in Da Nang makes this pretty easy because the cost of living is so low compared to my salary. I use a simple spreadsheet to track my spending each month. I'm not super strict about it, but it helps me see where my money is going. I also put some money into a savings account and I've started investing a small amount in stocks through a Vietnamese broker.",
      },
    ],
    usefulPhrases: [
      'I try to follow the... rule.',
      'makes this pretty easy because...',
      "I'm not super strict about it.",
      'it helps me see where my money is going.',
      "I've started investing a small amount in...",
    ],
  },
  {
    id: 'sp-55',
    topic: 'Money & Finance',
    question: "What's the best purchase you've ever made?",
    sampleAnswers: [
      {
        label: 'Tech Investment',
        answer:
          "Probably my MacBook. It was expensive — like three months' salary at the time — but it completely changed my productivity. The build quality is amazing, it lasts all day on one charge, and the development experience on macOS is so much smoother. I've had it for three years and it still feels fast. I think spending money on tools that you use every single day is always worth it. A good laptop for a developer is like a good knife for a chef.",
      },
    ],
    usefulPhrases: [
      'it completely changed my...',
      'The build quality is amazing.',
      "I've had it for... and it still...",
      'spending money on... is always worth it.',
      'is like a good... for a...',
    ],
  },
  {
    id: 'sp-56',
    topic: 'Money & Finance',
    question: 'Do you think money can buy happiness?',
    sampleAnswers: [
      {
        label: 'Thoughtful Answer',
        answer:
          "I think money can buy comfort and security, which are prerequisites for happiness. If you're worrying about rent or food, it's really hard to be happy. So up to a certain point, more money definitely helps. But beyond that, it's diminishing returns. Some of the happiest moments in my life didn't cost anything — hanging out with friends, a good conversation, a sunset at the beach. I'd say money removes obstacles to happiness, but it doesn't create happiness by itself.",
      },
    ],
    usefulPhrases: [
      'are prerequisites for happiness.',
      'up to a certain point...',
      "it's diminishing returns.",
      "didn't cost anything",
      "removes obstacles to... but doesn't create... by itself.",
    ],
  },

  // ── Health & Wellness ──────────────────────────────────
  {
    id: 'sp-57',
    topic: 'Health & Wellness',
    question: 'What do you do to take care of your mental health?',
    sampleAnswers: [
      {
        label: 'Self-Aware Developer',
        answer:
          "As a developer, it's easy to just sit at your desk all day and forget to take care of yourself. I've learned that physical exercise really helps my mental state — even a 20-minute walk makes a difference. I also try to set boundaries with work, like not checking Slack after 8 PM. When I'm feeling overwhelmed, I talk to my friends about it. In Vietnam, we don't really talk about mental health openly, but I think that's slowly changing, especially among younger people.",
      },
    ],
    usefulPhrases: [
      "it's easy to just... and forget to...",
      "I've learned that... really helps my...",
      'even a 20-minute... makes a difference.',
      'I also try to set boundaries with...',
      "that's slowly changing, especially among...",
    ],
  },
  {
    id: 'sp-58',
    topic: 'Health & Wellness',
    question: 'Do you think developers have specific health challenges?',
    sampleAnswers: [
      {
        label: 'Industry Insight',
        answer:
          "Definitely. Sitting for 8 or more hours a day is terrible for your body — back pain, neck pain, eye strain, it's all very common among developers. A lot of us also have bad sleep habits because we get into that late-night coding zone. And the sedentary lifestyle combined with convenient delivery apps means it's easy to eat unhealthily. I've invested in a standing desk and I try to take a break every hour to stretch. It sounds simple, but it makes a huge difference.",
      },
    ],
    usefulPhrases: [
      'is terrible for your...',
      "it's all very common among...",
      'get into that late-night... zone',
      "I've invested in...",
      'It sounds simple, but it makes a huge difference.',
    ],
  },
  {
    id: 'sp-59',
    topic: 'Health & Wellness',
    question: 'What would you do if you had a whole week off with no responsibilities?',
    sampleAnswers: [
      {
        label: 'Dream Week',
        answer:
          "Oh man, that sounds amazing. I think the first two days I'd just sleep in and do absolutely nothing — no alarm, no code, just rest. Then I'd probably take a short trip, maybe ride my motorbike up to Hue or down to Quy Nhon along the coast. I'd bring a book and just take it slow, stop at random places along the way. On the last couple of days, I'd come back and work on a fun side project with zero pressure. Honestly, I think everyone needs a week like that at least once a year.",
      },
    ],
    usefulPhrases: [
      'Oh man, that sounds amazing.',
      "I'd just... and do absolutely nothing.",
      'just take it slow',
      'stop at random places along the way',
      'everyone needs... at least once a year.',
    ],
  },

  // ── Education & Learning ───────────────────────────────
  {
    id: 'sp-60',
    topic: 'Education & Learning',
    question: 'How did you learn to code?',
    sampleAnswers: [
      {
        label: 'Self-Taught Mix',
        answer:
          "I studied computer science in university, so I got the fundamentals there — data structures, algorithms, operating systems. But honestly, most of what I use at work I learned on my own. YouTube tutorials, online courses on Udemy, reading documentation, and just building things. The best teacher was building real projects. I remember my first web app was a mess — spaghetti code everywhere — but I learned so much from making those mistakes. I think the combination of formal education and self-learning worked well for me.",
      },
    ],
    usefulPhrases: [
      'I got the fundamentals there.',
      'most of what I use at work I learned on my own.',
      'The best teacher was...',
      'I learned so much from making those mistakes.',
      'the combination of... and... worked well for me.',
    ],
  },
  {
    id: 'sp-61',
    topic: 'Education & Learning',
    question: 'Do you prefer learning from videos, books, or hands-on practice?',
    sampleAnswers: [
      {
        label: 'Learning Style',
        answer:
          "For me, it's a mix. I usually start with a video tutorial to get a high-level overview — I like to see someone walk through the concepts. Then I switch to the official documentation for the details. But the real learning happens when I start building something with it. I can watch a hundred videos about React, but I won't really understand it until I build something and hit real problems. Books are great for deep topics like algorithms or system design where you need to think slowly.",
      },
    ],
    usefulPhrases: [
      "For me, it's a mix.",
      'I usually start with... to get a high-level overview.',
      'the real learning happens when...',
      "I won't really understand it until...",
      'Books are great for deep topics like...',
    ],
  },
  {
    id: 'sp-62',
    topic: 'Education & Learning',
    question: 'What do you think about the education system in Vietnam?',
    sampleAnswers: [
      {
        label: 'Constructive Criticism',
        answer:
          "I think it's strong in some areas and weak in others. Vietnamese students are generally very good at math and science because the system emphasizes memorization and practice. But it doesn't encourage critical thinking or creativity enough. When I was in school, we were taught to memorize answers, not to ask questions. I think that's changing slowly, especially in private schools and international programs. For tech specifically, university curriculums are often outdated — they teach languages and tools that companies don't really use anymore.",
      },
    ],
    usefulPhrases: [
      "it's strong in some areas and weak in others.",
      "doesn't encourage... enough.",
      'we were taught to..., not to...',
      "that's changing slowly, especially in...",
      'curriculums are often outdated.',
    ],
  },

  // ── Environment & Nature ───────────────────────────────
  {
    id: 'sp-63',
    topic: 'Environment & Nature',
    question: 'Are you concerned about climate change?',
    sampleAnswers: [
      {
        label: 'Local Impact',
        answer:
          "Yes, definitely. In Da Nang, we've seen more intense flooding during the rainy season in recent years. The weather patterns have become less predictable. As someone who lives in a coastal city, rising sea levels are a real concern. I try to do my part — I use a reusable water bottle, I take my motorbike instead of driving, and I try to reduce waste. But honestly, individual actions alone aren't enough. We need bigger systemic changes from governments and corporations.",
      },
    ],
    usefulPhrases: [
      "we've seen more intense...",
      'have become less predictable.',
      'is a real concern.',
      'I try to do my part.',
      "individual actions alone aren't enough.",
    ],
  },
  {
    id: 'sp-64',
    topic: 'Environment & Nature',
    question: 'Do you enjoy spending time in nature?',
    sampleAnswers: [
      {
        label: 'Nature Lover',
        answer:
          "Absolutely. One of the things I love about Da Nang is that nature is so accessible. You've got the beach five minutes from the city center, the Ba Na Hills about 45 minutes away, and the Son Tra peninsula with its forests and monkeys right next to the city. When I need to clear my head, I drive up to Son Tra and just sit there looking at the ocean from above. There's something about being in nature that resets your brain. It's the best antidote to sitting in front of a screen all day.",
      },
    ],
    usefulPhrases: [
      'One of the things I love about... is that...',
      'nature is so accessible.',
      'When I need to clear my head...',
      "There's something about... that...",
      "It's the best antidote to...",
    ],
  },
  {
    id: 'sp-65',
    topic: 'Environment & Nature',
    question: 'How can technology help solve environmental problems?',
    sampleAnswers: [
      {
        label: 'Tech Optimist',
        answer:
          "Technology can play a huge role. Things like solar panels and electric vehicles are already making a difference. AI can optimize energy usage in buildings and factories. Even in software, we can make an impact — like building apps that help people track their carbon footprint, or optimizing server infrastructure to use less energy. As developers, we should think about the environmental cost of our code too. Running unnecessary computations on thousands of servers has a real carbon footprint.",
      },
    ],
    usefulPhrases: [
      'can play a huge role.',
      'are already making a difference.',
      'Even in software, we can make an impact.',
      'we should think about the... cost of...',
      'has a real carbon footprint.',
    ],
  },

  // ── Problem Solving ────────────────────────────────────
  {
    id: 'sp-66',
    topic: 'Problem Solving',
    question: 'How do you approach a problem you have no idea how to solve?',
    sampleAnswers: [
      {
        label: 'Developer Approach',
        answer:
          "First, I try not to panic, which is easier said than done. Then I break the problem down into smaller parts. Usually, even if the whole thing seems impossible, there are pieces I can figure out. I Google a lot — Stack Overflow, blog posts, GitHub issues. If I'm still stuck after an hour or so, I ask a colleague for help. There's no point banging your head against the wall for hours when someone might have the answer in five minutes. I've also found that sometimes the best thing is to step away and come back with fresh eyes.",
      },
    ],
    usefulPhrases: [
      'which is easier said than done.',
      'I break the problem down into smaller parts.',
      "There's no point banging your head against the wall.",
      'someone might have the answer in five minutes.',
      'come back with fresh eyes.',
    ],
  },
  {
    id: 'sp-67',
    topic: 'Problem Solving',
    question: 'Tell me about a decision you made that you later regretted.',
    sampleAnswers: [
      {
        label: 'Honest Reflection',
        answer:
          "I once turned down a job offer from a remote company because I was comfortable at my current job. The salary was almost double, and the work seemed really interesting. But I was scared of the change — working in English full-time, different timezone, no office to go to. Six months later, my company had layoffs and I was affected. Looking back, I should have taken the risk when I had the chance. It taught me that staying comfortable isn't always the safe choice. Sometimes the bigger risk is not taking any risk at all.",
      },
    ],
    usefulPhrases: [
      'I once turned down... because...',
      'I was scared of the change.',
      'Looking back, I should have...',
      "isn't always the safe choice.",
      'Sometimes the bigger risk is not taking any risk at all.',
    ],
  },
  {
    id: 'sp-68',
    topic: 'Problem Solving',
    question: 'How do you prioritize when everything seems urgent?',
    sampleAnswers: [
      {
        label: 'Practical Framework',
        answer:
          "When everything feels urgent, I use a simple framework. I ask myself: what will happen if I don't do this today? If the answer is 'nothing much,' then it's not really urgent, it just feels that way. I also think about impact — which task, if completed, will unblock other people or move the project forward the most? That one goes first. I'm a big fan of the Eisenhower matrix — urgent and important, important but not urgent, and so on. It helps me cut through the noise and focus on what actually matters.",
      },
    ],
    usefulPhrases: [
      'I ask myself: what will happen if...',
      "it's not really urgent, it just feels that way.",
      'which task will unblock other people',
      "I'm a big fan of...",
      'cut through the noise and focus on what actually matters.',
    ],
  },

  // ── Work & Career — Standup Meeting ─────────────────────
  {
    id: 'sp-69',
    topic: 'Work & Career',
    question: 'It\'s your daily standup. Share what you did yesterday, what you\'re working on today, and any blockers.',
    sampleAnswers: [
      {
        label: 'Frontend Feature Work',
        answer:
          "Yesterday I finished the hover-to-repeat feature for the English practice page. I split the text into sentences so users can click or hover on any sentence to hear it read aloud. I also added a toggle in the settings page. Today I'm going to write unit tests for the sentence splitting logic and fix a small CSS issue with the toggle switch. No blockers at the moment.",
      },
      {
        label: 'Bug Fix & Code Review',
        answer:
          "Yesterday I spent most of the day investigating a performance issue on the dashboard page. It turned out we were re-rendering a large list unnecessarily, so I wrapped it in a memo and the load time dropped significantly. I also reviewed two pull requests from the team. Today I'll be picking up the authentication ticket — adding OAuth support for Google login. One blocker: I'm waiting on the API team to share the endpoint documentation. I've already pinged them on Slack.",
      },
      {
        label: 'Backend & DevOps',
        answer:
          "Yesterday I deployed the new caching layer to staging and ran some load tests. The results looked good — response times improved by about 40 percent. I also updated the CI pipeline to include the new integration tests. Today I'm planning to promote the caching changes to production and monitor the metrics. The only potential blocker is that we need approval from the team lead before the production deploy, but I've already sent the request.",
      },
    ],
    usefulPhrases: [
      'Yesterday I finished...',
      'I spent most of the day...',
      'It turned out that...',
      "Today I'm going to...",
      "Today I'll be picking up...",
      "Today I'm planning to...",
      'No blockers at the moment.',
      "One blocker: I'm waiting on...",
      'The only potential blocker is...',
      "I've already pinged them on...",
      'The results looked good.',
      'I also reviewed... from the team.',
    ],
  },
];
