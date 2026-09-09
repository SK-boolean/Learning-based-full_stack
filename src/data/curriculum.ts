import { LevelData } from '../types';

export const CURRICULUM_LEVELS: LevelData[] = [
  {
    id: 1,
    title: "Level 1: Sensory & Shapes",
    subtitle: "Foundations & Recognition",
    focusArea: "Pattern Recognition & Calibrated Motor Control",
    badgeName: "Pattern Explorer",
    badgeIcon: "🔷",
    themeColor: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-700",
    },
    learnConcepts: [
      {
        title: "Recognizing Basic Shapes",
        description: "Everything in our world has a shape! Circles are round like a coin or clock, squares have four equal sides like a box.",
        icon: "⭕",
        example: "Berry's clock is a circle! Berry's lunchbox is a rectangle."
      },
      {
        title: "Identifying Colors & Sorting",
        description: "Colors help us group things together. Red apples go in the red bin, green apples in the green bin.",
        icon: "🎨",
        example: "Sorting items helps shops keep their shelves neat and organized!"
      },
      {
        title: "Expressing Basic Needs",
        description: "You can point to or tap icons when you need water, food, a quiet break, or assistance.",
        icon: "💧",
        example: "Tapping 'Water' lets your mentor know you are thirsty right away."
      }
    ],
    practiceQuestions: [
      {
        id: "l1-q1",
        prompt: "Help Berry find the Circle shape!",
        subtext: "Look for the shape with no sharp corners.",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Square", icon: "⏹️", isCorrect: false },
          { id: "opt-2", text: "Circle", icon: "🟡", isCorrect: true, helperTip: "Great job! A circle is perfectly round!" },
          { id: "opt-3", text: "Triangle", icon: "🔺", isCorrect: false }
        ],
        berryHint: "Circles roll like a ball or a coin!"
      },
      {
        id: "l1-q2",
        prompt: "Which basket has RED fruits?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Red Strawberries", icon: "🍓", isCorrect: true },
          { id: "opt-2", text: "Blue Blueberries", icon: "🫐", isCorrect: false },
          { id: "opt-3", text: "Yellow Lemons", icon: "🍋", isCorrect: false }
        ],
        berryHint: "Strawberries are warm bright red!"
      },
      {
        id: "l1-q3",
        prompt: "Berry feels tired and needs a quiet rest. Which icon helps Berry?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Loud Music", icon: "📢", isCorrect: false },
          { id: "opt-2", text: "Quiet Calm Zone", icon: "🧘", isCorrect: true, helperTip: "Taking calm breaths helps recharge our energy!" },
          { id: "opt-3", text: "Running Race", icon: "🏃", isCorrect: false }
        ],
        berryHint: "Look for the peaceful meditating figure."
      }
    ],
    testQuestions: [
      {
        id: "l1-t1",
        prompt: "Select the shape that matches a coin (₹):",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Circle", icon: "🟡", isCorrect: true },
          { id: "opt-2", text: "Triangle", icon: "🔺", isCorrect: false },
          { id: "opt-3", text: "Star", icon: "⭐", isCorrect: false }
        ],
        berryHint: "Coins are round so they roll easily!"
      },
      {
        id: "l1-t2",
        prompt: "Help Berry sort: Pick the GREEN item for the grocery shelf.",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Red Apple", icon: "🍎", isCorrect: false },
          { id: "opt-2", text: "Fresh Broccoli", icon: "🥦", isCorrect: true },
          { id: "opt-3", text: "Orange Carrot", icon: "🥕", isCorrect: false }
        ],
        berryHint: "Broccoli has crisp green leaves and stems!"
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: Numbers & Words",
    subtitle: "Functional Literacy & Numeracy",
    focusArea: "Counting Quantities & Everyday Signs",
    badgeName: "Word & Number Master",
    badgeIcon: "🔢",
    themeColor: {
      bg: "bg-sky-50",
      border: "border-sky-300",
      text: "text-sky-800",
      badge: "bg-sky-100 text-sky-700",
    },
    learnConcepts: [
      {
        title: "Counting Objects Up to 10",
        description: "We count items one-by-one by pointing and speaking each number: 1, 2, 3, 4, 5!",
        icon: "🖐️",
        example: "Count the apples in the bag before giving them to the customer."
      },
      {
        title: "Recognizing Life Safety Words",
        description: "Signs keep us safe in stores and stations: STOP (red), PUSH / PULL (on doors), OPEN / CLOSED.",
        icon: "🛑",
        example: "Always check if the store door says 'PUSH' or 'PULL' before entering."
      },
      {
        title: "Reading Morning vs Evening Time",
        description: "The sun is up in the Morning (work & study time). The moon is up at Night (rest time).",
        icon: "☀️",
        example: "Our shift starts at 9:00 in the morning!"
      }
    ],
    practiceQuestions: [
      {
        id: "l2-q1",
        prompt: "Count the mangoes: 🥭 🥭 🥭. How many are there?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "2 Mangoes", icon: "2️⃣", isCorrect: false },
          { id: "opt-2", text: "3 Mangoes", icon: "3️⃣", isCorrect: true, helperTip: "1... 2... 3! Exactly three sweet mangoes!" },
          { id: "opt-3", text: "5 Mangoes", icon: "5️⃣", isCorrect: false }
        ],
        berryHint: "Tap each mango one by one: one, two, three!"
      },
      {
        id: "l2-q2",
        prompt: "Which sign tells you the shop door is ready to walk in?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "OPEN", icon: "🟢", isCorrect: true },
          { id: "opt-2", text: "CLOSED", icon: "🔴", isCorrect: false },
          { id: "opt-3", text: "DANGER", icon: "⚠️", isCorrect: false }
        ],
        berryHint: "OPEN has green letters and means welcome inside!"
      },
      {
        id: "l2-q3",
        prompt: "Which number is BIGGER?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "3", icon: "3️⃣", isCorrect: false },
          { id: "opt-2", text: "8", icon: "8️⃣", isCorrect: true, helperTip: "8 is much more than 3!" },
          { id: "opt-3", text: "1", icon: "1️⃣", isCorrect: false }
        ],
        berryHint: "8 comes after 7 and is bigger than 3."
      }
    ],
    testQuestions: [
      {
        id: "l2-t1",
        prompt: "A customer wants 4 bottles of water. 🧴 🧴 🧴 🧴 Pick the matching number:",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "3 Bottles", isCorrect: false },
          { id: "opt-2", text: "4 Bottles", isCorrect: true },
          { id: "opt-3", text: "6 Bottles", isCorrect: false }
        ],
        berryHint: "Count: one, two, three, four!"
      },
      {
        id: "l2-t2",
        prompt: "What should you do when you see the red 'STOP' sign?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Pause & wait safely", icon: "🛑", isCorrect: true },
          { id: "opt-2", text: "Run fast", icon: "🏃", isCorrect: false },
          { id: "opt-3", text: "Shout loud", icon: "📢", isCorrect: false }
        ],
        berryHint: "Stop means freeze and check the road or doorway."
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: Money & Management",
    subtitle: "Real-World Currency & Routines",
    focusArea: "Handling Indian Rupees (₹) & Counting Change",
    badgeName: "Cash Counter Specialist",
    badgeIcon: "🪙",
    themeColor: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-700",
    },
    learnConcepts: [
      {
        title: "Recognizing Indian Currency Coins",
        description: "Coins come in ₹1, ₹2, ₹5, and ₹10 values. ₹10 is two ₹5 coins added together!",
        icon: "🪙",
        example: "Two ₹5 coins = ₹10. Ten ₹1 coins = ₹10."
      },
      {
        title: "Making Small Purchases",
        description: "If a pencil costs ₹5 and you pay ₹10, the shopkeeper gives you ₹5 back in change.",
        icon: "✏️",
        example: "₹10 paid - ₹5 price = ₹5 change returned to customer!"
      },
      {
        title: "The 3-Step Work Day Routine",
        description: "1. Wear clean apron & ID badge. 2. Arrive on time. 3. Check inventory shelves.",
        icon: "📋",
        example: "Checking off a 3-step checklist makes work predictable and calm."
      }
    ],
    practiceQuestions: [
      {
        id: "l3-q1",
        prompt: "Berry buys an apple for ₹5 and a banana for ₹5. What is the TOTAL bill?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "₹8", isCorrect: false },
          { id: "opt-2", text: "₹10", isCorrect: true, helperTip: "₹5 + ₹5 = ₹10! Exactly right!" },
          { id: "opt-3", text: "₹15", isCorrect: false }
        ],
        berryHint: "Add five plus five on your fingers!"
      },
      {
        id: "l3-q2",
        prompt: "A customer hands you a ₹20 note for a ₹15 milk packet. How much change do you return?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "₹5 Coin", icon: "🪙", isCorrect: true, helperTip: "₹20 minus ₹15 equals ₹5!" },
          { id: "opt-2", text: "₹10 Coin", icon: "🪙", isCorrect: false },
          { id: "opt-3", text: "₹2 Coin", icon: "🪙", isCorrect: false }
        ],
        berryHint: "Count up from 15 to 20: 16, 17, 18, 19, 20... that's 5!"
      },
      {
        id: "l3-q3",
        prompt: "Which pair of coins equals ₹10?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Two ₹5 Coins (₹5 + ₹5)", icon: "🪙🪙", isCorrect: true },
          { id: "opt-2", text: "Two ₹2 Coins (₹2 + ₹2)", icon: "🪙🪙", isCorrect: false },
          { id: "opt-3", text: "One ₹1 Coin + One ₹2 Coin", icon: "🪙🪙", isCorrect: false }
        ],
        berryHint: "Two five-rupee coins make a ten-rupee coin!"
      }
    ],
    testQuestions: [
      {
        id: "l3-t1",
        prompt: "Customer buys 3 biscuits at ₹10 each. Total cost is:",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "₹20", isCorrect: false },
          { id: "opt-2", text: "₹30", isCorrect: true },
          { id: "opt-3", text: "₹40", isCorrect: false }
        ],
        berryHint: "Count by tens: 10... 20... 30!"
      },
      {
        id: "l3-t2",
        prompt: "Customer gives ₹50 for a ₹40 bill. What change should you give?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "₹10", isCorrect: true },
          { id: "opt-2", text: "₹5", isCorrect: false },
          { id: "opt-3", text: "₹20", isCorrect: false }
        ],
        berryHint: "50 minus 40 leaves 10!"
      }
    ],
    vocationalSimulation: {
      storeName: "Berry's Corner Kirana & Grocery",
      customerPersona: "Auntie Priya",
      orderItems: [
        { name: "Organic Apples", icon: "🍎", price: 10, quantity: 2 },
        { name: "Fresh Milk", icon: "🥛", price: 20, quantity: 1 }
      ],
      totalCost: 40,
      customerSpeech: "Namaste beta! I would like 2 apples and 1 packet of fresh milk please.",
      expectedResponsePhrase: "Namaste! That will be ₹40 in total please."
    }
  },
  {
    id: 4,
    title: "Level 4: Social & Workplace Talk",
    subtitle: "Customer Service & Emotion Signals",
    focusArea: "Clear Communication, AAC Cards, & De-escalation",
    badgeName: "Customer Ambassador",
    badgeIcon: "💬",
    themeColor: {
      bg: "bg-indigo-50",
      border: "border-indigo-300",
      text: "text-indigo-800",
      badge: "bg-indigo-100 text-indigo-700",
    },
    learnConcepts: [
      {
        title: "Greeting Customers with Warmth",
        description: "Saying 'Hello / Namaste, how may I help you?' makes customers feel welcome and respected.",
        icon: "🙏",
        example: "Smile gently or tap Berry's speech card to speak for you in a clear, friendly voice."
      },
      {
        title: "Reading Customer Emotions",
        description: "If a customer is smiling, they are pleased. If their eyebrows are furrowed, they might need quick assistance or a supervisor.",
        icon: "😊",
        example: "Berry shows emotion badges to help train facial expression recognition."
      },
      {
        title: "Asking for Supervisor Help Calmly",
        description: "If a customer has a complicated question, say: 'Please wait a moment, I will call my manager to help you.'",
        icon: "🤝",
        example: "Asking for help is a sign of a great team worker!"
      }
    ],
    practiceQuestions: [
      {
        id: "l4-q1",
        prompt: "A customer arrives at your counter. What is the BEST first thing to say?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "'Why are you here?'", isCorrect: false },
          { id: "opt-2", text: "'Namaste! Welcome, how may I help you today?'", icon: "🙏", isCorrect: true, helperTip: "Polite greetings build trust immediately!" },
          { id: "opt-3", text: "Look at the floor silently", isCorrect: false }
        ],
        berryHint: "A polite greeting with a soft smile is always number one."
      },
      {
        id: "l4-q2",
        prompt: "Look at Berry's face: 😊 Eyes are bright and mouth is smiling. How does Berry feel?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Happy & Friendly", icon: "😊", isCorrect: true },
          { id: "opt-2", text: "Angry & Upset", icon: "😠", isCorrect: false },
          { id: "opt-3", text: "Scared", icon: "😨", isCorrect: false }
        ],
        berryHint: "Bright eyes and an upward smile mean happiness!"
      },
      {
        id: "l4-q3",
        prompt: "A customer has a difficult return with no receipt. What should you say?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "'Please wait a moment, let me call our supervisor to assist you.'", icon: "🤝", isCorrect: true },
          { id: "opt-2", text: "'Go away!'", isCorrect: false },
          { id: "opt-3", text: "'I will shout!'", isCorrect: false }
        ],
        berryHint: "Calling a supervisor handles tough issues calmly."
      }
    ],
    testQuestions: [
      {
        id: "l4-t1",
        prompt: "When handing a shopping bag and receipt to a customer, what do you say?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "'Thank you, have a wonderful day!'", icon: "🌟", isCorrect: true },
          { id: "opt-2", text: "'Hurry up now'", isCorrect: false },
          { id: "opt-3", text: "'Don't come back'", isCorrect: false }
        ],
        berryHint: "Thank you is the magic phrase in customer service."
      },
      {
        id: "l4-t2",
        prompt: "If you feel sensory overload during a loud store rush, what is the right step?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "Tap your Calm Break card and notify your mentor for a 3-minute breather", icon: "🧘", isCorrect: true },
          { id: "opt-2", text: "Drop items on the floor", isCorrect: false },
          { id: "opt-3", text: "Run outside", isCorrect: false }
        ],
        berryHint: "Communicating your need for a calm pause keeps you safe."
      }
    ]
  },
  {
    id: 5,
    title: "Level 5: Vocational Work Sandbox",
    subtitle: "Job-Ready Billing & Micro-Tasks",
    focusArea: "Store Checkout, Inventory Log, & Financial Independence",
    badgeName: "Certified Retail Associate",
    badgeIcon: "💼",
    themeColor: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-800",
      badge: "bg-purple-100 text-purple-700",
    },
    learnConcepts: [
      {
        title: "Operating the Digital Billing Counter",
        description: "Scan or select items requested by the customer, watch the subtotal calculate automatically, and check payment.",
        icon: "🖥️",
        example: "Items: Rice (₹50) + Dal (₹30) = Total ₹80."
      },
      {
        title: "Inventory Stock Verification",
        description: "Count boxes on the shelf and enter the number in the inventory sheet. Accurate counts keep stores running smoothly!",
        icon: "📦",
        example: "Received 12 boxes, sold 4 boxes. Inventory remaining: 8 boxes."
      },
      {
        title: "Earning & Saving Income",
        description: "Completing shifts earns verified micro-stipends credited to your inclusive bank account or digital wallet.",
        icon: "💳",
        example: "Financial independence means supporting yourself with dignified, respected work!"
      }
    ],
    practiceQuestions: [
      {
        id: "l5-q1",
        prompt: "Inventory task: Berry received 15 boxes of tea. You sold 5 boxes today. How many boxes remain?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "8 boxes", isCorrect: false },
          { id: "opt-2", text: "10 boxes", icon: "📦", isCorrect: true, helperTip: "15 - 5 = 10 boxes left on the shelf!" },
          { id: "opt-3", text: "20 boxes", isCorrect: false }
        ],
        berryHint: "Subtract 5 from 15: 15 minus 5 is 10!"
      },
      {
        id: "l5-q2",
        prompt: "Invoice Data Entry: The paper bill says: 1 Sugar Bag (₹45) + 1 Tea Box (₹25). Total is:",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "₹70", isCorrect: true, helperTip: "45 + 25 = ₹70 exactly!" },
          { id: "opt-2", text: "₹60", isCorrect: false },
          { id: "opt-3", text: "₹80", isCorrect: false }
        ],
        berryHint: "45 + 5 is 50, plus 20 more is 70."
      },
      {
        id: "l5-q3",
        prompt: "A customer pays ₹100 note for a ₹70 invoice. Which notes/coins do you return as change?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "One ₹20 note + One ₹10 note (= ₹30)", icon: "💵🪙", isCorrect: true },
          { id: "opt-2", text: "One ₹10 note (= ₹10)", isCorrect: false },
          { id: "opt-3", text: "Two ₹50 notes (= ₹100)", isCorrect: false }
        ],
        berryHint: "100 minus 70 is 30. Twenty plus ten is thirty!"
      }
    ],
    testQuestions: [
      {
        id: "l5-t1",
        prompt: "Customer order: 2 Juice Bottles (₹20 each) + 1 Biscuit (₹10). Customer hands you ₹50. Change owed is:",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "No change (Exact ₹50)", isCorrect: true, helperTip: "₹20 + ₹20 + ₹10 = ₹50! Exactly paid!" },
          { id: "opt-2", text: "₹10 change", isCorrect: false },
          { id: "opt-3", text: "₹5 change", isCorrect: false }
        ],
        berryHint: "20 + 20 = 40, plus 10 = 50. The bill is exactly fifty!"
      },
      {
        id: "l5-t2",
        prompt: "In the shop inventory: Morning stock was 24 items. Evening count is 18 items. How many were sold today?",
        type: "multiple-choice",
        options: [
          { id: "opt-1", text: "6 items sold", icon: "📈", isCorrect: true },
          { id: "opt-2", text: "12 items sold", isCorrect: false },
          { id: "opt-3", text: "2 items sold", isCorrect: false }
        ],
        berryHint: "24 minus 18 is 6 items sold!"
      }
    ],
    vocationalSimulation: {
      storeName: "Inclusive Retail & Mart - Checkout Station #2",
      customerPersona: "Mr. Rajesh (Regular Customer)",
      orderItems: [
        { name: "Basmati Rice (1kg)", icon: "🍚", price: 50, quantity: 1 },
        { name: "Toor Dal (500g)", icon: "🍲", price: 30, quantity: 1 },
        { name: "Tea Leaves Packet", icon: "☕", price: 20, quantity: 1 }
      ],
      totalCost: 100,
      customerSpeech: "Hello friend! Here are my groceries. I have a ₹100 note ready.",
      expectedResponsePhrase: "Thank you Mr. Rajesh! Total is ₹100. That's exact payment. Here is your receipt!"
    }
  }
];
