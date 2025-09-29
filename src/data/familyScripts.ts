export interface FamilyCommunicationScript {
  id: string;
  title: string;
  category: 'behavior_explanation' | 'strengths_challenges' | 'stress_regulation' | 'collaborative_problem_solving' | 'descriptive_feedback' | 'resource_introduction';
  scenario: string;
  script: string;
  familyHandoutId?: string;
  language: 'english' | 'spanish' | 'bilingual';
  isPremium: boolean;
  createdAt: Date;
}

export const FAMILY_COMMUNICATION_SCRIPTS: FamilyCommunicationScript[] = [
  // Behavior Explanation Scripts
  {
    id: 'tantrum-explanation',
    title: 'Explaining Tantrums to Families',
    category: 'behavior_explanation',
    scenario: 'When a child has frequent emotional outbursts',
    script: `Hi [Parent Name], I wanted to share what I observed with [Child Name] today. During our transition to cleanup time, [he/she] had some big feelings and needed extra support to feel calm again. This is completely normal for children [his/her] age - their brains are still learning how to handle disappointment and changes. What I saw was [Child Name] working hard to express [his/her] feelings, even though it came out as crying and frustration. We stayed close, helped [him/her] take some deep breaths, and [he/she] was able to rejoin the group when ready. These moments are actually opportunities for [him/her] to practice emotional skills that will serve [him/her] well throughout life.`,
    familyHandoutId: 'tantrum-support-family',
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'biting-explanation',
    title: 'Explaining Biting Behaviors',
    category: 'behavior_explanation',
    scenario: 'When a child bites peers or adults',
    script: `Hello [Parent Name], I wanted to let you know about something that happened with [Child Name] today. During playtime, [he/she] bit [peer/adult] when [he/she] was feeling frustrated about sharing a toy. I know this can be concerning, but biting is actually very common for toddlers and young children. At this age, [Child Name]'s language skills are still developing, and sometimes [his/her] body tries to communicate what [his/her] words can't yet express. We immediately helped [him/her] understand that biting hurts friends, and we practiced using words like "my turn" instead. We're working on giving [him/her] the tools to express [his/her] needs in ways that keep everyone safe.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'withdrawal-explanation',
    title: 'Explaining Withdrawal or Quiet Behaviors',
    category: 'behavior_explanation',
    scenario: 'When a child becomes withdrawn or unusually quiet',
    script: `Hi [Parent Name], I wanted to check in about [Child Name]. Today I noticed [he/she] seemed to need some quiet time and chose to observe rather than join group activities. This kind of behavior often shows us that a child is processing their environment or might be feeling overwhelmed. [Child Name] is naturally thoughtful and observant - these are wonderful strengths. We made sure [he/she] felt safe and supported, and when [he/she] was ready, [he/she] gradually joined in. Some children need more time to warm up, and that's perfectly okay. We're here to support [his/her] natural rhythm while gently encouraging participation when [he/she] feels comfortable.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },

  // Strengths + Challenges Scripts
  {
    id: 'determination-transitions',
    title: 'Strong-Willed Child - Transitions',
    category: 'strengths_challenges',
    scenario: 'Child shows determination but struggles with transitions',
    script: `[Parent Name], I love seeing [Child Name]'s strong sense of determination! [He/She] really knows what [he/she] wants and isn't easily swayed - this shows incredible inner strength that will serve [him/her] well in life. Sometimes this determination shows up as resistance during transitions, like when we're moving from free play to circle time. [His/Her] strong will means [he/she] gets deeply engaged in activities, which is wonderful for learning and focus. We're working on helping [him/her] use that same determination to practice flexibility. We give [him/her] advance notice about changes and choices within the transition, which honors [his/her] need for some control while still moving the day forward.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'social-energy-overwhelm',
    title: 'Social Child - Overwhelm',
    category: 'strengths_challenges',
    scenario: 'Very social child who sometimes gets overstimulated',
    script: `[Child Name] has such a gift for connecting with others! [He/She] lights up around friends and brings so much joy to our classroom community. [His/Her] social energy is one of [his/her] greatest strengths. Sometimes, though, all that social excitement can become overwhelming, and [he/she] might need help regulating when there's too much stimulation. Today during group play, [he/she] got very excited and needed some support to calm [his/her] body. We helped [him/her] take a quiet break and then [he/she] was able to rejoin [his/her] friends. We're teaching [him/her] to recognize when [his/her] body needs a pause, which will help [him/her] maintain those wonderful friendships.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },

  // Stress + Regulation Scripts
  {
    id: 'nervous-system-explanation',
    title: 'Explaining the Nervous System to Families',
    category: 'stress_regulation',
    scenario: 'When explaining stress responses and regulation',
    script: `Hi [Parent Name], I wanted to share some information about how [Child Name]'s developing nervous system works. When children feel stressed, scared, or overwhelmed, their bodies have automatic responses - just like adults do. [Child Name]'s brain is still learning how to manage these big feelings, and that's completely normal. What might look like "misbehavior" is often [his/her] nervous system trying to feel safe again. Today when [situation], [his/her] body went into protection mode. We helped [him/her] feel safe by [specific actions], and once [his/her] nervous system calmed down, [he/she] was able to think clearly again. This is how children learn to self-regulate - through lots of practice with caring adults who help them feel secure.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },

  // Collaborative Problem-Solving Scripts
  {
    id: 'home-strategies-inquiry',
    title: 'Asking About Home Strategies',
    category: 'collaborative_problem_solving',
    scenario: 'When seeking family input on effective strategies',
    script: `Hi [Parent Name], I'd love to learn more about what works well for [Child Name] at home. We've been working on [specific challenge] at school, and I'm curious about your experiences. What have you found that helps [him/her] when [he/she] is feeling [frustrated/overwhelmed/upset]? Are there particular words, routines, or comfort items that seem to help [him/her] feel better? I believe you know [Child Name] best, and I'd love to build on the strategies that are already working for your family. Together, we can create consistency between home and school that will help [him/her] feel more secure and successful.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },

  // Descriptive Feedback Scripts
  {
    id: 'observation-based-feedback',
    title: 'Sharing Observations Without Labels',
    category: 'descriptive_feedback',
    scenario: 'When providing specific, non-judgmental feedback',
    script: `[Parent Name], I wanted to share some specific observations about [Child Name] today. During [activity], I noticed [he/she] [specific behavior description]. [He/She] seemed to be [working on/practicing/exploring] [specific skill or concept]. What stood out to me was how [he/she] [positive observation]. This shows me that [he/she] is [developing skill/showing growth/learning]. I also noticed that when [situation], [he/she] [response]. This gives us good information about how [he/she] processes [type of situation] and what kind of support [he/she] finds most helpful. These observations help us understand [Child Name] better and plan activities that match [his/her] interests and developmental needs.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  },

  // Resource Introduction Scripts
  {
    id: 'handout-introduction',
    title: 'Introducing Family Handouts',
    category: 'resource_introduction',
    scenario: 'When sharing educational resources with families',
    script: `Hi [Parent Name], I have a resource I think you might find helpful! Based on what we've been seeing with [Child Name] around [specific topic/behavior], I found this handout that explains [topic] in simple terms and offers some strategies you can try at home. It's written by child development experts and uses the same approach we use at school, so [Child Name] will have consistency between home and school. The handout includes [brief description of contents]. Please don't feel like you need to try everything at once - even small changes can make a big difference. I'm here if you have any questions about the suggestions or want to talk about how they're working for your family.`,
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01')
  }
];


export const SCRIPT_CATEGORIES = [
  { id: 'behavior_explanation', label: 'Explaining Behaviors', icon: '💭' },
  { id: 'strengths_challenges', label: 'Strengths + Challenges', icon: '⭐' },
  { id: 'stress_regulation', label: 'Stress + Regulation', icon: '🧠' },
  { id: 'collaborative_problem_solving', label: 'Problem Solving', icon: '🤝' },
  { id: 'descriptive_feedback', label: 'Observations', icon: '👁️' },
  { id: 'resource_introduction', label: 'Sharing Resources', icon: '📚' }
];