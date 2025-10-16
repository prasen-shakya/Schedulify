// this is the file for the availability class and functions

class Availability {
    constructor(owner, event, beginSlot, endSlot) {
        this.owner = owner;
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
export default modBeginSlot;
export default modEndSlot;