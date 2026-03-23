export interface IeltsConversation {
  id: string;
  title: string;
  part: 'Part 1' | 'Part 2' | 'Part 3';
  topic: string;
  description: string;
  duration: string;
  exchanges: {
    role: 'examiner' | 'candidate';
    text: string;
  }[];
  tips?: string[];
  keyPhrases?: string[];
}

export const ieltsTopics = [
  'Home & Living',
  'Work & Study',
  'Technology',
  'Travel & Places',
  'Health & Lifestyle',
  'Media & Entertainment',
  'Environment',
  'Society & Culture',
] as const;

export const ieltsConversations: IeltsConversation[] = [
  // ── Part 1: Short Questions ──────────────────────────────
  {
    id: 'ielts-1',
    title: 'Part 1 — Daily Routine & Work',
    part: 'Part 1',
    topic: 'Work & Study',
    description: 'Typical Part 1 questions about daily life, work habits, and preferences. The examiner asks short, personal questions.',
    duration: '5 min',
    exchanges: [
      { role: 'examiner', text: "Let's talk about your work. What do you do?" },
      { role: 'candidate', text: "I'm a software engineer. I work for a tech company in Da Nang, Vietnam. My main responsibility is building web applications, mostly using React and TypeScript. I've been doing this for about five years now, and I really enjoy the problem-solving aspect of it." },
      { role: 'examiner', text: 'What do you like most about your job?' },
      { role: 'candidate', text: "I think what I enjoy most is the creative side of programming. When you're building a user interface, you're not just writing code — you're designing an experience for people. There's a real sense of satisfaction when you solve a difficult problem or when users genuinely appreciate something you've built. I also enjoy the continuous learning — the tech industry moves so fast that there's always something new to explore." },
      { role: 'examiner', text: 'Do you prefer working alone or in a team?' },
      { role: 'candidate', text: "Honestly, I enjoy both, but probably lean slightly toward working in a team. When you collaborate with others, you get exposed to different perspectives and ideas that you wouldn't come up with on your own. That said, I do need some quiet, focused time to actually write code. So ideally, I like a balance — team discussions for planning and brainstorming, and individual time for deep work." },
      { role: 'examiner', text: "Let's talk about your daily routine. What time do you usually wake up?" },
      { role: 'candidate', text: "I'm usually up around seven in the morning. I'm not really a morning person by nature, but I've trained myself to wake up early because I find I get more done before noon. The first thing I do is make a cup of Vietnamese coffee — I can't really function without it. Then I'll check my messages quickly before heading to the office or starting work if I'm working from home that day." },
      { role: 'examiner', text: 'Has your daily routine changed much in recent years?' },
      { role: 'candidate', text: "Yes, quite a bit actually. Before the pandemic, I had a very fixed routine — commute to the office every day, work nine to six, come home. But since we shifted to a hybrid model, my routine has become much more flexible. On days I work from home, I might take a longer lunch break to go for a walk, or I might start earlier and finish earlier. I think the flexibility has been really positive for my overall wellbeing." },
      { role: 'examiner', text: 'Do you think routines are important?' },
      { role: 'candidate', text: "Definitely. I think having some structure in your day helps you stay productive and gives you a sense of stability. But at the same time, I don't think you should be too rigid about it. Life is unpredictable, and being able to adapt is important too. I try to have a general framework for my day — when I wake up, when I exercise, when I do focused work — but I leave room for flexibility within that framework." },
    ],
    tips: [
      'Keep answers to 2-4 sentences — detailed enough to show fluency but not so long that you ramble',
      'Use specific examples from your own life',
      'Show a range of vocabulary — avoid repeating the same words',
      'Use natural discourse markers: "Honestly," "Actually," "I think," "That said"',
    ],
    keyPhrases: [
      'I really enjoy the... aspect of it',
      'There\'s a real sense of satisfaction when...',
      'I probably lean slightly toward...',
      'I\'m not really a... person by nature, but...',
      'Quite a bit, actually',
      'I try to have a general framework for...',
    ],
  },
  {
    id: 'ielts-2',
    title: 'Part 1 — Technology & Internet',
    part: 'Part 1',
    topic: 'Technology',
    description: 'Part 1 questions about technology usage, internet habits, and social media preferences.',
    duration: '5 min',
    exchanges: [
      { role: 'examiner', text: 'How often do you use the internet?' },
      { role: 'candidate', text: "Oh, constantly. As a software developer, I'm online pretty much all day for work — looking up documentation, collaborating with teammates, and of course writing code. Outside of work, I use the internet for everything from reading news to watching tutorials. I'd say I'm connected for at least ten to twelve hours a day, which sounds like a lot when I say it out loud." },
      { role: 'examiner', text: 'What do you mainly use the internet for?' },
      { role: 'candidate', text: "Apart from work, I'd say learning is the biggest one. I watch a lot of YouTube videos about programming, design, and sometimes random topics like history or science. I also use the internet for entertainment — I'm a big fan of podcasts, especially tech ones and English learning ones. And of course, staying in touch with friends and family through messaging apps like Zalo and Telegram." },
      { role: 'examiner', text: 'Do you think people spend too much time online?' },
      { role: 'candidate', text: "I think it really depends on how you use it. If you're spending time learning, creating, or connecting meaningfully with people, then being online isn't necessarily a bad thing. But I do think a lot of people, myself included sometimes, fall into the trap of mindless scrolling — going through social media feeds without really getting anything out of it. That's the kind of screen time that I think is too much. It's about quality, not just quantity." },
      { role: 'examiner', text: 'What technology could you not live without?' },
      { role: 'candidate', text: "My laptop, without question. It's essentially my livelihood — I couldn't do my job without it. But beyond work, I use it for almost everything: communication, entertainment, learning, even managing my finances. If I had to choose a second thing, I'd say noise-cancelling headphones. They've been a game-changer for my concentration, especially when working in cafés or open offices." },
      { role: 'examiner', text: 'Do you think children should use technology?' },
      { role: 'candidate', text: "Yes, but with limits. Technology is such an important part of the world they're growing up in, so I think it's actually essential for children to be exposed to it and learn how to use it. However, I don't think a five-year-old should be spending three hours a day on a tablet. There should be a good balance between screen time and physical activities, socializing, and creative play. Parents have a responsibility to set boundaries and guide their children's technology use." },
    ],
    tips: [
      'For questions about opinions, give your view AND explain why',
      'Use quantifiers naturally: "pretty much," "at least," "a lot of"',
      'Show you can discuss both sides: "Yes, but..." or "It depends on..."',
      'Idiomatic expressions add naturalness: "game-changer," "fall into the trap"',
    ],
    keyPhrases: [
      'Which sounds like a lot when I say it out loud',
      'Apart from... I\'d say... is the biggest one',
      'It really depends on how you...',
      'Fall into the trap of...',
      'It\'s about quality, not just quantity',
      'Without question',
      'They\'ve been a game-changer for...',
    ],
  },

  // ── Part 2: Long Turn ──────────────────────────────
  {
    id: 'ielts-3',
    title: 'Part 2 — Describe a Skill You Learned',
    part: 'Part 2',
    topic: 'Work & Study',
    description: 'A cue card topic where the candidate speaks for 1-2 minutes. Topic: Describe a skill you learned that you are proud of.',
    duration: '8 min',
    exchanges: [
      { role: 'examiner', text: "I'd like you to describe a skill that you learned and are proud of. You should say: what the skill is, how you learned it, why you decided to learn it, and explain why you are proud of it. You have one minute to prepare." },
      { role: 'candidate', text: `I'd like to talk about learning to communicate effectively in English, which is something I've been working on for the past couple of years and feel genuinely proud of.

I decided to focus seriously on English when I started working with international clients and colleagues. Before that, I could read English fairly well — most programming documentation is in English, so I had decent reading comprehension. But when it came to speaking and writing in professional contexts, I really struggled. I would freeze up in meetings, overthink my grammar, and often just stay silent because I was afraid of making mistakes.

The way I learned was quite self-directed. I started by consuming as much English content as possible — podcasts during my commute, English YouTube channels, and audiobooks before bed. I also began writing a daily journal in English, which helped me practice expressing my thoughts more fluently. But the biggest breakthrough came when I started actually using English every day — having conversations with colleagues, presenting in meetings, and even thinking in English instead of translating from Vietnamese in my head.

I'm particularly proud of this skill because it required me to push past a lot of discomfort. Speaking a foreign language means being vulnerable — you make grammatical mistakes, you mispronounce words, and sometimes people don't understand you. It would have been much easier to just stick to Vietnamese and avoid that discomfort. But I pushed through, and now I can confidently hold conversations, give presentations, and even make jokes in English, which I think is one of the hardest things to do in a foreign language.

It's also opened up so many opportunities for me professionally. I can now work with clients from anywhere in the world, read technical articles without struggling, and participate in the global developer community. It's genuinely changed the trajectory of my career, and I feel proud every time I realize how far I've come from those early days of freezing up in meetings.` },
      { role: 'examiner', text: 'Do you think you will continue to improve this skill?' },
      { role: 'candidate', text: "Absolutely. Language learning is a lifelong journey — I don't think you ever really finish. There are still areas where I want to improve, like using more idiomatic expressions naturally and getting better at understanding different accents. I also want to expand my vocabulary in areas outside of technology, like discussing art, politics, or philosophy in English. So yes, I'll definitely keep working on it." },
    ],
    tips: [
      'Structure your answer clearly: what, how, why, and your feelings about it',
      'Speak for the full 1-2 minutes — practice timing yourself',
      'Use a mix of past and present tenses to show grammatical range',
      'Include personal feelings and reflections, not just facts',
      'Use discourse markers to connect ideas: "But the biggest breakthrough came when..."',
    ],
    keyPhrases: [
      'I\'d like to talk about...',
      'I feel genuinely proud of...',
      'When it came to... I really struggled',
      'The biggest breakthrough came when...',
      'It required me to push past a lot of discomfort',
      'It\'s genuinely changed the trajectory of...',
      'I feel proud every time I realize how far I\'ve come',
    ],
  },
  {
    id: 'ielts-4',
    title: 'Part 2 — Describe a Place You Like to Visit',
    part: 'Part 2',
    topic: 'Travel & Places',
    description: 'A cue card topic: Describe a place in your city that you like to visit. Say where it is, what you do there, who you go with, and why you enjoy it.',
    duration: '8 min',
    exchanges: [
      { role: 'examiner', text: "I'd like you to describe a place in your city that you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you enjoy visiting this place." },
      { role: 'candidate', text: `One of my favorite places in Da Nang is the area along the Han River, particularly the stretch between the Dragon Bridge and the Love Lock Bridge. I try to go there at least two or three times a week, usually in the evening after work.

What I typically do there depends on my mood. Sometimes I go for a run along the riverbank — there's a nice paved path that runs alongside the water, and in the evening the temperature cools down enough to make running pleasant. Other times, I just walk slowly and take in the scenery. There are lots of small cafés and street food vendors along the river, so I might stop for a Vietnamese iced coffee or some grilled corn.

I usually go alone, actually, which might sound strange. But I find that walking by the river alone is one of the best ways for me to decompress after a long day of coding. When you spend all day staring at a screen and thinking about complex problems, there's something incredibly refreshing about being outdoors, watching the lights reflected on the water, feeling the breeze from the sea.

What I particularly love about this spot is how it transforms at night. The Dragon Bridge lights up in different colors, and on weekend nights it actually breathes fire and water, which is quite a spectacle. The Love Lock Bridge is covered in colorful locks left by couples, and it's beautifully lit in the evening. The whole area has this wonderful, almost magical atmosphere.

But beyond the aesthetics, I think what I really enjoy is the sense of community. In the evening, you see families out walking, groups of friends sitting on the riverbank, elderly people doing tai chi, and young couples taking photos. It reminds me that there's a whole world beyond my laptop screen. It brings me back to the present moment and helps me appreciate the city I live in.

I'd say this place is important to my mental health, honestly. It's become a kind of ritual — whenever I'm feeling stressed or stuck on a problem, I know that a walk by the river will help me reset. And sometimes, I've had my best ideas while walking there, because my mind is free to wander without the pressure of sitting at a desk.` },
      { role: 'examiner', text: 'Is this place popular with tourists as well?' },
      { role: 'candidate', text: "Yes, very much so. Da Nang has become one of the most popular tourist destinations in Vietnam, and the Han River area is one of the main attractions. You see quite a mix of local people and tourists there, especially near the Dragon Bridge on weekend evenings. I think tourists are drawn to it for the same reasons I am — the beautiful scenery, the vibrant atmosphere, and of course the dragon breathing fire, which is quite unique. But I'd say during weekday evenings it's mostly locals, which is when I prefer to go." },
    ],
    tips: [
      'Paint a picture with descriptive language — help the listener visualize the place',
      'Include sensory details: sights, sounds, smells, feelings',
      'Explain the emotional significance, not just physical description',
      'Use present simple for habits and routines at the place',
      'Vary your sentence structure — mix short and long sentences',
    ],
    keyPhrases: [
      'One of my favorite places is...',
      'What I typically do there depends on...',
      'There\'s something incredibly refreshing about...',
      'What I particularly love about... is how it...',
      'Beyond the aesthetics, I think what I really enjoy is...',
      'It\'s become a kind of ritual',
      'My mind is free to wander',
    ],
  },

  // ── Part 3: Discussion ──────────────────────────────
  {
    id: 'ielts-5',
    title: 'Part 3 — Education & Learning in the Modern World',
    part: 'Part 3',
    topic: 'Society & Culture',
    description: 'An in-depth discussion about education systems, online learning, and how technology is changing the way people learn.',
    duration: '10 min',
    exchanges: [
      { role: 'examiner', text: 'How has technology changed the way people learn?' },
      { role: 'candidate', text: "Technology has fundamentally transformed learning in several ways. The most obvious is accessibility — today, anyone with an internet connection can access courses from top universities through platforms like Coursera or MIT OpenCourseWare. When I was growing up in Vietnam, access to high-quality English-language education was limited. Now, a student in a small town can watch the same lecture as someone at Harvard. That's remarkable.\n\nBeyond accessibility, technology has made learning much more personalized. AI-powered tools can adapt to a student's level and pace, providing more practice in areas where they're struggling. Language learning apps like Duolingo adjust their difficulty based on your performance. This kind of personalization was simply impossible in a traditional classroom with thirty students." },
      { role: 'examiner', text: 'Do you think online learning is as effective as traditional classroom learning?' },
      { role: 'candidate', text: "That's a really interesting question, and I don't think there's a simple answer. For certain types of learning, online can actually be more effective. Self-paced courses are great for motivated learners who want to go deeper into a subject at their own speed. And for technical skills like programming, online resources are often more up-to-date than textbooks.\n\nHowever, traditional classroom learning has advantages that are hard to replicate online. The social aspect — learning alongside peers, having face-to-face discussions, building relationships with teachers — is really valuable. There's also the accountability factor. When you have to show up to a class at a specific time, you're more likely to actually do the work.\n\nI think the ideal model is probably a blend of both — what educators call 'blended learning.' Use online resources for content delivery and self-study, but maintain in-person sessions for discussion, collaboration, and hands-on activities." },
      { role: 'examiner', text: 'Some people say that university degrees are becoming less important. Do you agree?' },
      { role: 'candidate', text: "To some extent, yes, particularly in industries like technology. In my field, software engineering, many successful developers are self-taught or have learned through bootcamps rather than university degrees. Companies like Google and Apple have removed degree requirements for many positions, focusing instead on demonstrated skills and portfolio work.\n\nHowever, I think it would be premature to say that degrees are becoming irrelevant. For many professions — medicine, law, engineering — a formal education is absolutely essential. And even in tech, a university education provides things that self-study doesn't: a broad foundation of knowledge, exposure to different perspectives, and the development of critical thinking skills.\n\nWhat I think is changing is the monopoly that universities had on credentialing. Employers are increasingly willing to accept alternative credentials — certificates, portfolios, open-source contributions. So degrees are becoming less necessary as a signal of competence, but the learning they represent is still valuable." },
      { role: 'examiner', text: 'How do you think education systems should prepare young people for the future?' },
      { role: 'candidate', text: "This is something I feel quite strongly about. I think current education systems, in many countries including Vietnam, are still too focused on memorization and standardized testing. Students learn to pass exams rather than to think critically, solve problems, or be creative.\n\nIf I could change one thing, it would be to put much more emphasis on teaching students how to learn, rather than what to learn. In a world where information is constantly changing and new fields are emerging all the time, the most valuable skill is the ability to teach yourself new things. Critical thinking, information literacy, and adaptability should be at the core of education.\n\nI'd also advocate for more practical, project-based learning. When I was in school, most of what I learned was theoretical. But when I started working, I realized that the ability to apply knowledge to real problems is what actually matters. Students should be working on real projects, collaborating in teams, and learning from failure from an early age.\n\nFinally, I think we need to take soft skills more seriously. Communication, teamwork, emotional intelligence, resilience — these are just as important as technical knowledge, but they're rarely taught explicitly in schools." },
      { role: 'examiner', text: 'Is there too much pressure on students today?' },
      { role: 'candidate', text: "Absolutely, and I think this is a growing concern, especially in Asian countries. In Vietnam, there's enormous pressure on students to perform well in exams, get into prestigious universities, and pursue 'respectable' careers. This pressure comes from families, schools, and society as a whole.\n\nThe consequences can be quite serious. I've seen friends and colleagues who burned out in their twenties because they'd been under relentless academic pressure since childhood. Mental health issues among students are rising — anxiety, depression, and in the worst cases, more serious problems.\n\nI think we need a cultural shift in how we view success and education. Not everyone needs to go to university. Not everyone needs to be a doctor or an engineer. A society needs people with all kinds of skills and interests, and we should celebrate that diversity rather than pushing everyone through the same narrow path.\n\nThat said, I want to be careful not to romanticize a lack of pressure. Some degree of challenge and expectation is necessary for growth. The problem is when the pressure becomes excessive, when it comes at the cost of wellbeing, and when it's driven by social status rather than genuine learning." },
    ],
    tips: [
      'Part 3 requires you to discuss abstract topics in depth — go beyond personal experience',
      'Structure complex answers: state your position, give reasons, provide examples, and acknowledge other views',
      'Use hedging language for nuance: "To some extent," "I think it would be premature to say..."',
      'Show you can evaluate both sides of an argument',
      'Use sophisticated linking: "However," "That said," "Beyond that," "What I think is changing is..."',
    ],
    keyPhrases: [
      'That\'s a really interesting question, and I don\'t think there\'s a simple answer',
      'To some extent, yes, particularly in...',
      'I think it would be premature to say...',
      'This is something I feel quite strongly about',
      'If I could change one thing, it would be...',
      'I\'d also advocate for...',
      'I want to be careful not to romanticize...',
      'That said...',
    ],
  },
  {
    id: 'ielts-6',
    title: 'Part 3 — The Future of Cities',
    part: 'Part 3',
    topic: 'Society & Culture',
    description: 'A discussion about urbanization, smart cities, and how cities might change in the coming decades.',
    duration: '10 min',
    exchanges: [
      { role: 'examiner', text: 'Why do you think so many people are moving to cities?' },
      { role: 'candidate', text: "There are both push and pull factors at play. On the pull side, cities offer better job opportunities, higher salaries, and more diverse career options. For a young person in a rural area of Vietnam, moving to Ho Chi Minh City or Da Nang opens up possibilities that simply don't exist in their hometown — particularly in fields like technology, finance, and creative industries.\n\nCities also offer better access to education, healthcare, and cultural activities. If you want to attend a university, visit a specialist doctor, or go to a concert, you generally need to be in or near a city.\n\nOn the push side, rural areas often lack economic opportunities, and farming — which is the main livelihood in many rural areas — is becoming increasingly mechanized, requiring fewer workers. Climate change is also a factor — in Vietnam, rising sea levels and extreme weather are affecting agricultural communities, pushing some people toward cities.\n\nI think this trend is likely to continue, though perhaps at a slower pace as remote work makes it possible for some people to live in smaller cities while working for companies based in large ones." },
      { role: 'examiner', text: 'What problems does rapid urbanization cause?' },
      { role: 'candidate', text: "The list is quite long, unfortunately. Housing affordability is one of the biggest issues. When millions of people move to cities, demand for housing outstrips supply, and prices skyrocket. In cities like Ho Chi Minh City, property prices have risen so dramatically that many young professionals can barely afford to rent, let alone buy. This creates inequality — longtime residents and wealthy investors benefit from rising property values while newcomers are priced out.\n\nInfrastructure strain is another major problem. Roads, public transport, water systems, and electrical grids weren't designed for the current population in many rapidly growing cities. Traffic congestion in Vietnamese cities is a daily frustration for millions of people, and it wastes enormous amounts of time and fuel.\n\nEnvironmental degradation is also a serious concern. More people means more waste, more pollution, and more pressure on green spaces. Air quality in many Asian cities is already at dangerous levels, and the heat island effect — where cities are significantly hotter than surrounding rural areas — is getting worse.\n\nAnd then there are social issues: overcrowding, stress, crime, and the erosion of community. In a village, everyone knows their neighbors. In a massive city, people can live next door to each other for years without ever speaking." },
      { role: 'examiner', text: 'Do you think technology can help solve some of these urban problems?' },
      { role: 'candidate', text: "Yes, I'm cautiously optimistic about this. The concept of 'smart cities' — using technology to improve urban management — is already being implemented in various ways. For example, smart traffic systems that use AI to optimize signal timing can significantly reduce congestion. Singapore has been a leader in this area, and the results are impressive.\n\nSmart waste management systems can use sensors to optimize collection routes, reducing costs and environmental impact. Smart energy grids can distribute power more efficiently. And improvements in public transport technology — electric buses, ride-sharing algorithms, even the prospect of autonomous vehicles — could transform how people move around cities.\n\nHowever, I'm cautious because technology alone isn't enough. A smart traffic system can only do so much if the fundamental problem is that there are too many cars and not enough public transport. Technology should complement good urban planning and policy, not replace it.\n\nThere's also the risk that smart city technology could be used for excessive surveillance. China's social credit system and pervasive camera networks raise real questions about privacy and civil liberties. We need to ensure that making cities smarter doesn't mean making citizens less free." },
      { role: 'examiner', text: 'What do you think cities will look like in fifty years?' },
      { role: 'candidate', text: "That's a fascinating question to speculate about. I think cities will be significantly greener — both literally and figuratively. As climate change pressures intensify, cities will need to incorporate much more green space, better insulation, and renewable energy. I imagine buildings covered in vertical gardens, rooftop solar panels everywhere, and many more parks and green corridors.\n\nTransportation will probably look very different. I expect most vehicles will be electric and autonomous, and personal car ownership will decline in favor of shared mobility services. Public transport will likely be faster and more efficient, possibly including things like hyperloop systems connecting nearby cities.\n\nRemote work will have reshaped urban geography. If fewer people need to commute to a central office every day, we might see a more distributed model — clusters of smaller urban centers rather than one massive downtown. This could help reduce some of the congestion and housing pressure.\n\nBut honestly, predicting fifty years into the future is extremely difficult. If you'd asked someone in 1975 what cities would look like in 2025, they probably wouldn't have predicted smartphones, the internet, or ride-sharing apps. The changes that actually transform cities might be things we haven't even imagined yet.\n\nWhat I hope for, regardless of the specific technologies, is that future cities are designed with human wellbeing at their center — places where people can live comfortably, move easily, breathe clean air, and feel a sense of community. That should be the goal, and technology should serve that goal rather than being an end in itself." },
    ],
    tips: [
      'For speculative questions, use appropriate modal verbs: "will probably," "might," "could"',
      'Organize your points clearly — use categories like "push and pull factors" or "On one hand... on the other..."',
      'Show awareness of your own country/context while also discussing broader trends',
      'End with a personal reflection or forward-looking statement',
      'Use advanced vocabulary naturally, not forcefully',
    ],
    keyPhrases: [
      'There are both push and pull factors at play',
      'The list is quite long, unfortunately',
      'I\'m cautiously optimistic about...',
      'Technology should complement... not replace...',
      'That\'s a fascinating question to speculate about',
      'If you\'d asked someone in... they probably wouldn\'t have predicted...',
      'Regardless of the specific technologies...',
      '...should be the goal, and... should serve that goal',
    ],
  },
  {
    id: 'ielts-7',
    title: 'Part 2 — Describe a Time You Helped Someone',
    part: 'Part 2',
    topic: 'Society & Culture',
    description: 'Cue card: Describe a time you helped someone. Say who you helped, what the situation was, how you helped, and how you felt about it.',
    duration: '8 min',
    exchanges: [
      { role: 'examiner', text: "Describe a time when you helped someone. You should say: who you helped, what the situation was, how you helped them, and explain how you felt about helping them. You have one minute to prepare." },
      { role: 'candidate', text: `I'd like to describe a time when I helped a junior developer on my team who was really struggling during his first few months at our company.

His name was Minh, and he had just graduated from university. He was technically quite capable — his coding skills were solid — but he was having a hard time adapting to the professional environment. The codebase was large and complex, the tools and processes were unfamiliar, and I think he was overwhelmed by the gap between what he'd learned in school and what the job actually required.

I noticed that he was staying very late every day but not making much progress on his tasks. He was too shy to ask for help — I think he was afraid of looking incompetent. During code reviews, his pull requests would have fundamental issues, and I could see that the feedback, while well-intentioned, was making him feel worse rather than helping him improve.

So I decided to become something of an informal mentor. I started by having a casual coffee chat with him, where I shared my own experience of feeling lost when I first started working. I told him about mistakes I'd made and how long it took me to feel comfortable. I think hearing that helped normalize what he was going through.

After that, I set up a regular weekly session where we'd sit together and work through problems. I didn't just give him answers — I tried to teach him how to approach problems systematically. How to read a codebase, how to debug effectively, how to break a large task into manageable pieces. I also helped him set up his development environment properly and showed him shortcuts and tools that would save him time.

Over the next few months, his confidence grew visibly. He started asking questions in team meetings, his code reviews improved dramatically, and he began finishing tasks on time. By the end of his first year, he was one of the most reliable members of the team.

How did I feel about it? Honestly, it was one of the most rewarding experiences I've had at work. There's something deeply satisfying about helping someone overcome a difficult period and seeing them grow. It also made me reflect on my own journey and appreciate the people who helped me along the way. I think mentoring someone is one of the best ways to solidify your own knowledge too — when you have to explain something clearly to someone else, you understand it better yourself.

And on a broader level, it reinforced my belief that the tech industry needs to do more to support junior developers. The transition from education to professional work is genuinely difficult, and without proper support, talented people can fall through the cracks.` },
      { role: 'examiner', text: 'Do you think people help each other enough in the workplace?' },
      { role: 'candidate', text: "Unfortunately, I don't think so — at least not in many workplaces. There's often a culture of 'figure it out yourself,' which can be especially tough for newcomers. People are busy with their own tasks and deadlines, and mentoring doesn't always get recognized or rewarded by management. I think companies should make mentorship more formal and valued — it benefits the mentor, the mentee, and the organization as a whole." },
    ],
    tips: [
      'Tell a story with a clear beginning, middle, and end',
      'Include emotional depth — how you felt, how the other person felt',
      'Use narrative tenses well: past simple for events, past continuous for background',
      'Connect the personal story to a broader theme or lesson',
      'Show character through actions, not just descriptions',
    ],
    keyPhrases: [
      'I\'d like to describe a time when...',
      'He was having a hard time adapting to...',
      'I noticed that...',
      'I decided to become something of an...',
      'I didn\'t just... — I tried to...',
      'His confidence grew visibly',
      'It was one of the most rewarding experiences I\'ve had',
      'It reinforced my belief that...',
      'Talented people can fall through the cracks',
    ],
  },
  {
    id: 'ielts-8',
    title: 'Part 3 — Health & Modern Lifestyle',
    part: 'Part 3',
    topic: 'Health & Lifestyle',
    description: 'Discussion about health challenges in modern life, work-life balance, and the role of mental health.',
    duration: '10 min',
    exchanges: [
      { role: 'examiner', text: 'Do you think people today are healthier than in the past?' },
      { role: 'candidate', text: "It's a paradox, really. In many ways, we're healthier than ever before. Life expectancy has increased dramatically over the past century. We've virtually eliminated many diseases through vaccination, and medical technology can now treat conditions that were once fatal. Access to clean water, sanitation, and nutrition has improved for billions of people.\n\nBut at the same time, we're facing new health challenges that didn't really exist in the past. Sedentary lifestyles are a huge problem — many people, myself included, spend most of the day sitting. Processed food has become the default for millions of people, leading to rising rates of obesity, diabetes, and heart disease. And mental health issues — anxiety, depression, burnout — are reaching epidemic proportions in many countries.\n\nSo I'd say we've traded one set of health problems for another. We've conquered many infectious diseases, but we're now struggling with chronic lifestyle diseases. Whether we're 'healthier' overall depends on how you define health." },
      { role: 'examiner', text: 'Why do you think mental health problems are increasing?' },
      { role: 'candidate', text: "I think there are several interconnected factors. First, modern life is genuinely more stressful in certain ways. The pace of work has intensified — we're expected to be constantly available, constantly productive. The boundary between work and personal life has eroded, especially for knowledge workers. You might technically finish work at six, but your email follows you home.\n\nSecond, social media and constant comparison are taking a toll. We're exposed to carefully curated versions of other people's lives, which makes our own lives seem inadequate by comparison. This is especially damaging for young people who are still forming their identity and self-worth.\n\nThird, and this is often overlooked, traditional sources of meaning and community have weakened. In many societies, religious attendance has declined, families are more geographically dispersed, and neighborhood communities are less tight-knit than they once were. These structures used to provide a sense of belonging and purpose that's now missing for many people.\n\nThat said, I should note that part of the apparent increase in mental health problems is actually increased awareness and reduced stigma. People are more willing to talk about mental health and seek help, which is a positive development. But even accounting for that, the research suggests there is a genuine increase in prevalence, not just reporting." },
      { role: 'examiner', text: 'What responsibility do employers have for their employees\' health?' },
      { role: 'candidate', text: "I believe employers have a significant responsibility, and it goes beyond just providing health insurance. At a minimum, companies should ensure that their work environment doesn't actively harm employees' health — that means reasonable working hours, adequate breaks, ergonomic workspaces, and a culture that doesn't glorify overwork.\n\nBeyond that minimum, I think forward-thinking companies should actively promote wellbeing. This could include things like flexible working arrangements, mental health support or counseling services, encouraging physical activity, and training managers to recognize signs of burnout in their teams.\n\nIn Vietnam's tech industry, there's still often a culture of working long hours and wearing exhaustion as a badge of honor. I've seen colleagues work twelve-hour days consistently, skip meals, and sacrifice sleep to meet deadlines. Some companies even celebrate this as 'dedication.' I think this is deeply misguided — it leads to burnout, turnover, and actually lower productivity in the long run.\n\nHowever, I also believe individuals bear some responsibility for their own health. You can't expect your company to force you to exercise or eat well. Ideally, it should be a partnership — the employer creates conditions that support health, and the employee takes advantage of those conditions." },
      { role: 'examiner', text: 'How do you think attitudes toward health will change in the future?' },
      { role: 'candidate', text: "I'm hopeful that we'll see a more holistic understanding of health take hold. Currently, many people still think of health primarily in physical terms — am I sick or not? But I think the younger generation is already shifting toward a broader view that includes mental health, social connection, and overall life satisfaction as components of being healthy.\n\nI also expect that preventive health will become much more important relative to reactive treatment. Technology like wearable devices, genetic testing, and AI-powered health monitoring will allow people to identify health risks before they become problems. Instead of going to the doctor when you're already sick, you'll receive an alert that your stress levels have been elevated for two weeks and be prompted to take action.\n\nIn terms of work culture, I think the pandemic accelerated a shift that was already underway. More companies are recognizing that burnt-out, unhealthy employees are neither productive nor loyal. The competition for talent means that companies that offer genuine work-life balance and health support will have an advantage in attracting top people.\n\nMy hope is that in twenty or thirty years, the idea that someone should sacrifice their health for their job will seem as outdated as the idea of smoking in the office does today." },
    ],
    tips: [
      'Part 3 rewards sophisticated thinking — show you can analyze complex issues',
      'Use academic/formal vocabulary naturally: "epidemic proportions," "interconnected factors"',
      'Give specific examples from your own country or experience to support general points',
      'Don\'t just give opinions — consider multiple perspectives and counterarguments',
      'Use conditional and speculative language for future predictions',
    ],
    keyPhrases: [
      'It\'s a paradox, really',
      'I\'d say we\'ve traded one set of... for another',
      'It depends on how you define...',
      'There are several interconnected factors',
      'This is often overlooked...',
      'That said, I should note that...',
      'I believe... and it goes beyond just...',
      'This is deeply misguided',
      'Ideally, it should be a partnership',
      'My hope is that...',
    ],
  },
];
