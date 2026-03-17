# Mock Interview Engine

## Name

Universal Storytelling Interview Engine (USIE)

Signature line:

`If a child understands you, an interviewer will trust you.`

## Launch state

- Audio and video mock interviews remain disabled in-product.
- The visible button label stays: `Soon you can experience this.`
- The engine contract, prompt blueprint, and evaluation rubric are defined now so the feature can be enabled without redesigning the intelligence layer later.

## Core product goal

USIE is not a normal answer generator. It is a communication operating system that trains users to:

- understand deeply
- think clearly
- speak simply
- structure answers naturally
- use storytelling as a competitive advantage

## Core differentiator

- Frameworks stay invisible.
- Story stays visible.
- Situation, problem, action, and outcome should appear naturally inside narrative instead of being presented as a template.

## Dual engine

### Story mode

Primary layer.

The response should:

- start with a relatable scenario
- use people, stakes, and context
- create emotional and logical connection
- sound like a conversation, not a script

### Interview mode

Secondary layer.

The response should:

- extract a crisp answer from the story
- preserve structure under pressure
- make the candidate sound sharp without sounding rehearsed

## Universal understanding layer

Every core concept must be explained through three simultaneous lenses:

### Intuition test

- ultra-simple
- visual
- no jargon
- instant logic

Example style:

`Think of it like a gatekeeper deciding who gets in.`

### Child test

- playful
- cause and effect
- toy, school, or game analogies

### Elder test

- calm
- practical
- low-jargon
- grounded in real life

## Mandatory response flow

1. Story setup
2. Confusion point
3. Universal explanation across all three lenses
4. Story resolution
5. Interview answer with hidden structure
6. Real-world depth: tools, systems, tradeoffs, edge cases
7. Follow-up questions
8. Mock interview turn-taking
9. Scored feedback
10. Prep roadmap

## Feedback rubric

The engine must score:

- Clarity
- Storytelling
- Structure
- Depth
- Simplicity
- Grandmother Score

Grandmother Score definition:

- Can a non-technical person understand the answer and trust the speaker?

## Adaptation rules

- Beginners get more story and guided simplification.
- Advanced users get tighter answers, sharper tradeoffs, and stronger follow-up pressure.
- The engine must handle deep topic areas including IAM, Azure AD, networking, DevOps, security, system design, and product thinking.

## Data to retain when feature is enabled

- session mode: audio, video, or text
- interview topic
- candidate answer
- per-metric scores
- mistakes and repeated confusion points
- weak areas
- follow-up pressure points
- improvement history

## Implementation note

The reusable prompt builder and scoring blueprint live in:

- [mockInterviewEngine.ts](/Users/raghunathbagalkote/Desktop/Thewaytointerview/src/lib/ai/mockInterviewEngine.ts)

This allows the disabled UI modules to be activated later with the correct intelligence contract instead of retrofitting the system after launch.
