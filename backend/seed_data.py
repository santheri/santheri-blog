import re
from datetime import datetime
from sqlalchemy.orm import Session
import models

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text).strip('-')
    return text

SAMPLE_POSTS = [
    {
        "title": "What Are Tokens and How Do They Get Used Up?",
        "slug": "what-are-tokens",
        "category": "Technology",
        "font_style": "mono",
        "description": "I started thinking about tokens after hitting the token limit while working on an AI project.",
        "reading_time": "3 min read",
        "cover_image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        "content": """I started thinking about tokens when I hit the token limit while working on an AI project.

Until then, I had heard the word "token" countless times, but I had never really stopped to think about what a token actually was.

## So, what is a token?

A token is a small piece of text that a language model processes. It isn't necessarily a whole word.

A token can be a complete word, part of a word, punctuation, or even a space-related piece of text. For example, a sentence that looks short to us can be split into several tokens before it reaches the model.

```python
# Conceptual tokenization
prompt = "Hi, I'm Santheri."
tokens = tokenizer.encode(prompt)
print(f"Token count: {len(tokens)}")
```

## Why do tokens matter?

Whenever we interact with an AI model, there is a limit to how much text the model can process at once. That includes more than just the message we are currently typing.

The conversation history, instructions, previous responses, and the new prompt can all contribute to the context being processed. This is why a conversation can eventually hit a context or token limit even when the individual messages don't look particularly large.

## The moment I started thinking about it

I was working on an AI application when I suddenly hit the token limit. My first thought was basically:

> Wait. What exactly is being counted here?

That made me realize that understanding tokens isn't just something useful for people building language models. It matters when we're building applications around them too.

## More to come

I'm still learning how different models handle context, tokenization, context windows, and long conversations. This is my attempt to understand it by writing it down."""
    },
    {
        "title": "Vizag Colony Backwaters",
        "slug": "vizag-colony-backwaters",
        "category": "Travel",
        "font_style": "serif",
        "description": "A one-day road trip from Hyderabad to Vizag Colony Backwaters — with a lot of driving, a little cricket, unexpected rain, and a surprisingly difficult search for lunch.",
        "reading_time": "6 min read",
        "cover_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "content": """Most of the things I've written here so far have been about technology — things I've been learning, building, or randomly thinking about while working on something.

But this time, I thought I'd take a break from all the technical stuff.

We had a long weekend recently, thanks to **Gandhi Jayanti — Bappuji's birthday** — and we'd been looking forward to taking a trip for quite some time. So when the long weekend finally came, we decided to make the most of it and planned a one-day road trip.

After looking at a few places, we settled on **Vizag Colony Backwaters in Azmapur, Telangana**.

It's roughly a three-hour drive from Gachibowli, which made it just about perfect for a day trip. We rented a car and started around 9 in the morning.

There were four of us — me, Saurav, Abhay and Ashwina.

## The journey there

Our first stop was Bengaluru Bhavan for breakfast. After that, we were ready to start the actual journey.

The first part of the drive was through the ORR. There wasn't much traffic, and the drive was quite smooth. Once we exited the ORR, the surroundings changed completely. The road became quieter, with open land and greenery on either side. It didn't feel like we were anywhere close to Hyderabad anymore.

## We had arrived

It was **very sunny**.

We had reached right in the middle of the afternoon, and the heat was quite intense. But the place itself was beautiful.

There were open stretches of land, the backwaters, goats grazing around the fields and very little of the noise you normally associate with a city. It felt very rural.

> "Boating? Boating?"

There were local boatmen calling out across the shore. We walked around, looked at the horizon, and somehow decided that playing cricket in the afternoon sun was a good idea. It was exhausting, but it was one of those completely unplanned parts of the trip that ended up being memorable.

## And then it rained

The drive back was when the weather decided to change. It suddenly became cloudy, followed by a gentle drizzle. After the blazing afternoon sun, the cloudy sky and glistening tarmac felt miraculous."""
    },
    {
        "title": "The Art of Slowing Down in an Accelerating World",
        "slug": "art-of-slowing-down",
        "category": "Life",
        "font_style": "editorial",
        "description": "Observations on finding stillness, uncoupling identity from output, and learning to enjoy the quiet hours between major milestones.",
        "reading_time": "4 min read",
        "cover_image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
        "content": """When you spend most of your waking hours working with machines that run at gigahertz speeds, your mind gradually starts expecting life to operate at the same cadence.

Responses should be immediate. Projects should finish in sprints. Progress must be continuous, measurable, and tracked on a dashboard.

Yet every genuine realization I've had about myself, my friendships, or even difficult architectural problems has happened during moments when I deliberately stepped away from the screen.

## The Trap of Constant Productivity

Modern knowledge work fosters a subtle illusion: that unspent time is wasted time. If you aren't reading documentation, shipping a commit, or optimizing a routine, there is a lingering sense of guilt.

> "Busyness is not a badge of honor. It is often a mechanism we use to avoid sitting alone with our thoughts."

I noticed this especially during weekends. Even when supposedly taking time off, I would compulsively check notifications, draft mental to-do lists, and treat leisure as something that needed to be optimized.

## Rediscovering Unstructured Time

Lately, I have been trying an experiment: reserving Sunday mornings for things with zero quantifiable output.

- Walking without headphones or podcasts playing in the background.
- Brewing filter coffee without checking Twitter or Slack while waiting for the drip.
- Writing long-form thoughts in a physical notebook with a fountain pen.

At first, the silence feels unnerving. Your brain craves dopamine hits and rapid inputs. But after twenty minutes, a peculiar clarity sets in. The mental noise recedes, leaving space for genuine creativity to breathe.

## Moving Forward

Building great software and living a meaningful life are not opposing goals. In fact, deep, deliberate work requires deep, deliberate rest.

Slowing down isn't about doing less; it's about doing what matters with your whole presence."""
    }
]

def seed_default_posts(db: Session):
    existing_count = db.query(models.Post).count()
    if existing_count == 0:
        print("Database is empty. Seeding initial posts for Travel, Technology, and Life...")
        for post_data in SAMPLE_POSTS:
            post = models.Post(
                title=post_data["title"],
                slug=post_data["slug"],
                category=post_data["category"],
                font_style=post_data.get("font_style", "serif"),
                description=post_data["description"],
                content=post_data["content"],
                cover_image=post_data.get("cover_image"),
                reading_time=post_data.get("reading_time", "4 min read"),
                is_draft=False
            )
            db.add(post)
        db.commit()
        print("Default posts seeded successfully.")

SAMPLE_NOTES = [
    {
        "title": "The illusion of immediate comprehension",
        "thought": "Reading about an architecture pattern gives you the feeling of knowing it. Building it and watching edge cases break at 2 AM is when you actually understand it."
    },
    {
        "title": "Why agents need constrained memory, not infinite context",
        "thought": "Expanding the context window is like giving someone a bigger desk. It helps, but if their filing system is broken, more space just means more clutter."
    },
    {
        "title": "Field note: Telangana backroads",
        "thought": "The moment you lose 5G signal on country roads, your attention shifts outward. The trees look sharper, the air smells like damp soil, and you realize how much background mental bandwidth connectivity consumes."
    },
    {
        "title": "On building software with taste",
        "thought": "Speed and features are cheap. Restraint, clarity, and thoughtful typography are expensive because they require deliberate decisions about what NOT to build."
    }
]

def seed_default_notes(db: Session):
    existing_count = db.query(models.Note).count()
    if existing_count == 0:
        print("Notes table is empty. Seeding default field notes...")
        for item in SAMPLE_NOTES:
            note = models.Note(
                title=item["title"],
                thought=item["thought"]
            )
            db.add(note)
        db.commit()
        print("Default notes seeded successfully.")

