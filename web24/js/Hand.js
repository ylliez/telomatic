/* Hand.js
hand class script
defines parameters and function for hand object which manipulates data received from MediaPipe Hands model
creates trail of right index finger tip position and sets value to send to BLE receiver (if multihand use, closest hand is selected)
displays left index finger tip and checks for interactions with GUI elements to modulate drawing parameters and trigger events
*/

class Hand {

  constructor() {
    // holder for hand detection results
    this.predictions = [];
    // number of hands detected
    this.numberHands = undefined;
    // data from detected hands
    this.hands = [];
    // index finger tip data
    this.indexTip = [];
    this.indexTipX = [];
    this.indexTipY = [];
    this.indexGhostX = [];
    this.indexGhostY = [];
    // depth of detected right hands and resulting closest right hand
    this.rightHandsZ = [];
    this.lowestZ;
    // boolean to check if at least one right hand is onscreen
    this.atLeastOneRightHand;
    // value to send to BLE receiver, y-position of closest right index finger tip
    this.bleVal = height;
    // counter for debugging BLE connection send retries
    this.bleKillRetry = 0;
    // size and color of trail drawn by right index finger tips
    this.size = 10;
    this.color = {
      r: 255,
      g: 0,
      b: 127
    }
  }

  update() {
    // get number of hands captured by handpose model
    this.numberHands = this.predictions.multiHandedness.length;
    // reset right hand presence verification and depth values (for BLE only)
    this.atLeastOneRightHand = false;
    this.lowestZ = 999;
    if (this.numberHands > 0) {
      // iterate through hands arrays captured by handpose model
      for (var i = 0; i < this.numberHands; i++) {
        // set index tip value of array
        this.indexTip[i] = this.predictions.multiHandLandmarks[i][8];
        // if a right hand, use index finger tip to draw on screen
        if (this.predictions.multiHandedness[i].label === `Right`) {
          // validate presence of at least one right hand
          this.atLeastOneRightHand = true;
          // save previous index tip position and update current position (relative to window size)
          this.indexGhostX[i] = this.indexTipX[i];
          this.indexGhostY[i] = this.indexTipY[i];
          this.indexTipX[i] = this.indexTip[i].x * width;
          this.indexTipY[i] = this.indexTip[i].y * height;
          // draw line between previous and current index tip position if within threshold distance of each other
          trailBlazer.push();
          // set RGB values of line to draw based on slider position
          trailBlazer.stroke(hand.color.r, hand.color.g, hand.color.b);
          trailBlazer.strokeWeight(hand.size);
          // set maximum distance between previous and current index tip position to prevent jumping between multiple hands
          if (abs(this.indexGhostX[i] - this.indexTipX[i]) < 100 && abs(this.indexGhostY[i] - this.indexTipY[i]) < 100) {
            trailBlazer.line(this.indexGhostX[i], this.indexGhostY[i], this.indexTipX[i], this.indexTipY[i]);
          }
          trailBlazer.pop();
          // determine closest hand and set its index finger tip y-position as BLE send value
          if (this.predictions.multiHandLandmarks[i][0].z < this.lowestZ) {
            this.lowestZ = this.predictions.multiHandLandmarks[i][0].z;
            this.bleVal = this.indexTipY[i];
          }
        }
        // if a left hand, display index finger tip and check for interaction with GUI elements
        else if (this.predictions.multiHandedness[i].label === `Left`) {
          this.indexTipX[i] = this.indexTip[i].x * width;
          this.indexTipY[i] = this.indexTip[i].y * height;
          this.displayLeftIndexTip(this.indexTipX[i], this.indexTipY[i]);
          this.checkGUI(this.indexTipX[i], this.indexTipY[i]);
        }
      }
    }
    // if at least on right hand is onscreen, send selected y-position to BLE receiver
    if (this.atLeastOneRightHand) {
      this.bleKillRetry = 0;
      writeToBLE(this.bleVal);
    } else if (this.bleVal != height || this.bleKillRetry < 2) {
      this.bleVal = height;
      writeToBLE(this.bleVal);
      this.bleKillRetry++;
    }
  }

  // display left index finger tip position
  displayLeftIndexTip(x, y) {
    push();
    fill(255, 255, 255);
    noStroke();
    ellipse(x, y, 15);
    pop();
  }

  // check left index finger tip position overlap with GUI elements
  checkGUI(x, y) {
    // check overlap with color sliders vertical position
    if (y > sliderColYPos && y < sliderColYPos + sliderColHeight && !qrTrig) {
      // check overlap with red slider horizontal position
      if (x > sliderColRXPos && x < sliderColRXPos + sliderColWidth) {
        // adjust red slider value according to index finger tip position
        sliderColR.slider("value", map(x, sliderColRXPos, sliderColRXPos + sliderColWidth, 0, 255));
      }
      // check overlap with green slider horizontal position
      if (x > sliderColGXPos && x < sliderColGXPos + sliderColWidth) {
        // adjust green slider value according to index finger tip position
        sliderColG.slider("value", map(x, sliderColGXPos, sliderColGXPos + sliderColWidth, 0, 255));
      }
      // check overlap with blue slider horizontal position
      if (x > sliderColBXPos && x < sliderColBXPos + sliderColWidth) {
        // adjust blue slider value according to index finger tip position
        sliderColB.slider("value", map(x, sliderColBXPos, sliderColBXPos + sliderColWidth, 0, 255));
      }
    }
    // check overlap with size slider vertical position
    if (y > sliderSizeYPos && y < sliderSizeYPos + sliderSizeHeight && !qrTrig) {
      // check overlap with size slider horizontal position
      if (x > sliderSizeXPos - sliderSizeRad && x < sliderSizeXPos + sliderSizeRad) {
        // adjust size slider value and slider handle size according to index finger tip position
        let sliderSizeDims = map(y, sliderSizeYPos, sliderSizeYPos + sliderSizeHeight, 30, 1);
        sliderSize.slider("value", sliderSizeDims);
        sliderSizeHandle.style.width = `${sliderSizeDims}px`;
        sliderSizeHandle.style.height = `${sliderSizeDims}px`;
        sliderSizeHandle.style.left = `-${sliderSizeDims/2}px`;
      }
    }
    // check overlap with buttons vertical position
    if (y > buttonClearYPos && y < buttonClearYPos + buttonClearHeight && !qrTrig) {
      // check overlap with clear button horizontal position
      if (x > buttonClearXPos && x < buttonClearXPos + buttonClearWidth) {
        // clear graphics element
        trailBlazer.clear();
      }
      // check overlap with QR button horizontal position
      if (x > buttonQRXPos && x < buttonQRXPos + buttonQRWidth) {
        // trigger screenshot and QR code generation
        triggerQR();
      }
    }
  }

}
