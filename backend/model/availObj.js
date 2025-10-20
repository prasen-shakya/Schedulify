class Availability {
  constructor(availID, ownerID, event, beginSlot, endSlot) {
    this.availID = availID;
    this.ownerID = ownerID;
    this.event = event;
    this.beginSlot = beginSlot;
    this.endSlot = endSlot;
  }

  modBeginSlot(date) {
    this.beginSlot = date;
  }

  modEndSlot(date) {
    this.endSlot = date;
  }
}

export default Availability;
