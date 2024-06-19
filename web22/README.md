# Project 2: *DigiPaint*

## [Assignment](https://pippinbarr.github.io/cart263/projects/project2/)
## [Proposal](https://github.com/ylliez/CART263/tree/main/projects/proj02_proposal)  

## Artist's Statement
*DigiPaint* is an exploration of post-digital intersubjectivity, seeking to create playfully engaging alternatives to the isolation and dematerialization of contemporary interpersonal landscapes through a collective embodied online drawing experience. A product of increasing virtualization specifically accelerated by the pandemic years spent online and at a distance, this isolation - reduced to gamified social algorithms - hampers our interpersonal development, while the related albeit distinct dematerialization results in individual disembodiment and interindividual fractures. *DigiPaint* endeavours to repurpose the tools of these ill-fated phenomena to foster a collective ludic activity engaging the body and resulting in collaborative artistic creations.<br><br>
The viewer initially engages with the piece through a web application proposing an augmented reality drawing activity using machine-learning trained models allowing real-time hand pose detection. Using their right index finger, they trace a line of which the weight and colour can be modulated with the left index finger. This digital finger-painting canvas is superposed on the webcam video feed. The viewer can then take a screenshot of their drawing, which is uploaded to a gallery and echoed back to the viewer as a scannable QR code, as well as access the gallery of previous viewers' drawings, a collage that can be used as a meta-canvas for a random *cadavre exquis* or an intentional *générateur poïétique*.<br><br>
Artistically, the output entirely depends on the user's decisions and - especially - collaboration, a laissez-faire social experiment approach I value in art (e.g. the recently re-popularized [r/place](https://www.reddit.com/r/place/) or it's lesser known but more epistemically compelling sibling [r/thebutton](https://www.reddit.com/r/thebutton/)). Technically, the application rests on a structure of HTML & CSS, is scripted in Javascript & PHP, and implements [p5.js](https://p5js.org/), [jQuery](https://jquery.com/) for DOM manipulations, [jQueryUI](https://jqueryui.com/) for GUI element generation, [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) for hand position detection and [QRCode.js](https://github.com/davidshimjs/qrcodejs) for QR code generation and formatting. A few elements were achieved with expected difficulty and extensive help from Sabine Rosenberg (e.g. PHP scripting and server implementation), while others revealed themselves to be more challenging than anticipated (e.g. CSS and jQueryUI GUI formatting in the context of contactless interaction). Ultimately, while not as aesthetically impressive or phenomenologically moving as I would have wished, the hard-earned functionality has been rewarding. Now up to the user.

## [Online](https://hybrid.concordia.ca/i_planch/telomatic/)

## [Source](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomatic)

## Archived Versions
- [V1: pre-MediaPipe (ml5+tGUI+BLE)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV1)
- [V2: pre-PHP/server (MP+tGUI+BLE+QRish)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV2)
- [V3: pre-buttons (MP+tGUI+BLE+QR)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV3)
- [V4: pre-gallery (MP+tGUI+BLE+QR+jQuery)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV4)
- [V5: pre-BLE debugging (MP+tGUI+BLEish+QR+jQuery)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV5)
- [V6: pre-cleanup (MP+tGUI+BLE+QR+jQuery)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV6)
- [V7: pre-GUI overhaul (MP+tGUI+BLE+QR+jQuery)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV7)
- [V8: pre-dynamic capture (MP+BLE+QR+jQuery+jQueryUI)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV8t)
- [V9: pre-dynamic GUI (MP+BLE+QR+jQuery+jQueryUI)](https://github.com/ylliez/CART263/tree/main/projects/proj02_telomaticV9d)
