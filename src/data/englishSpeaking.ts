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
];
