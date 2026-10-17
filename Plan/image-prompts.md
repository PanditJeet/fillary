# Fillary: new coloring pages (ChatGPT prompts)

## 1. Paste this into ChatGPT first (once per chat)

```
I'm making a children's tap-to-fill coloring app. Please generate coloring-page line art following these rules exactly for every image I ask for in this chat:

STYLE
- Cute, friendly cartoon style for kids aged 4–10, with big rounded shapes and happy faces.
- Pure black lines on a pure white background. No grey, no shading, no gradients, no hatching, no texture, no colour at all.
- All lines bold and the same thickness everywhere (thick marker style, roughly 1% of the image width).

FILL-FRIENDLY RULES (very important)
- Every shape must be fully closed: lines must touch and join exactly, with no gaps or breaks anywhere.
- No loose or dangling strokes: no short fur, hair or grass strokes that end in empty space, and no decorative lines that don't connect to other lines at both ends.
- No sketchy, double or overlapping lines.
- No tiny areas smaller than a fingertip, no dots, specks or stippling. Keep small details (eyes, buttons, flowers) simple and large.
- Eye highlights should be simple white circles inside solid black pupils.
- No text, letters, numbers or words anywhere (no signs, book titles or labels).
- Medium detail: a clear main character plus a simple background with large, easy-to-colour areas.

FORMAT
- Square image, 1024 × 1024 pixels, the whole scene filling the square, with no border or frame.

Reply "Ready" and then I'll send you each picture description one at a time.
```

If ChatGPT starts ignoring the rules (grey shading, text, thin sketchy lines), start a new chat and paste the prompt again.
If one image has shading or text, reply: `Regenerate without any grey shading or text, following the rules.`

## 2. Then send these one at a time

Save each image with the file name shown, in `C:\Fillary\new-pictures\` (or attach them in the chat with Claude).

### Animals
| # | Send to ChatGPT | Save as |
|---|---|---|
| 1 | Picture: A cheerful, adorable puppy with big sparkling eyes, a tennis ball and a cute doghouse in a garden. | `puppy-playtime.png` |
| 2 | Picture: An adorable fluffy kitten playing with a ball of yarn among garden tulips and a few big butterflies. | `kitten-yarn.png` |
| 3 | Picture: A happy, sweet bunny rabbit hugging a giant carrot, surrounded by a few smiling sunflowers. | `bunny-carrot.png` |
| 4 | Picture: A joyful baby panda holding bamboo stalks in a flowering blossom grove. | `baby-panda.png` |
| 5 | Picture: A friendly little fox with a big fluffy tail sitting in an autumn forest with acorns and mushrooms. | `fox-autumn.png` |
| 6 | Picture: A playful baby lion cub batting at a butterfly in the savanna under a smiling sun. | `lion-cub.png` |
| 7 | Picture: A super cute chubby hamster munching a giant sunflower seed among berries and flowers. | `hamster-snack.png` |
| 8 | Picture: A leaping dolphin and a smiling baby sea turtle swimming through big waves with starfish and bubbles. | `dolphin-ocean.png` |

### Kids and adventures
| # | Send to ChatGPT | Save as |
|---|---|---|
| 9 | Picture: A cute little astronaut kid floating in space with smiling planets, stars and a rocket ship. | `human-astronaut.png` |
| 10 | Picture: A cheerful kid chef with a tall chef hat next to a giant cupcake with frosting and a cherry, in a simple kitchen. | `human-chef.png` |
| 11 | Picture: A confident superhero kid with a flowing cape and a star on the chest, standing on a rooftop above a simple city. | `superhero-kid.png` |
| 12 | Picture: A cheerful little gardener kid planting seedlings with a watering can, a friendly kitten and big flowers. | `gardener-boy.png` |
| 13 | Picture: A joyful kid sitting on the grass playing a ukulele next to a happy puppy, with trees and clouds. | `ukulele-player.png` |
| 14 | Picture: A happy little painter kid in a beret painting mountains on an easel, with a sleeping kitty nearby. | `canvas-painter.png` |
| 15 | Picture: A brave little knight kid holding a sword and a shield with a lion on it, next to a cute baby dragon, with a castle behind. | `brave-knight.png` |
| 16 | Picture: A smiling ballerina girl in a fluffy tutu dancing on her toes in a simple dance studio with a big window. | `ballerina-girl.png` |
| 17 | Picture: A cheerful kid scuba diver with a mask and flippers swimming with a sea turtle, a manta ray, fish and coral. | `scuba-diver.png` |
| 18 | Picture: A cute young wizard kid in a starry hat casting big stars from a magic wand, with an owl and a kitten. | `wizard-apprentice.png` |
| 19 | Picture: A cozy kid inside a blanket fort reading a storybook, with a mug, a pillow and a sleeping kitten. | `cozy-reader.png` |
| 20 | Picture: A curious young scientist kid with safety goggles looking at bubbling test tubes and a microscope on a table. | `junior-scientist.png` |

### Magical friends
| # | Send to ChatGPT | Save as |
|---|---|---|
| 21 | Picture: An enchanted baby unicorn with a spiral horn and curly mane sitting on a rainbow among clouds and big stars. | `unicorn-rainbow.png` |
| 22 | Picture: A cute little owl wearing a wizard hat with stars, holding a magic wand, with a spellbook and potion bottles. | `wizard-owl.png` |
| 23 | Picture: A magical cartoon fox with three fluffy tails curled up on a smiling crescent moon among big stars. | `celestial-kitsune.png` |
| 24 | Picture: A lovable baby dragon with tiny wings sitting on a soft cloud with big twinkling stars and a moon. | `baby-dragon.png` |

## 3. What happens next

Claude converts each image to a clean, lossless PNG, automatically checks it for gaps, leaks and tiny pockets, fixes small problems, and swaps it into the app. Any image that is too messy to fix gets flagged so you can regenerate it.
